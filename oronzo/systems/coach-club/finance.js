import {integer,copy} from './core.js';
import {periodOf,ledgerEntry} from './period.js';

// Whole nominal lire (ITL), never signed amounts. Safe-integer checks include totals.
const money = (amount, label='amount') => integer(amount, label);
const addMoney = (a, b, label) => money(money(a,label) + money(b,label),label);
const defaultIfMissing = (value, fallback=0) => value === undefined ? fallback : value;

export function weeklyPayroll(club) {
  return (club.players || []).reduce((sum,player) => {
    if(!player?.contract || !Object.prototype.hasOwnProperty.call(player.contract,'weeklyWage'))
      throw new RangeError('missing contract.weeklyWage for player '+String(player?.id));
    return addMoney(sum,player.contract.weeklyWage,'weeklyPayroll');
  },0);
}

export function initializeFinances(club, options={}) {
  // Check the original values BEFORE JSON cloning: JSON.stringify turns NaN/Infinity into null.
  const budget=money(defaultIfMissing(club?.budget),'budget');
  const wageBudget=money(defaultIfMissing(club?.wageBudget),'wageBudget');
  const f=club?.finance || {};
  const arrears=money(defaultIfMissing(f.arrears),'arrears');
  const sponsorPerWeek=money(defaultIfMissing(options.sponsorPerWeek,defaultIfMissing(f.sponsorPerWeek)),'sponsorPerWeek');
  const travelCost=money(defaultIfMissing(options.travelCost,defaultIfMissing(f.travelCost)),'travelCost');
  weeklyPayroll(club);
  const c=copy(club);
  c.budget=budget;
  c.wageBudget=wageBudget;
  c.finance={
    cash:c.budget,
    arrears,
    sponsorPerWeek,
    travelCost,
    transactions:Array.isArray(f.transactions) ? f.transactions : [],
    settledWeeks:Array.isArray(f.settledWeeks) ? f.settledWeeks : []
  };
  return c;
}

export function book(club, {amount,type,week=0,absoluteWeek,seasonYear,mandatory=false,note=''}) {
  money(amount,'amount');
  const period=periodOf({week,absoluteWeek,seasonYear});
  if (!['income','expense'].includes(type)) throw new Error('transaction type must be income or expense');
  if(!club?.finance) throw new Error('finances not initialized');
  const cash=money(club.finance.cash,'cash');
  const arrears=money(club.finance.arrears,'arrears');
  if (type==='expense' && !mandatory && amount>cash)
    return {accepted:false,reason:'insufficient_cash',club};
  const paid=type==='income' ? amount : Math.min(amount,cash);
  const unpaid=type==='expense' ? amount-paid : 0;
  // Validate both computed totals before any new state or transaction is returned.
  const balance=type==='income' ? addMoney(cash,amount,'cash') : money(cash-paid,'cash');
  const due=addMoney(arrears,unpaid,'arrears');
  const c=copy(club);
  c.finance.cash=balance;
  c.finance.arrears=due;
  c.finance.transactions.push({type,amount,paid,unpaid,...ledgerEntry(period),note});
  c.budget=balance;
  return {accepted:true,club:c,paid,unpaid};
}

export function settleWeek(club, {week,absoluteWeek,seasonYear,away=false,bonus=0,otherIncome=0}={}) {
  const period=periodOf({week,absoluteWeek,seasonYear});
  money(bonus,'bonus'); money(otherIncome,'otherIncome');
  if (!club?.finance) throw new Error('finances not initialized');
  money(club.finance.cash,'cash');
  money(club.finance.arrears,'arrears');
  money(club.finance.sponsorPerWeek,'sponsorPerWeek');
  money(club.finance.travelCost,'travelCost');
  weeklyPayroll(club); // Verify all wages and their sum before settling.
  if (club.finance.settledWeeks.includes(period.key))
    return {accepted:false,reason:'week_already_settled',club};
  let c=copy(club);
  for(const [amount,note] of [[c.finance.sponsorPerWeek,'sponsor'],[otherIncome,'other_income']])
    c=book(c,{type:'income',amount,...ledgerEntry(period),note}).club;
  const recovered=Math.min(c.finance.cash,c.finance.arrears);
  c.finance.cash=money(c.finance.cash-recovered,'cash');
  c.finance.arrears=money(c.finance.arrears-recovered,'arrears');
  c.budget=c.finance.cash;
  if(recovered) c.finance.transactions.push({type:'arrears_payment',amount:recovered,paid:recovered,unpaid:0,...ledgerEntry(period),note:'old debt'});
  const bills=[['wages',weeklyPayroll(c)],['travel',away ? c.finance.travelCost : 0],['bonus',bonus]];
  for(const [note,amount] of bills) c=book(c,{type:'expense',amount,...ledgerEntry(period),mandatory:true,note}).club;
  c.finance.settledWeeks.push(period.key);
  return {accepted:true,club:c,unpaid:c.finance.arrears,paidWages:weeklyPayroll(c)};
}

export function financialHealth(club) {
  const payroll=weeklyPayroll(club);
  const cash=money(club.finance.cash,'cash');
  const arrears=money(club.finance.arrears,'arrears');
  const wageCap=money(club.wageBudget,'wageBudget');
  return {cash,arrears,payroll,wageHeadroom:Math.max(0,wageCap-payroll),withinWageCap:payroll<=wageCap,solvent:arrears===0};
}
