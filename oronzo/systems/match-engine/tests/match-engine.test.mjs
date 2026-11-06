import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatch } from '../match-engine.js';
import { makeFixture } from '../fixtures.js';

const start=(seed=19,options={})=>createMatch(makeFixture(seed,options));

test('22 starting footballers, one ball and legal normalized coordinates',()=>{
  const s=start().snapshot();
  assert.equal(s.players.length,22);
  assert.equal(s.players.filter(p=>p.hasBall).length,1);
  assert.equal(s.t,0);
  assert.equal(s.ball.ownerId,s.players.find(p=>p.hasBall).id);
  assert.equal(s.score.home+s.score.away,0);
  for(const p of s.players) {
    assert.ok(p.x>=0&&p.x<=1 && p.y>=0&&p.y<=1);
    assert.ok(p.energy>=0&&p.energy<=100);
  }
});

test('same seed, fixture, dt and commands give identical simulation',()=>{
  const a=start(177),b=start(177);
  for(const match of [a,b]) {
    match.step(600);
    assert.equal(match.command({type:'tacticChange',teamId:'montevento',payload:{formation:'3-5-2',tempo:82}}).accepted,true);
    match.step(900);
    assert.equal(match.command({type:'substitution',teamId:'montevento',payload:{outId:'montevento-10',inId:'montevento-11'}}).accepted,true);
    match.step(3900);
  }
  assert.deepEqual(a.snapshot(),b.snapshot());
  assert.deepEqual(a.getEventsSince(),b.getEventsSince());
});

test('partition of fixed simulated time does not alter result or event history',()=>{
  const a=start(86),b=start(86);
  a.step(5400);
  for(let i=0;i<5400;i+=13)b.step(Math.min(13,5400-i));
  assert.deepEqual(a.getEventsSince(),b.getEventsSince());
  assert.equal(a.snapshot().t,5400);
  assert.equal(b.snapshot().t,5400);
  assert.deepEqual(a.snapshot().score,b.snapshot().score);
});

test('90 minutes, halftime, final whistle and exact 90 real seconds at 1x',()=>{
  const m=start(71);
  m.advanceRealSeconds(45);
  assert.equal(m.snapshot().t,2700);
  assert.equal(m.snapshot().phase,'secondHalf');
  assert.equal(m.getEventsSince().filter(e=>e.type==='halftime').length,1);
  m.advanceRealSeconds(45);
  assert.equal(m.snapshot().t,5400);
  assert.equal(m.snapshot().minute,90);
  assert.equal(m.isFinished(),true);
  assert.equal(m.getEventsSince().filter(e=>e.type==='fulltime').length,1);
});

test('pause freezes all football state, speed affects real-time clock only',()=>{
  const m=start(5);
  m.setPaused(true);
  const frozen=m.snapshot();
  m.advanceRealSeconds(40);
  assert.equal(m.snapshot().t,frozen.t);
  assert.deepEqual(m.snapshot().score,frozen.score);
  m.setSpeed(4);
  m.setPaused(false);
  m.advanceRealSeconds(2);
  assert.equal(m.snapshot().t,480);
  assert.throws(()=>m.step(-1),/dt/);
  assert.throws(()=>m.setSpeed(3),/speed/);
});

test('score equals engine goal events and every goal has a prior shot',()=>{
  for(let seed=0;seed<10;seed++){
    const m=start(seed);m.step(5400);
    const s=m.snapshot(),es=m.getEventsSince();
    const goals=es.filter(e=>e.type==='goal');
    assert.equal(s.score.home,goals.filter(e=>e.teamId==='montevento').length);
    assert.equal(s.score.away,goals.filter(e=>e.teamId==='portoselva').length);
    assert.ok(es.some(e=>e.type==='shot'));
    assert.ok(es.some(e=>e.type==='pass'));
    assert.ok(goals.length<=es.filter(e=>e.type==='shot').length);
    assert.ok(es.every((e,i)=>i===0 || (e.id===es[i-1].id+1 && e.t>=es[i-1].t)));
    assert.ok(s.stats.home.shotsOnTarget<=s.stats.home.shots);
    assert.ok(s.stats.away.shotsOnTarget<=s.stats.away.shots);
  }
});

