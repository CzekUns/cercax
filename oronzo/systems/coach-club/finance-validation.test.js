import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeFinances,book,settleWeek,weeklyPayroll,financialHealth} from './finance.js';

const base=(opts={})=>initializeFinances({
 id:'club',budget:100,wageBudget:150,
 players:[{id:'p',contract:{weeklyWage:90}}],
 ...opts
},{sponsorPerWeek:20,travelCost:40});

const badValues=[null,false,-1,-100,0.5,NaN,Infinity,-Infinity,'100',Number.MAX_SAFE_INTEGER+1];

test('ORZ-P1-008: book() rejects negative and non-integer income and expense',()=>{
 const c=base(),original=JSON.stringify(c);
 for(const type of ['expense','income'])for(const amount of badValues)
   assert.throws(()=>book(c,{type,amount,week:1}),RangeError,`type=${type} amount=${amount}`);
 assert.equal(JSON.stringify(c),original);
});

test('ORZ-P1-008: initializeFinances rejects invalid starting money and caps',()=>{
 const c={budget:100,wageBudget:150,players:[]};
 for(const value of badValues){
  assert.throws(()=>initializeFinances({...c,budget:value}),RangeError);
  assert.throws(()=>initializeFinances({...c,wageBudget:value}),RangeError);
  assert.throws(()=>initializeFinances({...c,finance:{arrears:value}}),RangeError);
  assert.throws(()=>initializeFinances(c,{sponsorPerWeek:value}),RangeError);
  assert.throws(()=>initializeFinances(c,{travelCost:value}),RangeError);
 }
});

test('ORZ-P1-008: settleWeek rejects invalid bonus and otherIncome atomically',()=>{
 const c=base(),before=JSON.stringify(c);
 for(const value of badValues){
  assert.throws(()=>settleWeek(c,{week:1,bonus:value}),RangeError);
  assert.throws(()=>settleWeek(c,{week:1,otherIncome:value}),RangeError);
 }
 assert.equal(JSON.stringify(c),before);
 assert.equal(c.finance.settledWeeks.length,0);
});

test('ORZ-P1-008: safe integer overflow is rejected for incoming money',()=>{
 const c=base({budget:Number.MAX_SAFE_INTEGER-1});
 assert.throws(()=>book(c,{type:'income',amount:5}),RangeError);
 assert.equal(c.budget,Number.MAX_SAFE_INTEGER-1);
});

test('ORZ-P1-008: safe integer overflow is rejected for arrears',()=>{
 const c=base({finance:{arrears:Number.MAX_SAFE_INTEGER-1},budget:0});
 assert.throws(()=>book(c,{type:'expense',amount:2,mandatory:true}),RangeError);
 assert.equal(c.finance.arrears,Number.MAX_SAFE_INTEGER-1);
});

test('ORZ-P1-008: payroll accumulation rejects overflow or negative wages',()=>{
 const c=base();
 assert.throws(()=>weeklyPayroll({...c,players:[{contract:{weeklyWage:Number.MAX_SAFE_INTEGER}},{contract:{weeklyWage:1}}]}),RangeError);
 assert.throws(()=>weeklyPayroll({...c,players:[{contract:{weeklyWage:-50}}]}),RangeError);
 assert.throws(()=>initializeFinances({...c,players:[{contract:{weeklyWage:-10}}]}),RangeError);
});

test('ORZ-P1-008: settleWeek rejects invalid ledger balances and configuration',()=>{
 const c=base();
 for(const key of ['cash','arrears','sponsorPerWeek','travelCost']) {
  const altered=structuredClone(c);altered.finance[key]=-2;
  assert.throws(()=>settleWeek(altered,{week:1}),RangeError);
 }
});

test('normal receipts and discretionary expense keep exact ledgers',()=>{
 const c=base();
 const income=book(c,{type:'income',amount:50,week:1});
 assert.equal(income.accepted,true);assert.equal(income.club.budget,150);
 const spent=book(income.club,{type:'expense',amount:30,week:1});
 assert.equal(spent.accepted,true);assert.equal(spent.club.budget,120);
 assert.equal(spent.club.finance.transactions.length,2);
 assert.equal(book(spent.club,{type:'expense',amount:121}).reason,'insufficient_cash');
 assert.equal(financialHealth(spent.club).payroll,90);
});

test('mandatory wage/travel shortfalls form arrears, zero negative cash',()=>{
 const c=base();
 const week1=settleWeek(c,{week:1,away:true,bonus:30});
 assert.equal(week1.accepted,true);
 assert.equal(week1.club.budget,0);
 assert.equal(week1.club.finance.arrears,40);
 assert.equal(week1.club.finance.transactions.at(-1).note,'bonus');
 assert.equal(settleWeek(week1.club,{week:1}).reason,'week_already_settled');
 const week2=settleWeek(week1.club,{week:2,away:false});
 assert.equal(week2.club.budget,0);
 assert.equal(week2.club.finance.arrears,110);
});
