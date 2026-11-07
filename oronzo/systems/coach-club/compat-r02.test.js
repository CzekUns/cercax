import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 createClub,createCoach,weeklyPayroll,settleWeek,endClubWeek,book,conveneBoard,
 reviewMatch,resolvePromises,applyClubEvent,presidentRoster,resolveClubPresident,
 reviewTransfer,decideSale,normalizeSeasonObjective,periodOf
} from './index.js';
import {newCareer,fixturesForWeek,registerResult,advanceWeek,finishSeason,applyBoardDecision} from '../career/career.js';
import {serialize,deserialize} from '../career/save.js';
import {seasonAssessment} from '../career/progression.js';

const catalog=JSON.parse(readFileSync(new URL('../../content/presidents.json',import.meta.url),'utf8'));
const profiles=presidentRoster(catalog);
const venturi=profiles.find(p=>p.id==='gaetano_venturi');
const berti=profiles.find(p=>p.id==='leandro_berti');
const player=(id,wage=100)=>({
 id,name:'Atleta '+id,teamId:'club',positions:['GK'],mental:{morale:50},
 contract:{weeklyWage:wage}
});
const club=(objective='topHalf',id=venturi.id)=>createClub({
 id:'club',name:'Campanile',presidentId:id,divisionId:'PROM',
 seasonObjective:objective,budget:10000,wageBudget:2500,boardTrust:65,
 staff:{sportingDirector:{competence:90,loyalty:60}},
 players:[player('p1'),player('p2')],reputation:40
},{sponsorPerWeek:500,travelCost:300,presidentCatalog:catalog});
const fulltime=(home,away)=>({phase:'fulltime',t:5400,score:{home,away},events:[]});

