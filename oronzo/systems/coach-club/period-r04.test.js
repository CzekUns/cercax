import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createClub, initializeFinances, settleWeek, conveneBoard, applyClubEvent,
  resolvePromises, book, weeklyPayroll, periodOf, periodLedgerError,
  presidentRoster
} from './index.js';
import {newCareer} from '../career/career.js';
import {deserialize} from '../career/save.js';
import {readFileSync} from 'node:fs';

const catalog=JSON.parse(readFileSync(new URL('../../content/presidents.json',import.meta.url),'utf8'));
const president=presidentRoster(catalog)[0];
const makeClub=()=>createClub({
  id:'club',name:'Campanile',divisionId:'PROM',presidentId:president.id,
  budget:1200000,wageBudget:100000,seasonObjective:'top_half',
  players:[{id:'one',name:'One',contract:{weeklyWage:30000}}],
  staff:{sportingDirector:{competence:70,loyalty:70}}
},{sponsorPerWeek:0,travelCost:10000,presidentCatalog:catalog});
const absolute={week:1,absoluteWeek:1,seasonYear:1985};
const nextYear={week:1,absoluteWeek:39,seasonYear:1986};

test('R04-1: a fully paid legacy week cannot be paid again using a:1',()=>{
  const club=makeClub();
  const old=settleWeek(club,{week:1});
  assert.equal(old.accepted,true);
  assert.deepEqual(old.club.finance.settledWeeks,[1]);
  const saved=JSON.parse(JSON.stringify(old.club));
  const originalLedger=JSON.stringify(saved.finance);
  const retry=settleWeek(saved,absolute);
  assert.equal(retry.accepted,false);
  assert.equal(retry.reason,'period_migration_required');
  assert.equal(retry.club,saved);
  assert.equal(JSON.stringify(saved.finance),originalLedger);
  assert.throws(()=>book(saved,{type:'expense',amount:1,...absolute}),/period_migration_required/);
  // Denied overspending is still a no-op and retains its old public API response.
  assert.equal(book(saved,{type:'expense',amount:saved.budget+1}).reason,'insufficient_cash');
});

test('R04-1: legacy meeting and event cannot be replayed with absoluteWeek',()=>{
  let club=makeClub();
  club=conveneBoard(club,president,{week:1,seed:3}).club;
  const meetingCount=club.board.notices.filter(x=>x.kind==='meeting').length;
  assert.equal(conveneBoard(club,president,absolute).reason,'period_migration_required');
  assert.equal(club.board.notices.filter(x=>x.kind==='meeting').length,meetingCount);
  const event={id:'legacy-event',clubId:'club',options:[{id:'yes',effects:{boardTrust:2}}]};
  assert.equal(applyClubEvent(club,event,'yes',{week:1}).accepted,true);
  const saved=JSON.parse(JSON.stringify(club));
  const applied=applyClubEvent(saved,event,'yes',absolute);
  assert.equal(applied.reason,'period_migration_required');
});

test('R04-1: legacy promise cannot be auto-credited at new absolute period',()=>{
  const club=makeClub();
  club.board.promises.push({
    week:1,dueWeek:3,periodKey:1,status:'pledged',
    amount:4000,presidentId:president.id
  });
  const before=JSON.stringify(club);
  assert.throws(()=>resolvePromises(club,{...absolute,confirmedContributions:{1:4000}}),
    /period_migration_required/);
  assert.equal(JSON.stringify(club),before);
});

test('R04-1: mixed absolute/season registries are refused until migrated',()=>{
  const club=makeClub();
  club.finance.settledWeeks=['a:1','s:1985:w:2'];
  assert.equal(periodLedgerError(club,periodOf(absolute)),'period_migration_required');
  assert.equal(settleWeek(club,{week:3,absoluteWeek:3,seasonYear:1985}).reason,
    'period_migration_required');
});

test('R04-1: an explicitly migrated entire ledger deduplicates and accepts next year',()=>{
  let club=settleWeek(makeClub(),{week:1}).club;
  // Test-only migration with verifiable year. In production 07 owns this transformation.
  club.finance.settledWeeks=club.finance.settledWeeks.map(week=>'a:'+week);
  for(const entry of club.finance.transactions) {
    entry.periodKey='a:'+entry.week;
    entry.absoluteWeek=entry.week;
    entry.seasonYear=1985;
  }
  const retry=settleWeek(club,absolute);
  assert.equal(retry.reason,'week_already_settled');
  const year2=settleWeek(club,nextYear);
  assert.equal(year2.accepted,true);
  assert.deepEqual(year2.club.finance.settledWeeks,['a:1','a:39']);
  assert.equal(settleWeek(year2.club,nextYear).reason,'week_already_settled');
});

test('R04-1: rehydrating a club preserves finance.cash and settled ledger',()=>{
  const club=makeClub();
  club.budget=500000;
  club.finance.cash=450000;
  club.finance.arrears=10000;
  club.finance.transactions=[{type:'expense',amount:1000,week:1,periodKey:1,paid:1000}];
  club.finance.settledWeeks=[1];
  const loaded=initializeFinances(JSON.parse(JSON.stringify(club)));
  assert.equal(loaded.finance.cash,450000);
  assert.equal(loaded.budget,450000);
  assert.equal(loaded.finance.arrears,10000);
  assert.deepEqual(loaded.finance.settledWeeks,[1]);
  assert.deepEqual(loaded.finance.transactions,club.finance.transactions);
});

function digest(input){
  let h=2166136261;
  for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(16).padStart(8,'0');
}
function legacyEnvelope(state,version){
  const cloned=JSON.parse(JSON.stringify(state));
  cloned.schemaVersion=version;
  delete cloned.absoluteWeek;
  return JSON.stringify({
    kind:'ORONZO_CAREER',version,sequence:1,checksum:digest(JSON.stringify(cloned)),data:cloned
  });
}

for(const version of [1,2]) {
  test('R04-1: real career V'+version+' envelope cannot replay a paid legacy week',()=>{
    let state=newCareer({leagueSizes:{PROM:2,INTER:2,C2:2,C1:2,B:2,A:2}},42);
    const i=state.clubs.findIndex(c=>c.id===state.coach.clubId);
    state.clubs[i]=createClub(state.clubs[i],{presidentCatalog:catalog});
    const first=settleWeek(state.clubs[i],{week:1});
    assert.equal(first.accepted,true);
    state.clubs[i]=first.club;
    const paid=state.clubs[i].finance.cash;
    const arrears=state.clubs[i].finance.arrears;
    const loaded=deserialize(legacyEnvelope(state,version));
    const current=loaded.clubs[i];
    const retry=settleWeek(current,{
      week:loaded.week,absoluteWeek:loaded.absoluteWeek,seasonYear:loaded.seasonYear
    });
    assert.equal(retry.accepted,false);
    assert.ok(['period_migration_required','week_already_settled'].includes(retry.reason),
      'Unexpected retry outcome: '+String(retry.reason));
    assert.equal(current.finance.cash,paid);
    assert.equal(current.finance.arrears,arrears);
    assert.equal(weeklyPayroll(current),weeklyPayroll(state.clubs[i]));
  });
}