test('tactics change play in a deterministic sample of seeds',()=>{
  let different=0;
  for(let seed=0;seed<8;seed++){
    const a=start(seed);
    const b=start(seed);
    const result=b.command({type:'tacticChange',teamId:'montevento',
      payload:{formation:'3-5-2',mentality:91,pressing:92,tempo:91,width:75}});
    assert.equal(result.accepted,true);
    a.step(5400);b.step(5400);
    const describe=m=>JSON.stringify({score:m.snapshot().score,stats:m.snapshot().stats,
      goals:m.getEventsSince().filter(e=>e.type==='goal')});
    if(describe(a)!==describe(b))different++;
  }
  assert.ok(different>=4,'tactics must alter play for at least four of eight seeds');
});

test('substitutions obey 1985 default and reject invalid coach commands',()=>{
  const m=start(32);
  const club='montevento';
  const change=(outId,inId)=>m.command({type:'substitution',teamId:club,payload:{outId,inId}});
  assert.equal(change('montevento-10','montevento-11').accepted,true);
  assert.equal(m.snapshot().players.some(p=>p.id==='montevento-11'),true);
  assert.equal(m.snapshot().players.some(p=>p.id==='montevento-10'),false);
  assert.match(change('montevento-10','montevento-12').reason,/not on pitch/);
  assert.equal(change('montevento-9','montevento-12').accepted,true);
  assert.match(change('montevento-8','montevento-13').reason,/limit/);
  assert.match(m.command({type:'nonsense',teamId:club}).reason,/unsupported/);
  assert.match(m.command({type:'tacticChange',teamId:club,payload:{formation:'9-0-1'}}).reason,/formation/);
  assert.match(m.command({type:'shout',teamId:'invalid',payload:{tone:'push'}}).reason,/unknown team/);
});

test('shouts are accepted and have a cooldown',()=>{
  const m=start(42);
  assert.equal(m.command({type:'shout',teamId:'montevento',payload:{tone:'focus'}}).accepted,true);
  assert.match(m.command({type:'shout',teamId:'montevento',payload:{tone:'push'}}).reason,/cooldown/);
  m.step(121);
  assert.equal(m.command({type:'shout',teamId:'montevento',payload:{tone:'push'}}).accepted,true);
});

test('no mutation of MatchInputV1 and active players stay on pitch',()=>{
  const input=makeFixture('untouched'),original=JSON.stringify(input);
  const m=createMatch(input);
  for(let i=0;i<90;i++){
    m.step(60);
    const s=m.snapshot();
    assert.ok(s.players.length<=22 && s.players.length>=14);
    assert.ok(s.ball.x>=0&&s.ball.x<=1 && s.ball.y>=0&&s.ball.y<=1);
    assert.ok(s.players.every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1&&p.energy>=0&&p.energy<=100));
  }
  assert.equal(JSON.stringify(input),original);
});

test('invalid XIs, duplicate ids and non-finite dt fail explicitly',()=>{
  const missing=makeFixture(2);missing.homeXI.pop();
  assert.throws(()=>createMatch(missing),/11/);
  const m=start(2);
  assert.throws(()=>m.step(Infinity),/dt/);
  const bad=makeFixture(3);bad.awayClub.id=bad.homeClub.id;
  assert.throws(()=>createMatch(bad),/distinct/);
});

test('last event id yields an incremental, copy-safe event feed',()=>{
  const m=start(3);
  m.step(120);
  const log=m.getEventsSince();
  const last=log.at(-1).id;
  assert.deepEqual(m.getEventsSince(last),[]);
  log[0].type='tampered';
  assert.notEqual(m.getEventsSince()[0].type,'tampered');
  m.step(120);
  assert.ok(m.getEventsSince(last).every(e=>e.id>last));
});
