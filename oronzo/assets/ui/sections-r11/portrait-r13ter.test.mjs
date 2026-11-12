import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {portraitParts,drawPortrait,PORTRAIT_WIDTH,PORTRAIT_HEIGHT} from './portrait-r13.js';
const kit={shirtA:'#171f2a',shirtB:'#f1f1eb',shirtPatternId:'vertical'};
const base={skinToneId:2,hairColorId:4,facialHairColorId:3,faceVariantId:7,hairStyleId:'curly',facialHairStyleId:'full-beard'};

test('R13-TER: compatible, persistent appearance DNA across JSON roundtrip',()=>{
 const saved=JSON.parse(JSON.stringify(base));
 assert.deepEqual(portraitParts(saved,kit),portraitParts(base,kit));
 assert.deepEqual([PORTRAIT_WIDTH,PORTRAIT_HEIGHT],[128,160]);
 assert.equal(portraitParts({...base,hairStyleId:'bald'},kit).hair,-1);
 assert.equal(portraitParts({...base,facialHairStyleId:'shaved'},kit).facial,-1);
});

test('R13-TER: transfer changes only kit and never saved face/hair/beard/skin',()=>{
 const first=portraitParts(base,kit);
 const second=portraitParts(base,{shirtA:'#bc242a',shirtB:'#fdf4e6',shirtPatternId:'halves'});
 for(const key of ['face','hair','facial','skin','hairColor','facialColor','torso'])assert.equal(first[key],second[key],key);
 assert.notEqual(first.shirtA,second.shirtA);
 assert.notEqual(first.pattern,second.pattern);
});

test('R13-TER: all facial/head combinations return stable indices',()=>{
 for(let face=0;face<8;face++)for(let cut=0;cut<12;cut++)for(let beard=0;beard<8;beard++){
  const p=portraitParts({...base,faceVariantId:face,hairStyleId:cut,facialHairStyleId:beard},kit);
  assert.equal(p.face,face);
  assert.equal(p.hair,cut);
  assert.equal(p.facial,beard);
 }
});

test('R13-TER: renderer remains raster-only, failed DOM API does not throw',async()=>{
 const js=readFileSync(new URL('./portrait-r13.js',import.meta.url),'utf8');
 assert.doesNotMatch(js,/\.fillRect\(|createElement\(['"]svg['"]\)/);
 assert.match(js,/fitFacialHair/);
 assert.match(js,/__r13Token/);
 assert.equal(await drawPortrait(null,base,kit),false);
});
