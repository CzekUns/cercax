import test from 'node:test';
import assert from 'node:assert/strict';
import {DIVISIONS} from '../league.js';
import {newCareer,fixturesForWeek,registerResult,advanceWeek,finishSeason} from '../career.js';
import {deserialize,serialize,createSaveManager} from '../save.js';
import {PERIOD_AMBIGUOUS} from '../period-migration.js';
import {initializeFinances,settleWeek,weeklyPayroll} from '../../coach-club/finance.js';
import {samePeriod,periodOf} from '../../coach-club/period.js';
const sizes = Object.fromEntries(DIVISIONS.map(d=>[d.id,2]));
const fresh = seed => newCareer({leagueSizes:sizes},seed);
const checksum = text => { let h=2166136261; for(let i=0;i<text.length;i++){
 h^=text.charCodeAt(i);h=Math.imul(h,16777619);
}return (h>>>0).toString(16).padStart(8,'0');};
function envelope(state,version){
 const data=structuredClone(state); data.schemaVersion=version;
 if(version===1){delete data.history;delete data.offers;delete data.vacancies;}
 delete data.periodLedgerSchemaVersion;
 const plain=JSON.stringify(data);
 return JSON.stringify({kind:'ORONZO_CAREER',version,sequence:4,checksum:checksum(plain),data});
}
function oldPaidCareer(seed){
 let state=fresh(seed);
 state.clubs[0]=initializeFinances(state.clubs[0]);
 const paid=settleWeek(state.clubs[0],{week:1});
 assert.equal(paid.accepted,true);
 state.clubs[0]=paid.club;
 state.clubs[0].board={results:[],notices:[{week:1,kind:'meeting',presidentId:state.clubs[0].presidentId}],
  promises:[{week:1,dueWeek:3,amount:7000,status:'pledged'}],eventsUsed:{eventOne:{lastWeek:1,count:1}}};
 delete state.absoluteWeek;
 return state;
}
for(const version of [1,2]) test(`valid signed legacy V${version} imports, no double debit after load`,()=>{
 const old=oldPaidCareer(42+version), original=envelope(old,version);
 const loaded=deserialize(original);
 assert.equal(loaded.absoluteWeek,1);
 assert.equal(loaded.periodLedgerSchemaVersion,2);
 const club=loaded.clubs[0], amount=club.finance.cash;
 assert.equal(club.finance.settledWeeks[0],'a:1');
 assert.equal(club.board.notices[0].periodKey,'a:1');
 assert.equal(club.board.promises[0].dueAbsoluteWeek,3);
 assert.equal(club.board.eventsUsed.eventOne.periodKey,'a:1');
 const retry=settleWeek(club,{week:loaded.week,absoluteWeek:loaded.absoluteWeek,seasonYear:loaded.seasonYear});
 assert.equal(retry.accepted,false);assert.equal(retry.reason,'week_already_settled');
 assert.equal(retry.club.finance.cash,amount);
 assert.equal(samePeriod(club.board.notices[0],periodOf({week:1,absoluteWeek:1,seasonYear:1985})),true);
 const second=deserialize(serialize(loaded));
 assert.deepEqual(second,loaded);
 assert.equal(second.clubs[0].finance.cash,amount);
 assert.deepEqual(second.clubs[0].finance.periodMigration.originalSettledWeeks,[1]);
});

test('blocked legacy V2 stays byte-for-byte in A/B storage and cannot be silently overwritten',()=>{
 let s=oldPaidCareer(60);
 for(const f of fixturesForWeek(s)) registerResult(s,{fixtureId:f.id,score:{home:0,away:0},events:[]});
 // old V2 clock was seasonal; reintroduce enough state to make second season realistic.
 s.absoluteWeek=1;advanceWeek(s);
 for(const f of fixturesForWeek(s)) registerResult(s,{fixtureId:f.id,score:{home:0,away:0},events:[]});
 advanceWeek(s);finishSeason(s);
 delete s.absoluteWeek;
 const legacy=envelope(s,2), data=new Map([['s:A',legacy],['s:active','A']]);
 const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const mgr=createSaveManager(storage,'s');
 assert.throws(()=>deserialize(legacy),e=>e.code===PERIOD_AMBIGUOUS);
 assert.throws(()=>mgr.load(),e=>e.code===PERIOD_AMBIGUOUS);
 assert.throws(()=>mgr.save(fresh(61)),e=>e.code===PERIOD_AMBIGUOUS);
 assert.equal(data.get('s:A'),legacy);
 assert.equal(data.get('s:active'),'A');
});

test('two seasons real Career+09 weekly finance, retries after each save/load and meetings key stable',()=>{
 let state=fresh(70);
 state.clubs=state.clubs.map(c=>initializeFinances(c));
 const clubId=state.clubs[0].id;
 const seen=new Set(),moneyInitial=state.clubs[0].finance.cash;
 for(let season=0;season<2;season++){
  while(state.phase==='inSeason'){
   const period={week:state.week,absoluteWeek:state.absoluteWeek,seasonYear:state.seasonYear};
   assert.equal(seen.has(period.absoluteWeek),false);seen.add(period.absoluteWeek);
   for(const [i,club] of state.clubs.entries()){
    assert.ok(weeklyPayroll(club)>0);
    const settled=settleWeek(club,period);
    assert.equal(settled.accepted,true);
    assert.equal(settled.paidWages,weeklyPayroll(club));
    assert.equal(settleWeek(settled.club,period).reason,'week_already_settled');
    state.clubs[i]=settled.club;
   }
   const before=state.clubs.find(c=>c.id===clubId).finance.cash;
   state=deserialize(serialize(state));
   const after=state.clubs.find(c=>c.id===clubId);
   assert.equal(after.finance.cash,before);
   assert.equal(settleWeek(after,period).reason,'week_already_settled');
   for(const f of fixturesForWeek(state)) registerResult(state,{fixtureId:f.id,score:{home:0,away:0},events:[]});
   advanceWeek(state);
  }
  finishSeason(state);state=deserialize(serialize(state));
 }
 assert.equal(seen.size,4);
 assert.equal(state.history.length,2);
 assert.equal(state.seasonYear,1987);
 assert.ok(state.clubs.find(c=>c.id===clubId).finance.cash<moneyInitial);
 assert.equal(state.clubs.find(c=>c.id===clubId).finance.settledWeeks.length,4);
});
