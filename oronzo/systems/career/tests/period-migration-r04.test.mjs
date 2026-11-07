import test from 'node:test';
import assert from 'node:assert/strict';
import {migratePeriodLedgers, PERIOD_AMBIGUOUS} from '../period-migration.js';

const fixture = ({year=1985,index=0,week=1,absoluteWeek,explicit=false,withBoard=true}={}) => ({
 seasonYear:year,seasonIndex:index,week,
 ...(absoluteWeek===undefined?{}:{absoluteWeek}),
 history: index===1?[{season:1985,tables:{PROM:[{played:6}],A:[{played:6}]}}]:[],
 clubs:[{id:'PROM-01',finance:{cash:9234000,arrears:0,
    settledWeeks:[1],transactions:[{type:'expense',week:1,amount:486000,note:'wages',
      ...(explicit?{seasonYear:1985}:{})}]},
   ...(withBoard?{board:{results:[],notices:[{week:1,kind:'meeting',presidentId:'gaetano_venturi',
     ...(explicit?{seasonYear:1985}:{})}],promises:[{week:1,dueWeek:3,status:'pledged',amount:1000,
     ...(explicit?{seasonYear:1985}:{})}],eventsUsed:{festival:{lastWeek:1,count:1,
     ...(explicit?{seasonYear:1985}:{})}}}}:{})}]
});

test('first season legacy payment and board mapped exactly once',()=>{
 const state=fixture();migratePeriodLedgers(state);
 const club=state.clubs[0];
 assert.deepEqual(club.finance.settledWeeks,['a:1']);
 assert.deepEqual(club.finance.periodMigration.originalSettledWeeks,[1]);
 assert.equal(club.finance.transactions[0].periodKey,'a:1');
 assert.equal(club.board.notices[0].periodKey,'a:1');
 assert.equal(club.board.promises[0].dueAbsoluteWeek,3);
 assert.equal(club.board.eventsUsed.festival.periodKey,'a:1');
 assert.equal(state.absoluteWeek,1);
 assert.equal(state.periodLedgerSchemaVersion,2);
 const before=structuredClone(state);migratePeriodLedgers(state);assert.deepEqual(state,before);
});

test('year two with bare numbers blocks before mutating any records',()=>{
 const state=fixture({year:1986,index:1,week:1,absoluteWeek:8});
 const raw=JSON.stringify(state);
 assert.throws(()=>migratePeriodLedgers(state),e=>e.code===PERIOD_AMBIGUOUS);
 assert.equal(JSON.stringify(state),raw);
});

test('year two with explicit original season migrates to correct absolute year-one key',()=>{
 const state=fixture({year:1986,index:1,week:1,absoluteWeek:8,explicit:true});
 migratePeriodLedgers(state);
 const club=state.clubs[0];
 assert.deepEqual(club.finance.settledWeeks,['a:1']);
 assert.equal(club.board.notices[0].seasonYear,1985);
 assert.equal(club.board.promises[0].dueAbsoluteWeek,3);
 assert.equal(club.finance.cash,9234000);
});

test('cross-year promise uses original absolute deadline, not reset week',()=>{
 const s=fixture({year:1986,index:1,week:1,absoluteWeek:8,explicit:true});
 const club=s.clubs[0];
 club.board.promises[0].week=6;
 club.board.promises[0].dueWeek=8;
 club.board.promises[0].seasonYear=1985;
 migratePeriodLedgers(s);
 assert.equal(club.board.promises[0].periodKey,'a:6');
 assert.equal(club.board.promises[0].dueAbsoluteWeek,8);
});

test('mixed documented salary years on one numeric settled week remain blocked',()=>{
 const state=fixture({year:1986,index:1,week:1,absoluteWeek:8,explicit:true});
 state.clubs[0].finance.transactions.push({week:1,seasonYear:1986,amount:486000,note:'wages'});
 assert.throws(()=>migratePeriodLedgers(state),e=>e.code===PERIOD_AMBIGUOUS);
});

test('known season-specific period keys convert, current absolute keys are preserved',()=>{
 const s=fixture(); const c=s.clubs[0];
 c.finance.settledWeeks=['s:1985:w:1','a:2'];
 c.finance.transactions[0].periodKey='s:1985:w:1';
 migratePeriodLedgers(s);
 assert.deepEqual(c.finance.settledWeeks,['a:1','a:2']);
 assert.equal(c.finance.transactions[0].legacyPeriod.periodKey,'s:1985:w:1');
});

test('year-two legacy with documented year but unverifiable chronology blocks',()=>{
 const s=fixture({year:1986,index:1,week:1,absoluteWeek:68,explicit:true});
 assert.throws(()=>migratePeriodLedgers(s),e=>e.code===PERIOD_AMBIGUOUS);
});

import {settleWeek,initializeFinances,weeklyPayroll} from '../../coach-club/finance.js';
import {samePeriod,periodOf} from '../../coach-club/period.js';

test('R04 double-debit regression against Agent09 finance: 486000 ITL is not paid twice',()=>{
 const s=fixture({withBoard:false});
 const c=s.clubs[0];
 c.players=[{id:'one',contract:{weeklyWage:486000}}];
 c.budget=9720000;c.wageBudget=486000;
 const initial=initializeFinances({...c,finance:undefined});
 const paid=settleWeek(initial,{week:1});
 assert.equal(paid.accepted,true);
 assert.equal(weeklyPayroll(paid.club),486000);
 assert.equal(paid.club.finance.cash,9234000);
 s.clubs=[paid.club];
 delete s.absoluteWeek;
 migratePeriodLedgers(s);
 assert.deepEqual(s.clubs[0].finance.settledWeeks,['a:1']);
 const before=s.clubs[0].finance.cash;
 const retry=settleWeek(s.clubs[0],{week:1,absoluteWeek:s.absoluteWeek,seasonYear:1985});
 assert.equal(retry.accepted,false);
 assert.equal(retry.reason,'week_already_settled');
 assert.equal(retry.club.finance.cash,before);
 assert.equal(s.clubs[0].finance.transactions.find(t=>t.note==='wages').periodKey,'a:1');
});

test('Agent09 samePeriod matches migrated board meeting and blocks old duplicate',()=>{
 const s=fixture();migratePeriodLedgers(s);
 const prior=s.clubs[0].board.notices[0];
 const now=periodOf({week:1,absoluteWeek:1,seasonYear:1985});
 assert.equal(samePeriod(prior,now),true);
 assert.equal(samePeriod(prior,periodOf({week:1,absoluteWeek:8,seasonYear:1986})),false);
});

test('unattributed legacy trust/staff audit notes stay intact while meeting gets a real key',()=>{
  const s=fixture({year:1986,index:1,week:1,absoluteWeek:8,explicit:true});
  const board=s.clubs[0].board;
  const audit=[{week:4,kind:'trust',reason:'postmatch',change:-2},
    {week:4,kind:'staff',decision:'support'}];
  board.notices.push(...structuredClone(audit));
  migratePeriodLedgers(s);
  assert.equal(s.clubs[0].board.notices[0].periodKey,'a:1');
  assert.deepEqual(s.clubs[0].board.notices.slice(1),audit);
});
