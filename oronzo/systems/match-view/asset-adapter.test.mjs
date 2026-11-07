import test from 'node:test';
import assert from 'node:assert/strict';
import {createAssetAdapter} from './asset-adapter.js';

function mockCanvas(){
  return {width:0,height:0,getContext(){return {
    drawImage(){},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)};},
    createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}
  };}};
}
test('asset adapter reads manifest frame positions for 8 directions (not guessed crop)',async()=>{
  const oldDoc=globalThis.document;globalThis.document={createElement:()=>mockCanvas()};
  try{
    const frames=Object.fromEntries(['N','NE','E','SE','S','SW','W','NW'].map((d,i)=>[
      d,[0,1,2,3].map(j=>({x:i*32,y:j*32,w:32,h:32,pivotX:16,pivotY:29}))]));
    const manifest={atlas:{width:256,height:128},actions:{run:{image:'run.png',mask:'run-mask.png',directions:frames,fps:9,loop:true}}};
    const adapter=createAssetAdapter({assetLoader:{
      loadJson:async url=>{if(String(url).includes('cutscenes'))throw Error('no scenes');return manifest;},
      loadImage:async()=>({width:256,height:128,naturalWidth:256,naturalHeight:128})
    }});
    await adapter.preload();
    const calls=[],ctx={drawImage:(...args)=>calls.push(args)};
    assert.equal(adapter.drawPlayer(ctx,{x:104,y:87,action:'run',direction:'W',frame:2,team:'home'}),true);
    assert.deepEqual(calls[0].slice(1),[192,64,32,32,88,58,32,32]);
    assert.equal(adapter.state.players,'ready');adapter.destroy();
  }finally{globalThis.document=oldDoc;}
});
test('broken manifests are isolated failures, never a fatal renderer exception',async()=>{
  const a=createAssetAdapter({assetLoader:{loadJson:async()=>{throw Error('missing')},loadImage:async()=>{throw Error('missing')}}});
  await a.preload();assert.equal(a.state.players,'failed');assert.equal(a.state.cutscenes,'failed');a.destroy();
});