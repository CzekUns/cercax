import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch} from '../match-engine.js';
import {makeFixture} from '../fixtures.js';
import {conditionFactor} from '../rng.js';

test('P1-001 facing uses radians: stationary E/W, moving vector, halftime reversal',()=>{
  const match=createMatch(makeFixture(42));
  const initial=match.snapshot();
  for(const p of initial.players){
    assert.equal(p.facing,p.teamId==='montevento'?0:Math.PI);
    assert.equal(p.vx,0);assert.equal(p.vy,0);
  }
  match.step(13);
  const moving=match.snapshot().players.filter(p=>Math.hypot(p.vx*105,p.vy*68)>.1);
  assert.ok(moving.length>3);
  for(const p of moving)assert.ok(Math.abs(p.facing-Math.atan2(p.vy*68,p.vx*105))<1e-8);
  match.step(2687);
  const second=match.snapshot();
  assert.equal(second.t,2700);
  assert.equal(second.players.find(p=>p.id==='montevento-0').facing,Math.PI);
  assert.equal(second.players.find(p=>p.id==='portoselva-0').facing,0);
  match.setPaused(true);
  const previous=match.snapshot();
  match.step(15);
  const paused=match.snapshot();
  assert.equal(paused.t,previous.t);
  assert.deepEqual(paused.players,previous.players);
  assert.deepEqual(paused.ball,previous.ball);
});

test('P1-003 fitness/health gradual, finite energy, decisions alter gameplay',()=>{
  const low=makeFixture(77),high=makeFixture(77);
  for(const p of low.homeClub.players){p.status.health=1;p.status.fitness=0;}
  for(const p of high.homeClub.players){p.status.health=100;p.status.fitness=100;}
  const a=createMatch(low),b=createMatch(high);
  assert.ok(a.snapshot().players.every(p=>Number.isFinite(p.energy)));
  assert.ok(b.snapshot().players.every(p=>Number.isFinite(p.energy)));
  assert.ok(a.snapshot().players[0].energy<b.snapshot().players[0].energy);
  assert.ok(conditionFactor(low.homeClub.players[0])<conditionFactor(high.homeClub.players[0]));
  a.step(120);b.step(120);
  assert.notDeepEqual(a.snapshot().players,b.snapshot().players);
  let variations=0;
  for(let s=0;s<6;s++){
    const x=makeFixture('decisions-'+s),y=makeFixture('decisions-'+s);
    for(const p of x.homeClub.players)p.technical.decisions=0;
    for(const p of y.homeClub.players)p.technical.decisions=100;
    const mx=createMatch(x),my=createMatch(y);
    mx.step(1800);my.step(1800);
    if(JSON.stringify(mx.getEventsSince())!==JSON.stringify(my.getEventsSince()))variations++;
  }
  assert.ok(variations>0,'technical.decisions must affect events');
});

test('P1-004 substitute goalkeeper: event in next step and authoritative cursor',()=>{
  const input=makeFixture('keeper-sub');
  input.homeClub.players[11].positions=['GK'];
  const match=createMatch(input);
  const cursor=match.getEventsSince().at(-1).id;
  const outId='montevento-0',inId='montevento-11';
  const result=match.command({type:'substitution',teamId:'montevento',payload:{outId,inId}});
  assert.equal(result.accepted,true);
  assert.ok(match.snapshot().players.some(p=>p.id===inId));
  assert.ok(!match.snapshot().players.some(p=>p.id===outId));
  const next=match.advanceRealSeconds(1/60);
  const changes=next.events.filter(e=>e.type==='substitution');
  assert.equal(changes.length,1);
  assert.equal(changes[0].detail.goalkeeper,true);
  assert.equal(changes[0].detail.outId,outId);
  assert.equal(changes[0].detail.inId,inId);
  match.step(1);
  assert.equal(match.snapshot().events.filter(e=>e.type==='substitution').length,0);
  assert.equal(match.getEventsSince(cursor).filter(e=>e.type==='substitution').length,1);
});

test('P1-004 separate command calls enqueue events once with unique ids',()=>{
  const match=createMatch(makeFixture('commands'));
  const last=match.getEventsSince().at(-1).id;
  assert.equal(match.command({type:'tacticChange',teamId:'montevento',payload:{pressing:87}}).accepted,true);
  assert.equal(match.command({type:'substitution',teamId:'montevento',
    payload:{outId:'montevento-10',inId:'montevento-11'}}).accepted,true);
  const step=match.step(1),pending=step.events.filter(e=>['substitution','tacticChange'].includes(e.type));
  assert.equal(pending.length,2);
  assert.equal(new Set(pending.map(e=>e.id)).size,2);
  assert.equal(match.getEventsSince(last).length,2);
  match.step(1);
  assert.equal(match.snapshot().events.filter(e=>e.type==='substitution').length,0);
});

test('P1-005 optional assist only for valid same-team pass without later turnover',()=>{
  let assisted=0,solo=0;
  for(let seed=0;seed<32;seed++){
    const match=createMatch(makeFixture(seed));match.step(5400);
    const events=match.getEventsSince();
    for(const goal of events.filter(e=>e.type==='goal')){
      const assist=goal.detail?.assistId;
      if(!assist){solo++;continue;}
      assisted++;
      assert.notEqual(assist,goal.playerId);
      const passes=events.filter(e=>e.id<goal.id && e.teamId===goal.teamId && e.type==='pass' &&
        e.playerId===assist && e.detail?.toId===goal.playerId && goal.t-e.t<=25);
      assert.ok(passes.length>0,'assisted goal needs a real teammate pass');
      const pass=passes.at(-1);
      const breaks=events.filter(e=>e.id>pass.id && e.id<goal.id).some(e=>
        ['foul','offside','halftime','kickoff','corner','throwin'].includes(e.type) ||
        (e.teamId!==goal.teamId &&
          (e.type==='interception' || (e.type==='tackle' && e.detail?.won===true))));
      assert.equal(breaks,false,'lost possession/stoppage must clear assist candidate');
    }
  }
  assert.ok(assisted>0);
  assert.ok(solo>0,'goals without assists must omit assistId');
});
