import test from 'node:test';
import assert from 'node:assert/strict';
import {recordCareerNarrativeR12,decideCareerNarrativeR12} from '../career-narrative-r12.js';

function makeState({week=8,winStreak=0,lossStreak=0,results=[],cash=100000,boardTrust=70}={}){
 return {seed:1979,absoluteWeek:week,week,seasonYear:1979,
  coach:{clubId:'c1'},flow:{stage:'hub'},
  clubs:[{id:'c1',presidentId:'p1',budget:cash,finance:{cash,settledWeeks:[],transactions:[]},
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

test('missing or invalid outcomes cannot create a five-match unbeaten run',()=>{
 const results=[{result:'win'},{result:'draw'},{result:'win'},{result:'draw'},{}];
 assert.notEqual(recordCareerNarrativeR12(makeState({results})).category,'unbeaten_run');
});
test('choice changes actual Coach09 state, survives reload and cannot be applied twice',()=>{
 const state=makeState({winStreak:3});
 state.coach.morale=50;
 state.clubs[0].players=[{id:'player-1',mental:{morale:50}}];
 state.clubs[0].board={...state.clubs[0].board,eventsUsed:{},notices:[],promises:[],lastMatchIds:[],weeksUnderPressure:0};
 const item=recordCareerNarrativeR12(state);
 const initial=state.clubs[0].boardTrust;
 const out=decideCareerNarrativeR12(state,item.id,'protect');
 assert.equal(out.accepted,true,JSON.stringify(out));
 assert.equal(state.clubs[0].boardTrust,initial+1);
 assert.equal(state.clubs[0].players[0].mental.morale,51);
 const restored=JSON.parse(JSON.stringify(state));
 assert.equal(restored.flow.r12Narrative.issues[0].selected.id,'protect');
 assert.equal(decideCareerNarrativeR12(restored,item.id,'protect').accepted,false);
 assert.equal(restored.clubs[0].boardTrust,initial+1);
 assert.equal(restored.clubs[0].players[0].mental.morale,51);
});

for(const [name,results,realResult,category] of [
 ['three draws',[{result:'draw'},{result:'draw'},{result:'draw'}],'draw','draw_run'],
 ['recovery after two losses',[{result:'loss'},{result:'loss'},{result:'win'}],'victory','recovery'],
 ['first victory',[{result:'win'}],'victory','first_win']
]){
 test(name+' produces a deterministic interactive event',()=>{
  const state=makeState({results});
  const issue=recordCareerNarrativeR12(state,{realResult});
  assert.equal(issue.category,category);
  assert.equal(issue.options.length,2);
  assert.ok(issue.options.every(x=>x.label&&x.id&&Object.keys(x.effects).length));
  assert.equal(recordCareerNarrativeR12(state,{realResult}),null);
  assert.deepEqual(recordCareerNarrativeR12(makeState({results}),{realResult}),issue);
  const restored=JSON.parse(JSON.stringify(state));
  assert.deepEqual(restored.flow.r12Narrative.issues[0],issue);
 });
}
test('recovery requires an actual win and two immediately previous losses',()=>{
 assert.notEqual(recordCareerNarrativeR12(makeState({results:[{result:'loss'},{result:'draw'},{result:'win'}]}),{realResult:'victory'}).category,'recovery');
 assert.notEqual(recordCareerNarrativeR12(makeState({results:[{result:'loss'},{result:'loss'},{result:'win'}]}),{realResult:'draw'}).category,'recovery');
});
test('first win choice is applied once through Coach09 and persists',()=>{
 const state=makeState({results:[{result:'win'}]});
 state.coach.morale=50;
 state.clubs[0].players=[{id:'player-1',mental:{morale:50}}];
 state.clubs[0].board={...state.clubs[0].board,eventsUsed:{},notices:[],promises:[],lastMatchIds:[],weeksUnderPressure:0};
 const issue=recordCareerNarrativeR12(state,{realResult:'victory'});
 const before=state.clubs[0].boardTrust;
 const result=decideCareerNarrativeR12(state,issue.id,'share');
 assert.equal(result.accepted,true,JSON.stringify(result));
 assert.equal(state.clubs[0].boardTrust,before+1);
 const restored=JSON.parse(JSON.stringify(state));
 assert.equal(restored.flow.r12Narrative.issues[0].selected.id,'share');
 assert.equal(decideCareerNarrativeR12(restored,issue.id,'share').accepted,false);
 assert.equal(restored.clubs[0].boardTrust,before+1);
});
