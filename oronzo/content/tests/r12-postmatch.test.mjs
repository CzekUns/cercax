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

test('R12: actual match press consequences persist after save/load and reject replay',async()=>{
 const {newGame,listInitialOffers,acceptOffer,answerOpeningPress,prepareMatch,tickMatch,consumeMatchResult,answerPostMatchPress}=await import('../../app/flow/controller.js');
 const {serialize,deserialize}=await import('../../systems/career/save.js');
 const {qaAvatar,qaMunicipalityCatalog}=await import('../../app/flow/tests/qa-geography.mjs');
 const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
 const press={opening:read('../press-opening.json'),postmatch:catalog,media:read('../press-media.json')};
 const leagueSizes={PROM:4,INTER:4,C2:4,C1:4,B:4,A:4};
 for(const seed of [1979,1980,1981]){
  const state=newGame({seed,avatar:qaAvatar,municipalityCatalog:qaMunicipalityCatalog(),leagueSizes});
  const offer=listInitialOffers(state).find(o=>o.divisionId==='PROM')||listInitialOffers(state)[0];
  assert.equal(acceptOffer(state,offer.id,{press}).accepted,true);
  for(const q of state.flow.press.opening.questions)
   assert.equal(answerOpeningPress(state,q.id,q.answers[0].id,{press}).accepted,true);
  const match=prepareMatch(state);assert.equal(match.accepted,true);
  tickMatch(match.engine,900);
  assert.equal(consumeMatchResult(state,match.engine,{press}).accepted,true);
  const questions=state.flow.press.postmatch.questions;
  assert.equal(questions.length,2);
  assert.ok(questions.some(q=>q.id.startsWith('q_r12_provincia_')||q.when===undefined),
   'real match must reach a contextual question or a legacy fallback');
  const first=questions[0],answer=first.answers[0];
  const result=answerPostMatchPress(state,first.id,answer.id,{press});
  assert.equal(result.accepted,true);
  const checkpoint=serialize(state);
  const restored=deserialize(checkpoint);
  assert.deepEqual(restored.flow.press.postmatch,state.flow.press.postmatch);
  assert.equal(answerPostMatchPress(restored,first.id,answer.id,{press}).accepted,false,
   'replayed press response must not apply effects twice');
  assert.equal(serialize(restored),checkpoint,'replay must not mutate persisted state');
  for(const q of questions.slice(1))
   assert.equal(answerPostMatchPress(restored,q.id,q.answers[0].id,{press}).accepted,true);
  assert.equal(restored.flow.press.postmatch.completed,true);
 }
});
