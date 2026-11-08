import test from 'node:test';
import assert from 'node:assert/strict';
import {attachSourcedPlayers,chooseM1Training,settleM1Training,issueM1Command,
  minutesByEngineEvents,settleM1MatchLoad,journalM1Shouts,settleM1Season,
  ensureM1Ledger} from '../m1-contract.js';
const copy=x=>JSON.parse(JSON.stringify(x));
const build=()=>({seed:87,seasonYear:1979,absoluteWeek:1,
  coach:{id:'coach',clubId:'PROM-01',morale:50,gameOver:null,origin:{regionId:'campania',macroRegion:'south'},
    traits:{leadership:70},tactics:{tempo:45}},
  clubs:[{id:'PROM-01',players:Array.from({length:16},(_,i)=>({id:'PROM-01:P'+(i+1),teamId:'PROM-01',
    positions:[i<2?'GK':'MF'],name:'Fixture'+i,contract:{weeklyWage:12000},
    technical:{passing:40},status:{fatigue:10,fitness:75},relationships:{coachTrust:50}}))}],
  flow:{stage:'hub',acceptedOfferId:null,pendingMatch:null}});
const surnames=Array.from({length:500},(_,i)=>({id:'s'+i,name:'Surname'+i}));
const source={sourceId:'bergamo-2021-italiani-cc0',version:'m1',license:'CC0 1.0',surnames};
const sourceSquads=state=>Object.fromEntries(state.clubs.map(c=>[c.id,c.players.map((p,i)=>({id:'08-new-'+i,
  teamId:c.id,positions:p.positions,name:'New'+i+' '+surnames[i].name,
  surname:surnames[i].name,surnameId:surnames[i].id,origin:null,
  relationships:{coachTrust:30+i}}))]));
const normalizePlayer=p=>copy(p);
const chooseTrainingPlan=(coach,{week,focus,intensity})=>({accepted:true,coach:{...coach,trainingPlan:{week,focus,intensity}}});
const applyTrainingWeek=(players,plan,opts)=>({players:players.map(p=>({...p,
  technical:{...p.technical,passing:p.technical.passing+0.2},
  status:{...p.status,fatigue:p.status.fatigue+5}})),incidents:[],report:{plan,week:opts.week,averageFatigue:15}});
