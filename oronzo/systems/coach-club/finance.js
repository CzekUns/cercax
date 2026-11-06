import {integer,copy,clamp} from './core.js';

// All amounts are whole nominal ITL (lire). Wages and sponsor receipts are weekly.
export function weeklyPayroll(club) {
  return (club.players || []).reduce((sum,p) => sum + integer(p.contract?.weeklyWage ?? 0, 'weeklyWage'), 0);
}
export function initializeFinances(club, options={}) {
  const c=copy(club);
  c.budget=integer(c.budget ?? 0,'budget');
  c.wageBudget=integer(c.wageBudget ?? 0,'wageBudget');
  const f=c.finance || {};
  c.finance={
    cash:c.budget, arrears:integer(f.arrears ?? 0,'arrears'),
    sponsorPerWeek:integer(options.sponsorPerWeek ?? f.sponsorPerWeek ?? 0,'sponsorPerWeek'),
    travelCost:integer(options.travelCost ?? f.travelCost ?? 0,'travelCost'),
    transactions:Array.isArray(f.transactions) ? f.transactions : [],
    settledWeeks:Array.isArray(f.settledWeeks) ? f.settledWeeks : []
  };
  return c;
}
export function book(club, {amount,type,week=0,mandatory=false,note=''}) {
  integer(amount,'amount');
  if (!['income','expense'].includes(type)) throw new Error('transaction type must be income or expense');
  const c=copy(club); if(!c.finance) throw new Error('finances not initialized');
  if (!Number.isSafeInteger(c.finance.cash) || c.finance.cash<0) throw new Error('invalid cash');
  if (type==='expense' && !mandatory && amount>c.finance.cash) return {accepted:false,reason:'insufficient_cash',club};
  const paid=type==='income' ? amount : Math.min(amount,c.finance.cash);
  if(type==='income') c.finance.cash += amount; else c.finance.cash -= paid;
  if (!Number.isSafeInteger(c.finance.cash)) throw new RangeError('cash overflow');
  const unpaid=type==='expense' ? amount-paid : 0;
  c.finance.arrears += unpaid; integer(c.finance.arrears,'arrears');
  c.finance.transactions.push({type,amount,paid,unpaid,week,note});
  c.budget=c.finance.cash;
  return {accepted:true,club:c,paid,unpaid};
}
export function settleWeek(club, {week,away=false,bonus=0,otherIncome=0}={}) {
  integer(week,'week'); integer(bonus,'bonus'); integer(otherIncome,'otherIncome');
  if (club.finance.settledWeeks.includes(week)) return {accepted:false,reason:'week_already_settled',club};
  let c=copy(club);
  for(const [amount,note] of [[c.finance.sponsorPerWeek,'sponsor'],[otherIncome,'other_income']]) {
    c=book(c,{type:'income',amount,week,note}).club;
  }
  // Previously unpaid wages/travel/bonuses remain debt; collect before new bills.
  const arrears=c.finance.arrears;
  const recovered=Math.min(c.finance.cash,arrears);
  c.finance.cash-=recovered; c.finance.arrears-=recovered; c.budget=c.finance.cash;
  if(recovered) c.finance.transactions.push({type:'arrears_payment',amount:recovered,paid:recovered,unpaid:0,week,note:'old debt'});
  const bills=[['wages',weeklyPayroll(c)],['travel',away ? c.finance.travelCost : 0],['bonus',bonus]];
  for(const [note,amount] of bills) c=book(c,{type:'expense',amount,week,mandatory:true,note}).club;
  c.finance.settledWeeks.push(week);
  return {accepted:true,club:c,unpaid:c.finance.arrears,paidWages:weeklyPayroll(c)};
}
export function financialHealth(club) {
  const payroll=weeklyPayroll(club);
  return {cash:club.finance.cash,arrears:club.finance.arrears,payroll,wageHeadroom:Math.max(0,club.wageBudget-payroll),withinWageCap:payroll<=club.wageBudget,solvent:club.finance.arrears===0};
}
