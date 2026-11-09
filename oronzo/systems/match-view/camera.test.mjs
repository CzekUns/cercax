import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCamera,followCamera,cameraTransform,worldToScreen,fitLandscapeViewport,ballWorldPosition,validateCameraMode} from './camera.js';
const ball=(x,y)=>({x,y,height:0,ownerId:null});
const inView=(c,b)=>{const p=ballWorldPosition(b),s=worldToScreen(c,p.x,p.y);return s.x>=0&&s.x<=640&&s.y>=0&&s.y<=360;};

test('camera starts full field and preserves default identity transform',()=>{
  const c=followCamera(initialCamera(),ball(.9,.15),{now:2});
  assert.equal(c.mode,'full');assert.deepEqual(cameraTransform(c),{zoom:1,translateX:0,translateY:0});
});
test('broadcast uses zoom, clamp at all four corners and never loses the ball',()=>{
  for(const x of [0,.02,.33,.5,.92,1])for(const y of [0,.01,.36,.5,.94,1]){
    const c=followCamera(initialCamera(),ball(x,y),{mode:'broadcast',zoom:2,now:0});
    assert.ok(c.cx>=160&&c.cx<=480);assert.ok(c.cy>=90&&c.cy<=270);
    assert.ok(inView(c,ball(x,y)),`ball (${x},${y}) must be on-screen`);
    assert.ok(Math.abs(c.zoom-2)<1e-12);
  }
});
test('camera follows smoothly without overshooting or teleporting',()=>{
  const a=followCamera(initialCamera(),ball(.2,.5),{mode:'broadcast',now:0});
  const b=followCamera(a,ball(.75,.5),{mode:'broadcast',now:32});
  const target=followCamera(a,ball(.75,.5),{mode:'broadcast',cut:true,now:32});
  assert.ok(b.cx>a.cx);assert.ok(b.cx<target.cx);
  assert.ok(inView(b,ball(.75,.5)));
});
test('camera hard-cuts on halftime/restart and switching mode resets tracking',()=>{
  const left=followCamera(initialCamera(),ball(.02,.5),{mode:'broadcast',now:100});
  const cut=followCamera(left,ball(.98,.5),{mode:'broadcast',now:110,cut:true});
  assert.equal(cut.cx,480);
  const full=followCamera(cut,ball(.3,.7),{mode:'full',now:110});
  assert.deepEqual(cameraTransform(full),{zoom:1,translateX:0,translateY:0});
  assert.equal(followCamera(full,ball(.8,.4),{mode:'broadcast',now:120}).cx,480);
});
test('pausing freezes camera while the current ball stays within the image',()=>{
  const a=followCamera(initialCamera(),ball(.3,.3),{mode:'broadcast',now:1});
  const b=followCamera(a,ball(.3,.3),{mode:'broadcast',now:4000,paused:true});
  assert.equal(a.cx,b.cx);assert.equal(a.cy,b.cy);
  const c=followCamera(b,ball(.6,.3),{mode:'broadcast',now:4016});
  assert.ok(c.cx>=b.cx);assert.ok(inView(c,ball(.6,.3)));
});
test('fast ball movement after a large tick remains visible with bounded camera',()=>{
  let c=followCamera(initialCamera(),ball(.01,.04),{mode:'broadcast',now:0});
  for(let i=1;i<=120;i++){
    const b=ball(i%2?1:0,i%3?0:1);
    c=followCamera(c,b,{mode:'broadcast',now:i*16});
    assert.ok(inView(c,b));
  }
});
test('640x360, 800x360, 844x390 are letterboxed with unchanged 640x360 world',()=>{
  for(const [w,h] of [[640,360],[800,360],[844,390]]){
    const fit=fitLandscapeViewport(w,h);
    assert.ok(fit.displayWidth<=w+.000001&&fit.displayHeight<=h+.000001);
    assert.equal(fit.displayWidth/fit.displayHeight,640/360);
    assert.ok(fit.offsetX>=0&&fit.offsetY>=0);
  }
  assert.deepEqual(fitLandscapeViewport(640,360),{scale:1,displayWidth:640,displayHeight:360,offsetX:0,offsetY:0});
});
test('invalid camera modes, dimensions and zoom rejected',()=>{
  assert.throws(()=>validateCameraMode('orbit'),/cameraMode/);
  assert.throws(()=>initialCamera({zoom:.5}),/zoom/);
  assert.throws(()=>followCamera(initialCamera(),ball(0,0),{mode:'broadcast',zoom:8}),/zoom/);
  assert.throws(()=>fitLandscapeViewport(0,390),/viewport/);
});