const matchLoad=(players,minutes)=>players.map(p=>({...p,status:{...p.status,fatigue:p.status.fatigue+(minutes[p.id]??0)/9}}));
const advanceSeason=(players)=>players.map(p=>({...p,age:(p.age??23)+1}));
test('500 sourced surnames bind by existing Career07 ID with contracts and trust preserved',()=>{
 const s=build();s.flow.stage='offers';s.coach.clubId=null;const wrong={...source,surnames:source.surnames.slice(0,499)};
 const early=copy(s);assert.equal(attachSourcedPlayers(s,{squadsByClub:sourceSquads(s),dataset:wrong,normalizePlayer}).reason,'verified_surname_catalog_required');
 assert.deepEqual(s,early);
 const result=attachSourcedPlayers(s,{squadsByClub:sourceSquads(s),dataset:source,normalizePlayer});
 assert.equal(result.accepted,true);assert.equal(result.players,16);
 assert.equal(s.clubs[0].players[0].id,'PROM-01:P1');
 assert.equal(s.clubs[0].players[0].sourcePlayerId,'08-new-0');
 assert.equal(s.clubs[0].players[0].surnameId,'s0');
 assert.equal(s.clubs[0].players[0].relationships.coachTrust,30);
 assert.equal(s.clubs[0].players[0].contract.weeklyWage,12000);
 assert.equal(attachSourcedPlayers(s,{squadsByClub:sourceSquads(s),dataset:source,normalizePlayer}).reason,'already_attached');
 const loaded=copy(s);assert.deepEqual(loaded.clubs,s.clubs);assert.deepEqual(loaded.flow.m1.playerDataset,s.flow.m1.playerDataset);
});
test('surname mismatch throws without altering roster and no fake origin',()=>{
 const s=build();s.flow.stage='offers';s.coach.clubId=null;const sq=sourceSquads(s);sq['PROM-01'][0].surname='not sourced';
 const initial=copy(s);
 assert.throws(()=>attachSourcedPlayers(s,{squadsByClub:sq,dataset:source,normalizePlayer}),/SOURCED_PLAYER_MISMATCH/);
 assert.deepEqual(s.clubs,initial.clubs);
});
test('choose 09 plan and commit real 08 training port exactly once per absolute week',()=>{
 const s=build();const bad=chooseM1Training(s,{plan:'gym',expectedAbsoluteWeek:1,chooseTrainingPlan});
 assert.equal(bad.reason,'invalid_training_plan');
 const v=chooseM1Training(s,{plan:'technical',intensity:60,expectedAbsoluteWeek:1,chooseTrainingPlan});
 assert.equal(v.accepted,true);assert.equal(s.coach.trainingPlan.focus,'technique');
 assert.equal(chooseM1Training(s,{plan:'rest',expectedAbsoluteWeek:1,chooseTrainingPlan}).reason,'already_planned');
 const result=settleM1Training(s,{applyTrainingWeek});
 assert.equal(result.accepted,true);assert.equal(s.clubs[0].players[0].status.fatigue,15);
 assert.equal(s.clubs[0].players[0].technical.passing,40.2);
 assert.equal(settleM1Training(s,{applyTrainingWeek}).accepted,false);
 s.absoluteWeek=2;assert.equal(chooseM1Training(s,{plan:'rest',expectedAbsoluteWeek:1,chooseTrainingPlan}).reason,'stale_week_action');
 assert.equal(chooseM1Training(s,{plan:'rest',expectedAbsoluteWeek:2,chooseTrainingPlan}).accepted,true);
 assert.equal(settleM1Training(s,{applyTrainingWeek}).accepted,true);
 assert.deepEqual(s.flow.m1.training.appliedWeeks,[1,2]);
 const reloaded=copy(s);assert.equal(settleM1Training(reloaded,{applyTrainingWeek}).reason,'no_training_selected');
});
test('engine 06 commands log only accepted results and reject replay/cooldown',()=>{
 const s=build();s.flow.stage='pre_match';s.flow.pendingMatch={fixtureId:'fx1',homeId:'PROM-01',awayId:'PROM-02'};
 const commands=[],events=[];let accepted=0;
 const engine={getEventsSince:id=>events.filter(e=>e.id>id),command:cmd=>{
   commands.push(cmd);if(cmd.type==='shout'&&cmd.payload.tone==='harsh')return{accepted:false,reason:'cooldown'};
   events.push({id:++accepted,t:100,type:cmd.type==='shout'?'coach_shout':'tacticChange',teamId:cmd.teamId,playerId:cmd.payload.targetPlayerId,
     detail:{temporaryOwner:'match-engine-06',persistentSuggestion:{playerTrustDelta:1}}});return {accepted:true,effects:{}};}};
 assert.equal(issueM1Command(s,engine,{requestId:'x',type:'individualShout',tone:'foo',targetPlayerId:'PROM-01:P3'}).reason,'unsupported_tone');
 const ok=issueM1Command(s,engine,{requestId:'A',type:'individualShout',tone:'gentle',targetPlayerId:'PROM-01:P3'});
 assert.equal(ok.accepted,true);assert.equal(commands[0].payload.tone,'encourage');
 assert.equal(ok.events[0].type,'coach_shout');
 assert.equal(issueM1Command(s,engine,{requestId:'A',type:'individualShout',tone:'gentle',targetPlayerId:'PROM-01:P3'}).reason,'already_sent');
 assert.equal(commands.length,1);
 assert.equal(issueM1Command(s,engine,{requestId:'B',type:'individualShout',tone:'hard',targetPlayerId:'PROM-01:P3'}).reason,'cooldown');
 assert.equal(s.flow.m1.matchCommands.B,undefined);
 const subs=issueM1Command(s,engine,{requestId:'C',type:'substitution',payload:{outId:'PROM-01:P3',inId:'PROM-01:P4'}});
 assert.equal(subs.accepted,true);
 assert.equal(issueM1Command(s,engine,{requestId:'D',type:'tacticChange',payload:{formation:'4-3-3'}}).accepted,true);
});
test('minute accounting honors actual 06 substitutions, match load never duplicates',()=>{
 const s=build(),xi=s.clubs[0].players.slice(0,11).map(p=>p.id);
 const events=[{type:'substitution',teamId:'PROM-01',t:1800,detail:{outId:xi[2],inId:'PROM-01:P12'}}];
 const minutes=minutesByEngineEvents(xi,events,'PROM-01');
 assert.equal(minutes[xi[2]],30);assert.equal(minutes['PROM-01:P12'],60);assert.equal(minutes[xi[3]],90);
 const first=settleM1MatchLoad(s,{fixtureId:'fx1',teamId:'PROM-01',startingXI:xi,events,applyMatchLoad:matchLoad});
 assert.equal(first.accepted,true);assert.equal(s.clubs[0].players[2].status.fatigue,13.333333333333334);
 const previous=copy(s);assert.equal(settleM1MatchLoad(s,{fixtureId:'fx1',teamId:'PROM-01',startingXI:xi,events,applyMatchLoad:matchLoad}).reason,'already_applied');
 assert.deepEqual(s,previous);
});
test('shout permanent suggestion is pending until 09 port confirms; no temporary bonus duplications',()=>{
 const s=build();const e={id:4,t:200,type:'coach_shout',teamId:'PROM-01',playerId:'PROM-01:P3',detail:{temporaryOwner:'match-engine-06',persistentSuggestion:{playerTrustDelta:2,coachMoraleDelta:0}}};
 const a=journalM1Shouts(s,{fixtureId:'f1',events:[e]});assert.equal(a.pending,1);
 assert.equal(s.clubs[0].players[2].relationships.coachTrust,50);
 assert.equal(journalM1Shouts(s,{fixtureId:'f1',events:[e]}).recorded,0);
 assert.equal(Object.keys(s.flow.m1.persistentEvents).length,1);
});
test('two-season development uses actual port once per year, IDs and salaries fixed through reload',()=>{
 const s=build();let count=0;
 const wrapped=(players,opts)=>{count++;return advanceSeason(players,opts)};
 assert.equal(settleM1Season(s,{seasonYear:1979,advanceSeason:wrapped}).accepted,true);
 assert.equal(settleM1Season(s,{seasonYear:1979,advanceSeason:wrapped}).reason,'already_applied');
 s.seasonYear=1980;s.absoluteWeek=75;
 const restored=copy(s); restored.clubs[0].players.forEach(p=>p.age++);
 assert.equal(settleM1Season(restored,{seasonYear:1980,advanceSeason:wrapped,alreadyAged:true}).accepted,true);
 assert.equal(restored.clubs[0].players[0].age,25); // 23 ->24 -> Career07 already aged to25, no double increment
 assert.equal(restored.clubs[0].players[0].contract.weeklyWage,12000);
 assert.deepEqual(restored.flow.m1.seasonDevelopments,[1979,1980]);assert.equal(count,2);
});
