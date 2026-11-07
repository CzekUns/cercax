import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch} from './systems/match-engine/match-engine.js';
import {makeFixture} from './systems/match-engine/fixtures.js';
import {resolveFacing} from './systems/match-view/interpolation.js';
import {createEngineViewBridge} from './systems/match-view/match-view.js';

test('Partita rapida: 22 giocatori e un evento iniziale dal vero engine',()=>{
  const m=createMatch(makeFixture('quick-start'));
  const s=m.snapshot();
  assert.equal(s.players.length,22);
  assert.equal(s.players.filter(p=>p.teamId==='montevento').length,11);
  assert.equal(s.players.filter(p=>p.teamId==='portoselva').length,11);
  assert.deepEqual(s.score,{home:0,away:0});
  assert.ok(m.getEventsSince(0).some(e=>e.type==='kickoff'));
});

test('Partita rapida: il punteggio deriva solo da goal simulati',()=>{
  const m=createMatch(makeFixture('quick-fulltime'));
  m.step(5400);
  assert.equal(m.isFinished(),true);
  const goals=m.getEventsSince().filter(e=>e.type==='goal');
  assert.equal(m.snapshot().score.home,goals.filter(e=>e.teamId==='montevento').length);
  assert.equal(m.snapshot().score.away,goals.filter(e=>e.teamId==='portoselva').length);
  assert.equal(m.snapshot().t,5400);
});

test('Partita rapida: pausa, ripresa e velocità non falsano il clock',()=>{
  const m=createMatch(makeFixture('quick-clock'));
  m.setPaused(true);m.advanceRealSeconds(10);assert.equal(m.snapshot().t,0);
  m.setPaused(false);m.setSpeed(4);m.advanceRealSeconds(1);
  assert.equal(m.snapshot().t,240);
});

test('Partita rapida: il mister può ordinare tattica e sostituzione',()=>{
  const input=makeFixture('quick-commands'),m=createMatch(input);
  const tactic=m.command({type:'tacticChange',teamId:'montevento',payload:{mentality:80,pressing:75}});
  assert.equal(tactic.accepted,true,tactic.reason);
  const outId=input.homeXI[1],inId=input.homeBench[0];
  const sub=m.command({type:'substitution',teamId:'montevento',payload:{outId,inId}});
  assert.equal(sub.accepted,true,sub.reason);
  assert.equal(sub.effects.remaining,1);
  const snap=m.snapshot();
  assert.ok(snap.players.some(p=>p.id===inId));
  assert.ok(!snap.players.some(p=>p.id===outId));
});

test('Partita rapida: vista consuma feed persistente senza inventare eventi',()=>{
  const input=makeFixture('quick-bridge'),m=createMatch(input),calls=[];
  const view={
    setKeepers(ids){calls.push(['keepers',ids]);},
    render(snapshot){calls.push(['render',snapshot]);}
  };
  const bridge=createEngineViewBridge(m,view,{keeperIds:[input.homeXI[0],input.awayXI[0]]});
  const initial=bridge.sync(0);
  assert.ok(initial.events.some(e=>e.type==='kickoff'));
  assert.equal(bridge.sync(1).events.length,0);
  const res=m.command({type:'substitution',teamId:'montevento',
    payload:{outId:input.homeXI[1],inId:input.homeBench[0]}});
  assert.equal(res.accepted,true);
  assert.equal(bridge.sync(2).events.filter(e=>e.type==='substitution').length,1);
  assert.equal(bridge.sync(3).events.length,0);
  assert.ok(calls.some(([kind])=>kind==='render'));
});

test('Partita rapida: convenzione angoli in radianti per gli sprite',()=>{
  for(const [a,dir] of [[0,'E'],[Math.PI,'W'],[Math.PI/2,'S'],[-Math.PI/2,'N'],[1,'SE'],[-1,'NE']]){
    assert.equal(resolveFacing(a),dir);
  }
});
