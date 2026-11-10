import test from 'node:test';
import assert from 'node:assert/strict';
import {recordCareerNarrativeR12} from '../career-narrative-r12.js';

function makeState({week=8,winStreak=0,lossStreak=0,results=[],cash=100000,boardTrust=70}={}){
 return {seed:1979,absoluteWeek:week,week,seasonYear:1979,
  coach:{clubId:'c1'},flow:{stage:'hub'},
  clubs:[{id:'c1',presidentId:'p1',budget:cash,finance:{cash},
   boardTrust,board:{winStreak,lossStreak,results}}]};
}
for(const [name,settings,category] of [
 ['three consecutive wins',{winStreak:3},'winning_run'],
 ['three consecutive losses',{lossStreak:3},'losing_run'],
 ['five undefeated fixtures',{results:Array.from({length:5},()=>({result:'draw'}))},'unbeaten_run'],
 ['final weeks',{week:35},'season_finale']
]){
 test(name+' is a persistent, playable provincial story',()=>{
  const state=makeState(settings);
  const issue=recordCareerNarrativeR12(state);
  assert.equal(issue.category,category);
  assert.equal(issue.options.length,2);
  assert.ok(issue.options.every(x=>x.id&&x.label&&Object.keys(x.effects).length));
  assert.equal(recordCareerNarrativeR12(state),null,'no duplicate within week');
  const restored=JSON.parse(JSON.stringify(state));
  assert.deepEqual(restored.flow.r12Narrative.issues[0],issue);
  assert.equal(recordCareerNarrativeR12(restored),null);
  assert.deepEqual(recordCareerNarrativeR12(makeState(settings)),issue,'seed deterministic');
 });
}
test('financial and board emergencies take priority over streaks',()=>{
 assert.equal(recordCareerNarrativeR12(makeState({winStreak:4,cash:100})).category,'debt');
 assert.equal(recordCareerNarrativeR12(makeState({lossStreak:4,boardTrust:25})).category,'pressure');
});
test('no fictional streak when fewer than three results',()=>{
 assert.equal(recordCareerNarrativeR12(makeState({winStreak:2})).category,'routine');
});
