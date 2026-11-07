import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatchView,projectPosition,LOGICAL_WIDTH,LOGICAL_HEIGHT} from './match-view.js';
import {makeFixtureSnapshot} from './fixture.js';
import {worldToScreen,ballWorldPosition} from './camera.js';
function mockCanvas(){
  const calls=[];
  const ctx=new Proxy({}, {get(_target,property){
    if(property==='imageSmoothingEnabled')return false;
    return (...args)=>{calls.push([property,...args]);};
  },set(){return true;}});
  return {canvas:{width:0,height:0,style:{},getContext:()=>ctx},calls};
}
function makeView(mode){
  const m=mockCanvas(),view=createMatchView(m.canvas,{
    assetLoader:{loadJson:async()=>{throw Error('asset unavailable in test');}},
    config:{autoStart:false,clock:()=>100,cameraMode:mode,showTechnicalFallbackLabel:true,
      homeTeamId:'home',awayTeamId:'away',keeperIds:['H0','A0']}
  });
  return {...m,view};
}
test('same 22-player snapshots in both cameras never alter score, IDs, coordinates or actions',async()=>{
  const f=makeView('full'),b=makeView('broadcast');await Promise.all([f.view.ready,b.view.ready]);
  for(const t of [0,90,830,2699,2700,4500,5399]){
    const source=makeFixtureSnapshot(t,t-100),original=structuredClone(source);
    f.view.render(source,100+t/6);b.view.render(source,100+t/6);
    assert.deepEqual(source,original);
    assert.deepEqual(f.view.interpolation.latest,b.view.interpolation.latest);
    assert.equal(f.view.interpolation.latest.players.length,22);
    assert.equal(f.view.interpolation.latest.score.home,original.score.home);
    assert.equal(b.view.interpolation.latest.ball.ownerId,original.ball.ownerId);
  }
  f.view.destroy();b.view.destroy();
});
test('TV camera transforms pitch only, full remains unchanged, overlays remain screen-space',async()=>{
  const f=makeView('full'),b=makeView('broadcast');await Promise.all([f.view.ready,b.view.ready]);
  const snap=makeFixtureSnapshot(500,400);
  f.view.render(snap,500);b.view.render(snap,500);
  assert.equal(f.view.cameraMode,'full');assert.equal(b.view.cameraMode,'broadcast');
  assert.equal(f.view.getCameraState().zoom,1);assert.equal(b.view.getCameraState().zoom,2);
  assert.ok(b.calls.some(x=>x[0]==='scale'&&x[1]===2&&x[2]===2));
  assert.ok(!f.calls.some(x=>x[0]==='scale'));
  assert.equal(b.canvas.width,LOGICAL_WIDTH);assert.equal(b.canvas.height,LOGICAL_HEIGHT);
  f.view.destroy();b.view.destroy();
});
test('switch camera at runtime and 800x360 / 844x390 resize preserves snapshot and world',async()=>{
  const m=makeView('full');await m.view.ready;
  const input=makeFixtureSnapshot(880,860);m.view.render(input,1000);
  const stateBefore=structuredClone(m.view.interpolation.latest);
  assert.equal(m.view.setCameraMode('broadcast'),'broadcast');m.view.drawAt(1020);
  const center=ballWorldPosition(m.view.interpolation.sample(1020).ball);
  const screen=worldToScreen(m.view.getCameraState(),center.x,center.y);
  assert.ok(screen.x>=0&&screen.x<=640&&screen.y>=0&&screen.y<=360);
  for(const [w,h] of [[640,360],[800,360],[844,390]]){
    m.canvas.style.width=w+'px';m.canvas.style.height=h+'px';
    assert.deepEqual(m.view.resize(),{width:640,height:360});
    assert.deepEqual(m.view.interpolation.latest,stateBefore);
  }
  assert.equal(m.view.setCameraMode('full'),'full');m.view.drawAt(1040);
  assert.equal(m.view.getCameraState().zoom,1);
  assert.throws(()=>m.view.setCameraMode('orbit'),/cameraMode/);
  m.view.destroy();
});
test('halftime and post-goal kickoff do not pan through the entire field',async()=>{
  const m=makeView('broadcast');await m.view.ready;
  const a=makeFixtureSnapshot(2699,2698),b=makeFixtureSnapshot(2700,2699);
  a.ball.x=.02;b.ball.x=.98;b.events=[{id:900,type:'halftime',t:2700},{id:901,type:'kickoff',t:2700}];
  m.view.render(a,1000);const first=m.view.getCameraState();
  m.view.render(b,1020);const second=m.view.getCameraState();
  assert.ok(second.cx>first.cx+100);assert.equal(m.view.interpolation.duration,0);
  assert.ok(worldToScreen(second,ballWorldPosition(b.ball).x,ballWorldPosition(b.ball).y).x>=0);
  m.view.destroy();
});
