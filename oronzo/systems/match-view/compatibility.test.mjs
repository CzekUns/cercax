import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveFacing, normalizeEnergy, normalizeSnapshot, SnapshotInterpolator} from './interpolation.js';
import {createEngineViewBridge, createMatchView} from './match-view.js';
import {makeFixtureSnapshot} from './fixture.js';

function snapshot(t,{phase=t>=2700?'secondHalf':'firstHalf',events=[],homeX=.05,awayX=.95,ballX=.5,score={home:0,away:0}}={}) {
  const base=makeFixtureSnapshot(t,t-1);
  base.t=t;base.phase=phase;base.events=events;base.score=score;
  base.players[0].x=homeX;base.players[0].facing=0;base.players[0].vx=0;base.players[0].vy=0;
  base.players[11].x=awayX;base.players[11].facing=Math.PI;base.players[11].vx=0;base.players[11].vy=0;
  base.ball.x=ballX;
  return base;
}
const mockView=()=>({
  calls:[],setKeepers(ids){this.calls.push(['keepers',ids]);},
  render(s,now){this.calls.push(['render',s,now]);}
});

test('ORZ-P1-009: Agent 6 numeric facing values are radians, including +/-1',()=>{
  assert.equal(resolveFacing(0,0,0),'E');
  assert.equal(resolveFacing(Math.PI,0,0),'W');
  assert.equal(resolveFacing(Math.PI/2,0,0),'S');
  assert.equal(resolveFacing(-Math.PI/2,0,0),'N');
  assert.equal(resolveFacing(1,0,0),'SE');
  assert.equal(resolveFacing(-1,0,0),'NE');
  assert.equal(resolveFacing(null,0,0,'NW'),'NW');
  assert.equal(resolveFacing({radians:1},0,0),'SE');
});
test('ORZ-P1-001: Agent 1 compass directions match every vector quadrant',()=>{
  const vectors=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
  const labels=['N','NE','E','SE','S','SW','W','NW'];
  for(let i=0;i<8;i++){
    assert.equal(resolveFacing({x:vectors[i][0],y:vectors[i][1]}),labels[i]);
    assert.equal(resolveFacing(labels[i].toLowerCase()),labels[i]);
  }
});
test('ORZ-P1-002: kickoff at halftime snaps both goalkeepers and ball',()=>{
  const i=new SnapshotInterpolator();
  const before=snapshot(2699,{homeX:.05,awayX:.95,ballX:.16});
  const after=snapshot(2700,{homeX:.95,awayX:.05,ballX:.5,
    events:[{id:24,t:2700,type:'halftime'},{id:25,t:2700,type:'kickoff'}]});
  i.push(before,1000);i.push(after,1100);
  assert.equal(i.duration,0);
  assert.equal(i.sample(1100).players[0].x,.95);
  assert.equal(i.sample(1100).players[11].x,.05);
  assert.equal(i.sample(1100).ball.x,.5);
  i.setPaused(true,1100);assert.equal(i.sample(4000).ball.x,.5);
  i.setPaused(false,4000);i.setSpeed(8,4000);
  assert.equal(i.sample(4000).players[0].x,.95);
});
test('ORZ-P1-002: goal restart kickoff also snaps ball (same half)',()=>{
  const i=new SnapshotInterpolator(),score={home:1,away:0};
  i.push(snapshot(1120,{ballX:.93}),200);
  const restart=snapshot(1121,{ballX:.5,score,events:[
    {id:4,t:1121,type:'goal',playerId:'H9'},
    {id:5,t:1121,type:'kickoff'}]});
  i.push(restart,220);
  assert.equal(i.sample(221).ball.x,.5);
  assert.deepEqual(i.sample(221).score,score);
});
test('ORZ-P1-002: phase changes without kickoff still cause a hard cut',()=>{
  const i=new SnapshotInterpolator();
  i.push(snapshot(2699,{homeX:.05}),100);
  i.push(snapshot(2700,{phase:'secondHalf',homeX:.95,events:[]}),116);
  assert.equal(i.sample(116).players[0].x,.95);
});
test('ORZ-P1-002: regular movement is still interpolated',()=>{
  const i=new SnapshotInterpolator();
  i.push(snapshot(1,{homeX:.1}),100);
  i.push(snapshot(20,{homeX:.3,ballX:.7}),200);
  assert.ok(i.duration>0);
  assert.ok(i.sample(350).players[0].x>.1 && i.sample(350).players[0].x<.3);
});
test('ORZ-P2-001: percent energy 0..100 converts to normalized 0..1',()=>{
  assert.equal(normalizeEnergy(0),0);
  assert.equal(normalizeEnergy(1),.01);
  assert.equal(normalizeEnergy(50),.5);
  assert.equal(normalizeEnergy(100),1);
  assert.equal(normalizeEnergy(150),1);
  assert.equal(normalizeEnergy(-10),0);
  assert.equal(normalizeEnergy(undefined),1);
  const s=snapshot(70);
  s.players[0].energy=1;s.players[1].energy=65;
  const n=normalizeSnapshot(s);
  assert.equal(n.players[0].energy,.01);
  assert.equal(n.players[1].energy,.65);
  assert.equal(s.players[1].energy,65);
});
test('ORZ-P1-004: bridge reads persistent cursor once, recovers missed command substitution',()=>{
  const events=[{id:1,t:0,type:'kickoff'},
    {id:2,t:120,type:'substitution',teamId:'home',playerId:'HB',detail:{outId:'HGK',inId:'HB'}}];
  const getters=[],view=mockView();
  let source=snapshot(120);
  source.players[0].id='HB';source.events=[]; // command event lost from tick-only snapshot
  const engine={snapshot:()=>source,getEventsSince(id){getters.push(id);return events.filter(e=>e.id>id);}};
  const bridge=createEngineViewBridge(engine,view,{keeperIds:['HGK','AGK']});
  const first=bridge.sync(500);
  assert.deepEqual(getters,[0]);
  assert.deepEqual(first.events.map(e=>e.id),[1,2]);
  assert.equal(first.lastEventId,2);
  assert.deepEqual(bridge.keeperIds,['AGK','HB']);
  assert.deepEqual(view.calls.at(-1)[1].events,first.events);
  assert.ok(view.calls.some(([key,ids])=>key==='keepers' && ids.includes('HB')));
  const second=bridge.sync(520);
  assert.deepEqual(getters,[0,2]);
  assert.deepEqual(second.events,[]);
  assert.deepEqual(view.calls.at(-1)[1].events,[]);
});
test('ORZ-P1-004: duplicate tick events never leak back into authoritative event feed',()=>{
  const view=mockView();
  const event={id:12,t:450,type:'goal'};
  const s=snapshot(450,{events:[event]});
  const engine={snapshot:()=>s,getEventsSince(id){return id<12?[event]:[];}};
  const bridge=createEngineViewBridge(engine,view,{initialEventId:11});
  assert.deepEqual(bridge.sync().events,[event]);
  assert.deepEqual(bridge.sync().events,[]);
  bridge.reset(11);
  assert.deepEqual(bridge.sync().events,[event]);
});
test('ORZ-P1-004: direct render updates goalkeeper set from substitution events',async()=>{
  const ctx=new Proxy({}, {get(_target,key){return key==='canvas'?{}:(()=>{});}});
  const canvas={style:{},getContext:()=>ctx};
  const view=createMatchView(canvas,{assetLoader:{loadJson:async()=>{throw Error('expected missing asset');}},
    config:{autoStart:false,clock:()=>100,keeperIds:['HGK','AGK']}});
  await view.ready;
  const s=snapshot(120,{events:[{id:4,type:'substitution',detail:{outId:'HGK',inId:'HNEW'}}]});
  view.render(s,100);
  assert.deepEqual(view.getKeeperIds(),['AGK','HNEW']);
  view.destroy();
});
