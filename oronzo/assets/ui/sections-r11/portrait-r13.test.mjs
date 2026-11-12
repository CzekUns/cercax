import test from 'node:test';
import assert from 'node:assert/strict';
import {portraitParts,drawPortrait,portraitVariantCount} from './portrait-r13.js';
const kit={shirtA:'#315b9c',shirtB:'#f0e0cc',shirtPatternId:'vertical'};
const dna={skinToneId:2,hairColorId:3,faceVariantId:4,hairStyleId:'curly',facialHairStyleId:'moustache'};
test('R13-BIS: canonical PlayerV2 hair and facial hair mapping',()=>{
 const styles=['crop','side-part','wavy','curly','receding','buzz','long','bald'].map(x=>portraitParts({...dna,hairStyleId:x},kit).hair);
 assert.equal(new Set(styles).size,8);
 assert.equal(styles[7],-1); // bald, no fake colored head drawing
 assert.equal(portraitParts({...dna,facialHairStyleId:'shaved'},kit).facial,-1);
 assert.notEqual(portraitParts({...dna,facialHairStyleId:'moustache'},kit).facial,-1);
});
test('R13-BIS: DNA independent of current club',()=>{
 const a=portraitParts(dna,kit),b=portraitParts(dna,{shirtA:'#a42d33',shirtB:'#132e82',shirtPatternId:'halves'});
 for(const key of ['face','hair','facial','torso','skin','hairColor','facialColor'])assert.deepEqual(a[key],b[key],key);
 assert.notEqual(a.shirtA,b.shirtA);
 assert.notEqual(a.pattern,b.pattern);
});
test('R13-BIS: stable mapping and variation count',()=>{
 assert.deepEqual(portraitParts(dna,kit),portraitParts({...dna}, {...kit}));
 const faceIds=new Set(Array.from({length:8},(_,i)=>portraitParts({...dna,faceVariantId:i},kit).face));
 assert.equal(faceIds.size,8);assert.ok(portraitVariantCount>=20);
});
test('R13-BIS: no DOM/canvas available => safe fallback',async()=>{
 assert.equal(await drawPortrait(null,dna,kit),false);
});
