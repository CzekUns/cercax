import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp01,directionFromVector,resolveFacing,spriteAction,normalizeSnapshot,interpolateSnapshots,SnapshotInterpolator} from './interpolation.js';
import {createMatchView,projectPosition,sceneForEvent,OverlayEvents,LOGICAL_WIDTH,LOGICAL_HEIGHT} from './match-view.js';
import {makeFixtureSnapshot,fixturePlayers} from './fixture.js';

const frame=t=>makeFixtureSnapshot(t,t-3);
test('fixture produces 22 stable IDs, exactly two teams, 11 each, ball in bounds',()=>{
  for(const t of [0,600,2000,4700,5400]){
    const f=frame(t);assert.equal(f.players.length,22);
    assert.equal(new Set(f.players.map(p=>p.id)).size,22);
    assert.equal(f.players.filter(p=>p.teamId==='home').length,11);
    assert.equal(f.players.filter(p=>p.teamId==='away').length,11);
    for(const p of f.players){assert.ok(p.x>=0&&p.x<=1);assert.ok(p.y>=0&&p.y<=1);}
    assert.ok(f.ball.x>=0&&f.ball.x<=1);assert.ok(f.ball.y>=0&&f.ball.y<=1);
  }
});
test('normalization clamps out-of-pitch actors without changing input',()=>{
  const f=frame(100),original=f.players[0].x;f.players[0].x=-100;f.ball.y=5;
  const n=normalizeSnapshot(f);assert.equal(n.players[0].x,0);assert.equal(n.ball.y,1);assert.equal(original>=0,true);
  assert.equal(f.players[0].x,-100);assert.equal(f.ball.y,5);
  const invalid={...f,players:[f.players[0],f.players[0]]};assert.throws(()=>normalizeSnapshot(invalid),/Duplicate/);
});
test('direction indexes match Agent 1 manifest compass order',()=>{
  assert.deepEqual([[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]].map(([x,y])=>directionFromVector(x,y)),['N','NE','E','SE','S','SW','W','NW']);
  assert.equal(resolveFacing('west',1,0),'W');assert.equal(resolveFacing(Math.PI,0,0),'W');
  assert.equal(spriteAction('shoot'),'kick');assert.equal(spriteAction('tackle'),'tackle');assert.equal(spriteAction('save'),'keeper');
  assert.equal(spriteAction('unmark'),'run');assert.equal(spriteAction('idle',false,.5),'run');
});
test('interpolation uses IDs instead of array order; preserves events and score',()=>{
  const a=frame(10),b=frame(20);
  b.players.reverse();const atA=new Map(a.players.map(p=>[p.id,p]));
  const middle=interpolateSnapshots(a,b,.5);
  for(const p of middle.players){const before=atA.get(p.id),after=b.players.find(x=>x.id===p.id);assert.equal(p.x,(before.x+after.x)/2);}
  assert.strictEqual(middle.events,b.events);assert.strictEqual(middle.score,b.score);
});
test('wall-clock blend clamp, pause, resume and 8x do not invent match ticks',()=>{
  const i=new SnapshotInterpolator({simSecondsPerRealSecond:60});
  const a=frame(0),b=frame(30);i.push(a,0);i.push(b,200);
  const half=i.sample(450);assert.ok(half.players[9].x!==b.players[9].x);
  i.setPaused(true,450);const freezed=i.sample(5000);assert.equal(freezed.ball.x,half.ball.x);
  i.setPaused(false,5000);assert.equal(i.sample(5000).ball.x,half.ball.x);
  i.setSpeed(8,5010);assert.equal(i.speed,8);assert.equal(i.latest.t,30);
  assert.equal(i.sample(10000).ball.x,b.ball.x);
});
test('event mapping, duplicate suppression and cooldown',()=>{
  const o=new OverlayEvents({cooldownMs:600,durationMs:1200});
  assert.equal(sceneForEvent({type:'card',detail:{color:'red'}}),'red');
  assert.equal(sceneForEvent({type:'card',detail:'giallo'}),'yellow');
  o.ingest([{id:'1',type:'goal',t:200}],1000);assert.equal(o.active(1500).type,'goal');
  o.ingest([{id:'1',type:'goal',t:200}],1100);assert.equal(o.active(1100).since,1000);
  o.ingest([{id:'2',type:'goal',t:201}],1200);assert.equal(o.active(1200).since,1000);
  o.ingest([{id:'3',type:'save',t:220}],1250);assert.equal(o.active(1300).type,'save');
  assert.equal(o.active(4000),null);
});
test('resize and missing assets do not crash; destroy cancels frame loop',async()=>{
  const calls=[];
  const handler={get(_,key){if(key==='canvas')return {};if(key==='measureText')return()=>({width:0});return(...args)=>{calls.push([key,...args]);};}};
  const ctx=new Proxy({},handler),canvas={style:{},getContext:()=>ctx,width:0,height:0};
  let scheduled=0,cancelled=-1;
  const view=createMatchView(canvas,{assetLoader:{loadJson:async()=>{throw Error('deliberate missing asset fixture');}},
    config:{autoStart:false,requestFrame:()=>++scheduled,cancelFrame:id=>{cancelled=id},clock:()=>1000}});
  await view.ready;
  assert.equal(view.assets.state.players,'failed');
  assert.deepEqual(view.resize(),{width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT});
  view.render(frame(100));view.drawAt(1100);
  assert.ok(calls.some(x=>x[0]==='fillRect'));
  view.selectPlayer('H10');view.setSpeed(4);view.setPaused(true);
  view.destroy();assert.equal(view.destroyed,true);
  assert.equal(view.render(frame(200)),false);
});
test('field projection remains in 640x360 with controlled bounds',()=>{
  const a=projectPosition(-2,2),b=projectPosition(1,0);
  assert.ok(a.x>=0&&a.x<640&&a.y>=0&&a.y<360);
  assert.ok(b.x>=0&&b.x<640&&b.y>=0&&b.y<360);
});

test('same fixture snapshot and time are reproducible with no random motion',()=>{
  assert.deepEqual(makeFixtureSnapshot(1445,1440),makeFixtureSnapshot(1445,1440));
});

test('a goal overlay does not rewrite score, clock, possession or source data',()=>{
  const input=frame(2100),before=structuredClone(input),events=new OverlayEvents();
  events.ingest(input.events,100);assert.deepEqual(input,before);
  assert.equal(events.active(100)?.type,'goal');
});