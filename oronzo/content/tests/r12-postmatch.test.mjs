import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectConferenceQuestions,createPressConference,answerPressConference,PRESS_EFFECT_KEYS} from '../press-kit.js';

const catalog=JSON.parse(readFileSync(new URL('../press-postmatch.json',import.meta.url),'utf8'));
const added=catalog.questions.filter(q=>q.id.startsWith('q_r12_provincia_'));
const outcomes=['win','draw','loss'];

test('R12: twelve original contextual postmatch questions are valid and reachable',()=>{
 assert.equal(added.length,12);
 assert.equal(new Set(catalog.questions.map(q=>q.id)).size,catalog.questions.length);
 for(const result of outcomes){
  const specific=added.filter(q=>q.when?.result===result);
  assert.equal(specific.length,4);
  for(const q of specific){
   assert.equal(q.phase,'postmatch');
   assert.ok(q.text.length>25);
   assert.equal(q.answers.length,3);
   assert.equal(new Set(q.answers.map(a=>a.id)).size,3);
   for(const answer of q.answers){
    assert.ok(answer.label&&answer.text);
    assert.deepEqual(Object.keys(answer.effects).sort(),[...PRESS_EFFECT_KEYS].sort());
    assert.ok(Object.values(answer.effects).every(Number.isFinite));
   }
  }
  const seen=new Set();
  for(let seed=0;seed<1200;seed++){
   const questions=selectConferenceQuestions(catalog,'postmatch',{result},'r12-'+seed);
   assert.equal(questions.length,2);
   assert.equal(new Set(questions.map(q=>q.id)).size,2);
   for(const q of questions)if(q.id.startsWith('q_r12_provincia_'))seen.add(q.id);
  }
  for(const q of specific)assert.ok(seen.has(q.id),'unreachable '+q.id);
 }
});
test('R12: postmatch selection is deterministic for a stable career seed',()=>{
 for(const result of outcomes){
  const context={result};
  const first=selectConferenceQuestions(catalog,'postmatch',context,'same-seed');
  const second=selectConferenceQuestions(catalog,'postmatch',context,'same-seed');
  assert.deepEqual(first,second);
 }
});