test('R02-1: profiles are the real original 8, canonical for each club',()=>{
 assert.equal(profiles.length,8);
 const c=club();
 assert.equal(resolveClubPresident(c,catalog).id,venturi.id);
 assert.throws(()=>createClub({
  ...c,presidentId:'president:club'
 },{presidentCatalog:catalog}),/unknown canonical presidentId/);
 assert.throws(()=>resolveClubPresident({...c,presidentId:'unknown'},catalog));
});
test('R02-1: board and mercato reject wrong president without touching ledger',()=>{
 const c=club(),before=JSON.stringify(c);
 const m=conveneBoard(c,berti,{week:1,absoluteWeek:1,seasonYear:1985,seed:1});
 assert.equal(m.reason,'president_mismatch');
 const match=reviewMatch(c,berti,{matchId:'match1',week:1,absoluteWeek:1,
  homeClubId:'club',awayClubId:'other',snapshot:fulltime(0,1)});
 assert.equal(match.reason,'president_mismatch');
 assert.equal(reviewTransfer(c,berti,'whatever').reason,'president_mismatch');
 assert.equal(decideSale(c,berti,'whatever').reason,'president_mismatch');
 assert.equal(JSON.stringify(c),before);
 const good=conveneBoard(c,venturi,{week:1,absoluteWeek:1,seasonYear:1985,seed:1});
 assert.equal(good.accepted,true);
 assert.equal(good.club.board.notices.find(n=>n.kind==='meeting').presidentId,c.presidentId);
});
test('R02-2: career objective spelling remains persisted, board mapping is explicit',()=>{
 assert.equal(normalizeSeasonObjective('topHalf'),'top_half');
 assert.equal(normalizeSeasonObjective('avoidRelegation'),'avoid_last');
 assert.equal(normalizeSeasonObjective('survival'),'safety');
 assert.throws(()=>normalizeSeasonObjective('maybePromotion'),/unsupported/);
 const c=club('topHalf');
 assert.equal(c.seasonObjective,'topHalf'); // Career 07 must still read this field.
 const old=reviewMatch(c,venturi,{matchId:'m1',week:1,
  homeClubId:'club',awayClubId:'other',snapshot:fulltime(0,1)});
 const explicit=reviewMatch({...c,seasonObjective:'top_half'},venturi,{matchId:'m1',week:1,
  homeClubId:'club',awayClubId:'other',snapshot:fulltime(0,1)});
 assert.equal(old.trustDelta,explicit.trustDelta);
 assert.equal(old.trustDelta,-5);
 const coach=createCoach({id:'m',name:'Mister',clubId:'club',hiredSeason:1985});
 const table=[{clubId:'A',position:1},{clubId:'B',position:2},
  {clubId:'club',position:3},{clubId:'D',position:4}];
 assert.equal(seasonAssessment(coach,table,'club',c.seasonObjective).fulfilled,false);
 assert.throws(()=>reviewMatch({...c,seasonObjective:'unknown'},venturi,{
  matchId:'m1',week:1,homeClubId:'club',awayClubId:'other',snapshot:fulltime(0,1)
 }),/unsupported/);
});
test('R02-3: explicit weekly contracts and zero amateur salary, never missing salary',()=>{
 const c=club();
 assert.equal(weeklyPayroll(c),200);
 assert.equal(settleWeek(c,{week:1,absoluteWeek:1}).paidWages,200);
 const broken=structuredClone(c);delete broken.players[0].contract;
 assert.throws(()=>weeklyPayroll(broken),/missing contract.weeklyWage/);
 assert.throws(()=>settleWeek(broken,{week:1}),/missing contract.weeklyWage/);
 assert.throws(()=>createClub({...broken,finance:undefined}),/missing contract.weeklyWage/);
 const unpaid=club();unpaid.budget=0;unpaid.finance.cash=0;unpaid.finance.sponsorPerWeek=0;
 const settled=settleWeek(unpaid,{week:1,absoluteWeek:1,away:true});
 assert.equal(settled.club.finance.arrears,500);
 assert.equal(settled.club.budget,0);
 assert.throws(()=>book(c,{type:'expense',amount:-1,week:1}),RangeError);
 assert.equal(weeklyPayroll({...c,players:[player('amateur',0)]}),0);
});
test('R02-4: two season keys allow weekly expenses and meetings exactly once each',()=>{
 let c=club();
 for(const period of [
  {week:1,absoluteWeek:1,seasonYear:1985},
  {week:1,absoluteWeek:39,seasonYear:1986}
 ]){
  const meeting=conveneBoard(c,venturi,{...period,seed:6});
  assert.equal(meeting.accepted,true);
  c=meeting.club;
  assert.equal(conveneBoard(c,venturi,{...period,seed:6}).reason,'already_met_this_week');
  const settlement=endClubWeek(c,{...period,away:true});
  assert.equal(settlement.accepted,true);
  c=JSON.parse(JSON.stringify(settlement.club));
  assert.equal(endClubWeek(c,{...period,away:true}).reason,'week_already_settled');
 }
 assert.deepEqual(c.finance.settledWeeks,['a:1','a:39']);
 assert.equal(c.board.notices.filter(n=>n.kind==='meeting').length,2);
 assert.equal(periodOf({week:1,seasonYear:1985}).key,'s:1985:w:1');
 assert.equal(periodOf({week:1,seasonYear:1986}).key,'s:1986:w:1');
});
test('R02-4: cross-year promises settle once with proven period contribution',()=>{
 const c=club();
 c.board.promises.push({week:38,absoluteWeek:38,periodKey:'a:38',dueWeek:40,
  dueAbsoluteWeek:40,amount:400,presidentId:c.presidentId,status:'pledged'});
 const unchanged=resolvePromises(c,{week:1,absoluteWeek:39,seasonYear:1986,confirmedContributions:{38:400}});
 assert.equal(unchanged.board.promises[0].status,'pledged');
 assert.equal(unchanged.budget,c.budget);
 const paid=resolvePromises(unchanged,{week:2,absoluteWeek:40,seasonYear:1986,
  confirmedContributions:{'a:38':400}});
 assert.equal(paid.budget,c.budget+400);
 assert.equal(paid.board.promises[0].status,'honored');
 const twice=resolvePromises(paid,{week:2,absoluteWeek:40,seasonYear:1986,
  confirmedContributions:{'a:38':400}});
 assert.equal(twice.budget,paid.budget);
});
test('R02-4: one-time event resets next season without duplicate application',()=>{
 let c=club();
 const event={id:'festival',clubId:'club',cooldownWeeks:3,oncePerSeason:true,
  options:[{id:'a',effects:{boardTrust:1}}]};
 const first=applyClubEvent(c,event,'a',{week:1,absoluteWeek:1,seasonYear:1985});
 assert.equal(first.accepted,true);
 c=first.club;
 assert.equal(applyClubEvent(c,event,'a',{week:2,absoluteWeek:2,seasonYear:1985}).reason,'cooldown');
 const next=applyClubEvent(c,event,'a',{week:1,absoluteWeek:39,seasonYear:1986});
 assert.equal(next.accepted,true);
 assert.equal(next.club.boardTrust,67);
 assert.equal(next.club.board.eventsUsed.festival.count,2);
});
test('R02-5: createCoach preserves career-owned employment history, contract and extras',()=>{
 const original={id:'coach:player',name:'Il mister',clubId:'club',hiredSeason:1985,
  employmentHistory:[{clubId:'previous',start:1983,end:1984,reason:'resigned'}],
  contract:{until:1988,weeklyWage:600,bonusITL:200},reputation:40,
  extraCareerFlag:'kept',relationships:{}};
 const after=createCoach(JSON.parse(JSON.stringify(original)));
 assert.deepEqual(after.employmentHistory,original.employmentHistory);
 assert.deepEqual(after.contract,original.contract);
 assert.equal(after.hiredSeason,1985);
 assert.equal(after.extraCareerFlag,'kept');
 const empty=createCoach({id:'x',name:'Legacy',clubId:null});
 assert.deepEqual(empty.employmentHistory,[]);
 assert.equal(empty.contract,null);
});
test('R02 integration: real Career 07 across two seasons, save/load and dismissal',()=>{
 const sizes={PROM:2,INTER:2,C2:2,C1:2,B:2,A:2};
 let state=newCareer({leagueSizes:sizes},1985);
 const coachClubId=state.coach.clubId;
 // Explicit test adapter while agent 07 is implementing real salaries / IDs.
 for(const c of state.clubs){
  c.presidentId=profiles[0].id;
  for(const p of c.players) if(!Object.prototype.hasOwnProperty.call(p.contract??{},'weeklyWage'))
   p.contract={...(p.contract||{}),weeklyWage:100};
 }
 const idx=state.clubs.findIndex(c=>c.id===coachClubId);
 state.clubs[idx]=createClub(state.clubs[idx],{sponsorPerWeek:0,travelCost:0,presidentCatalog:catalog});
 state.coach.contract={until:1988};
 state.coach=createCoach(state.coach);
 assert.equal(weeklyPayroll(state.clubs[idx]),1600);
 let c=state.clubs[idx];
 c=conveneBoard(c,venturi,{week:1,absoluteWeek:1,seasonYear:1985,seed:7}).club;
 c=endClubWeek(c,{week:1,absoluteWeek:1,seasonYear:1985}).club;
 state.clubs[idx]=c;
 state=deserialize(serialize(state));
 const initialCash=state.clubs[idx].budget;
 for(let round=0;round<state.maxWeek;round++){
  for(const f of fixturesForWeek(state))registerResult(state,{
   fixtureId:f.id,homeId:f.homeId,awayId:f.awayId,score:{home:0,away:0},events:[]});
  advanceWeek(state);
 }
 assert.equal(state.phase,'seasonComplete');
 finishSeason(state);
 assert.equal(state.seasonYear,1986);
 assert.equal(state.week,1);
 state=deserialize(serialize(state));
 c=state.clubs[idx];
 assert.equal(c.budget,initialCash);
 assert.equal(c.presidentId,venturi.id);
 assert.equal(c.finance.settledWeeks.includes('a:1'),true);
 const p2={week:1,absoluteWeek:state.maxWeek+1,seasonYear:state.seasonYear};
 const meeting=conveneBoard(c,venturi,{...p2,seed:8});
 assert.equal(meeting.accepted,true);
 c=endClubWeek(meeting.club,p2).club;
 assert.equal(c.finance.settledWeeks.length,2);
 assert.equal(endClubWeek(c,p2).reason,'week_already_settled');
 state.clubs[idx]=c;
 state=deserialize(serialize(state));
 state.coach=createCoach(state.coach);
 applyBoardDecision(state,{type:'dismiss',clubId:coachClubId});
 assert.equal(state.coach.clubId,null);
 assert.equal(state.coach.employmentHistory.at(-1).reason,'dismissed');
 assert.equal(state.coach.employmentHistory.at(-1).start,1985);
});
