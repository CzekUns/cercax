import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatchView} from './match-view.js';
import {makeFixtureSnapshot} from './fixture.js';

function fallbackView() {
  const ctx=new Proxy({}, {get(_o,k){return k==='canvas'?{}:()=>{}},set(){return true}});
  return createMatchView({style:{},getContext:()=>ctx},{
    assetLoader:{loadJson:async()=>{throw Error('expected in Node test');}},
    config:{autoStart:false,clock:()=>1000,homeTeamId:'home',awayTeamId:'away'}
  });
}
test('R04 browser regression: replay rewind clears stale goal overlay',async()=>{
  const v=fallbackView();await v.ready;
  const goal=makeFixtureSnapshot(2000,1999);
  goal.events=[{id:100,type:'goal',t:2000,playerId:'H10'}];
  v.render(goal,1000);
  assert.equal(v.overlay.active(1001)?.type,'goal');
  const earlier=makeFixtureSnapshot(800,799);earlier.events=[];
  v.render(earlier,1010);
  assert.equal(v.interpolation.latest.t,800);
  assert.equal(v.overlay.active(1011),null,'must not paint a prior GOAL over replay');
  v.drawAt(1011);v.destroy();
});
test('R04 camera toggle preserves authoritative snapshot and score',async()=>{
  const v=fallbackView();await v.ready;
  const s=makeFixtureSnapshot(1700,1699),source=structuredClone(s);
  v.render(s,1000);const before=structuredClone(v.interpolation.latest);
  v.setCameraMode('broadcast');v.drawAt(1016);
  assert.deepEqual(v.interpolation.latest,before);
  assert.equal(v.getCameraState().zoom,2);
  v.setCameraMode('full');v.drawAt(1032);
  assert.equal(v.getCameraState().zoom,1);
  assert.deepEqual(s,source);v.destroy();
});
test('R04 paused TV frame holds ball and camera position',async()=>{
  const v=fallbackView();await v.ready;
  v.setCameraMode('broadcast');v.render(makeFixtureSnapshot(1900,1899),1000);
  v.drawAt(1016);v.setPaused(true,1016);
  v.drawAt(1050);const first=v.getCameraState(),ball=v.interpolation.sample(1050).ball;
  v.drawAt(1500);const second=v.getCameraState();
  assert.equal(first.cx,second.cx);assert.equal(first.cy,second.cy);
  assert.deepEqual(v.interpolation.sample(1500).ball,ball);
  v.setPaused(false,1500);v.destroy();
});
