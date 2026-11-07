import test from 'node:test';
import assert from 'node:assert/strict';
import {DIVISIONS} from '../league.js';
import {newCareer, fixturesForWeek,registerResult,advanceWeek,finishSeason} from '../career.js';
import {serialize,deserialize} from '../save.js';
import {createClub} from '../../coach-club/club.js';
import {conveneBoard,resolvePromises,applyClubEvent,endClubWeek} from '../../coach-club/board.js';
import {settleWeek,weeklyPayroll} from '../../coach-club/finance.js';
const sizes=Object.fromEntries(DIVISIONS.map(d=>[d.id,2]));
const attributes=['authoritarianism','frugality','vanity','patience','interference','ambition','riskTolerance'];
const profile=id=>({id,name:'Test president',archetype:'test',clubFlavor:'test',traits:Object.fromEntries(attributes.map(k=>[k,50]))});
function signed(state){
 const data=structuredClone(state);delete data.periodLedgerSchemaVersion;delete data.absoluteWeek;
 const text=JSON.stringify(data);let h=2166136261;
 for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
 return JSON.stringify({kind:'ORONZO_CAREER',version:2,sequence:0,checksum:(h>>>0).toString(16).padStart(8,'0'),data});
}
test('R04 Agent09 real conveneBoard + settleWeek legacy retry blocked after V2 reload',()=>{
 let state=newCareer({leagueSizes:sizes},91);
 let club=createClub(state.clubs[0]); const president=profile(club.presidentId);
 const legacyPeriod={week:1};
 const meeting=conveneBoard(club,president,{...legacyPeriod,seed:4});
 assert.equal(meeting.accepted,true);
 club=meeting.club;
 const paid=endClubWeek(club,legacyPeriod);
 assert.equal(paid.accepted,true);club=paid.club;
 const cash=club.finance.cash;
 state.clubs[0]=club;
 state=deserialize(signed(state));
 club=state.clubs[0];
 assert.equal(club.finance.cash,cash);
 assert.equal(club.finance.settledWeeks.includes('a:1'),true);
 const period={week:1,absoluteWeek:1,seasonYear:1985};
 assert.equal(conveneBoard(club,president,{...period,seed:4}).reason,'already_met_this_week');
 assert.equal(endClubWeek(club,period).reason,'week_already_settled');
 assert.equal(club.finance.cash,cash);
 assert.equal(club.board.notices.find(n=>n.kind==='meeting').periodKey,'a:1');
});

test('R04 Agent09 actual resolvePromises across season after traced origin year',()=>{
 let s=newCareer({leagueSizes:sizes},92);
 let club=createClub(s.clubs[0]);const president=profile(club.presidentId);
 // A legacy promise made in the final round (week 2) is due across rollover.
 club.board.promises.push({week:2,dueWeek:4,amount:1000,status:'pledged',presidentId:club.presidentId});
 club.board.notices.push({week:2,kind:'meeting',presidentId:club.presidentId});
 s.clubs[0]=club;
 // Move entire competition into year two; the promise's original year is documented.
 for(let i=0;i<2;i++){
  for(const f of fixturesForWeek(s))registerResult(s,{fixtureId:f.id,score:{home:0,away:0},events:[]});
  advanceWeek(s);
 }
 finishSeason(s);
 s.clubs[0].board.periodMigration={legacySeasonYear:1985};
 const saved=deserialize(signed(s));
 club=saved.clubs[0];
 assert.equal(club.board.promises[0].periodKey,'a:2');
 assert.equal(club.board.promises[0].dueAbsoluteWeek,4);
 const starting=club.finance.cash;
 const period={week:1,absoluteWeek:saved.absoluteWeek,seasonYear:saved.seasonYear};
 const honored=resolvePromises(club,{...period,confirmedContributions:{'a:2':1000}});
 assert.equal(honored.board.promises[0].status,'honored');
 assert.equal(honored.finance.cash,starting+1000);
 const replay=resolvePromises(honored,{...period,confirmedContributions:{'a:2':1000}});
 assert.equal(replay.finance.cash,starting+1000);
});

test('R04 Agent09 actual cooldown survives legacy migration and unlocks next season',()=>{
 let s=newCareer({leagueSizes:sizes},93);
 let club=createClub(s.clubs[0]);
 const event={id:'festival',clubId:club.id,oncePerSeason:true,cooldownWeeks:2,
  options:[{id:'yes',effects:{boardTrust:1}}]};
 const a=applyClubEvent(club,event,'yes',{week:1});
 assert.equal(a.accepted,true);club=a.club;
 s.clubs[0]=club;
 s=deserialize(signed(s));club=s.clubs[0];
 assert.equal(club.board.eventsUsed.festival.periodKey,'a:1');
 assert.equal(applyClubEvent(club,event,'yes',{week:2,absoluteWeek:2,seasonYear:1985}).reason,'cooldown');
 for(let i=0;i<2;i++){
  for(const f of fixturesForWeek(s)) registerResult(s,{fixtureId:f.id,score:{home:0,away:0},events:[]});
  advanceWeek(s);
 }
 finishSeason(s);
 s=deserialize(serialize(s));
 club=s.clubs[0];
 const again=applyClubEvent(club,event,'yes',{week:1,absoluteWeek:s.absoluteWeek,seasonYear:1986});
 assert.equal(again.accepted,true);
 assert.equal(again.club.board.eventsUsed.festival.count,2);
});
