import test from 'node:test';
import assert from 'node:assert/strict';
import {drawPortrait,portraitVariantCount} from './portrait-r13.js';
function mock(){
 const pixels=[];const ctx={fillStyle:'',imageSmoothingEnabled:true,
 fillRect(x,y,w,h){pixels.push([x,y,w,h,this.fillStyle]);},
 clearRect(){},save(){},restore(){},scale(){}};
 return {canvas:{width:0,height:0,getContext(){return ctx;}},pixels};
}
test('R13 portrait: 20 deterministic saved identities, distinct visible marks',()=>{
 const variants=new Set();
 for(let i=0;i<20;i++){
  const appearance={skinToneId:i%8,hairColorId:(i*3)%8,faceVariantId:i%4,hairStyleId:i%5,facialHairStyleId:Math.floor(i/4)%5};
  const a=mock(),b=mock();
  assert.equal(drawPortrait(a.canvas,appearance,{shirtA:'#254f9a',shirtB:'#f7f3dd',shirtPatternId:'vertical'}),true);
  assert.equal(drawPortrait(b.canvas,appearance,{shirtA:'#254f9a',shirtB:'#f7f3dd',shirtPatternId:'vertical'}),true);
  assert.deepEqual(a.pixels,b.pixels);
  assert.equal(a.canvas.width,112);assert.equal(a.canvas.height,112);
  variants.add(JSON.stringify(a.pixels));
 }
 assert.equal(variants.size,20);
 assert.ok(portraitVariantCount>=20);
});
test('R13 portrait: transfer changes shirt, preserves face geometry and skin',()=>{
 const appearance={skinToneId:3,hairColorId:6,faceVariantId:2,hairStyleId:3,facialHairStyleId:4};
 const a=mock(),b=mock();
 drawPortrait(a.canvas,appearance,{shirtA:'#2255aa'});
 drawPortrait(b.canvas,appearance,{shirtA:'#aa2222'});
 assert.notDeepEqual(a.pixels,b.pixels);
 assert.deepEqual(a.pixels.filter(x=>x[1]<43),b.pixels.filter(x=>x[1]<43));
});
test('R13 portrait: missing canvas is a safe no-op',()=>assert.equal(drawPortrait(null),false));
