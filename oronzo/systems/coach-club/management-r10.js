/** ORONZO R10 — Agent09 persistent board/stadium management.
 * All quantitative rules are configurable game-balancing assumptions, not verified 1979 prices.
 * Callers commit club+coach together. Career07 owns fixtures, time and market windows.
 */
import {copy,clamp,integer} from './core.js';
import {book,weeklyPayroll} from './finance.js';
import {periodOf,periodDomain,periodLedgerError,ledgerEntry} from './period.js';
import {presidentMatchesClub} from './presidents.js';
import {createCoach} from './coach-model.js';
import {applyCoachMoraleEvent} from './morale.js';

export const MANAGEMENT_BALANCE = Object.freeze({
  referenceTicketITL:1200, maximumTicketITL:1000000,
  baseFill:.30, fanFill:.42, stadiumFill:.18, formFill:.10, pricePenalty:.38,
  normalWinFanDelta:2, normalLossFanDelta:-2, stadiumRepairCostUnitITL:20000,
  presidentApprovalThreshold:45, retainedCashPayrollWeeks:1,
});
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const id=(value,label)=>{if(typeof value!=='string'||!value.trim())throw new TypeError(label+' required');return value;};
const score=(value,label)=>{if(!Number.isInteger(value)||value<0||value>100)throw new RangeError(label+' must be integer 0..100');return value;};
function rules(settings={}) {
  if(!settings||typeof settings!=='object'||Array.isArray(settings))throw new TypeError('balance must be object');
  const b={...MANAGEMENT_BALANCE,...settings};
  for(const [key,value] of Object.entries(b))if(typeof value!=='number'||!Number.isFinite(value)||(value<0&&key!=='normalLossFanDelta'))throw new RangeError('invalid balance '+key);
  if(!Number.isSafeInteger(b.referenceTicketITL)||b.referenceTicketITL<1 || !Number.isSafeInteger(b.maximumTicketITL))throw new RangeError('invalid ticket balance');
  return b;
}
const checkedPresident=(club,profile)=>{
  if(!presidentMatchesClub(club,profile))throw new Error('president_mismatch');
  return profile;
};
const checkedCoach=(coach,club)=>{
  if(coach?.clubId!==club?.id)throw new Error('coach_not_employed_at_club');
  const c=createCoach(coach);
  if(c.gameOver || c.morale===0)throw new Error('game_over');
  return c;
};
/** Do not fabricate a venue: absent capacity/condition/price fail on ticket actions. */
function stadiumOf(club) {
  const s=club?.stadium;
  if(!s || typeof s!=='object')throw new Error('stadium_data_required');
  integer(s.capacity,'stadium.capacity');
  if(s.capacity===0)throw new RangeError('stadium.capacity must be positive');
  score(s.condition,'stadium.condition');
  integer(s.ticketPriceITL,'stadium.ticketPriceITL');
  return s;
}
/** Copy only: club identity and finances are authoritative. */
export function initializeManagement(club,profile) {
  checkedPresident(club,profile);
  const c=copy(club),t=profile.traits;
  const b={...c.boardTraits};
  b.papponeria=score(b.papponeria??profile.papponeria??Math.round(t.frugality*.65+t.vanity*.35),'boardTraits.papponeria');
  b.spendingWillingness=score(b.spendingWillingness??Math.round((100-t.frugality)*.7+t.ambition*.3),'boardTraits.spendingWillingness');
  b.fanAttachment=score(b.fanAttachment??Math.round((t.ambition+t.patience)/2),'boardTraits.fanAttachment');
  c.boardTraits=b;
  c.supporters={...(c.supporters??{}),approval:score(c.supporters?.approval??50,'supporters.approval')};
  const m=c.management??{};
  if(m.version!==undefined&&m.version!==1)throw new Error('unsupported_management_schema');
  for(const key of ['ticketChanges','stadiumSettlements','requests'])
    if(m[key]!==undefined&&!Array.isArray(m[key]))throw new TypeError('management.'+key+' must be an array');
  if(m.shouts!==undefined&&(!m.shouts||typeof m.shouts!=='object'||Array.isArray(m.shouts)))throw new TypeError('management.shouts must be object');
  c.management={...m,version:1,ticketChanges:m.ticketChanges??[],stadiumSettlements:m.stadiumSettlements??[],requests:m.requests??[],shouts:m.shouts??{}};
  if(c.stadium)stadiumOf(c);
  return c;
}
/** Used by shout port even when the stadium is unavailable. */
export function ensureShoutLedger(club) {
  const c=copy(club),m=c.management??{};
  if(m.version!==undefined&&m.version!==1)throw new Error('unsupported_management_schema');
  c.management={...m,version:1,shouts:{...(m.shouts??{})}};
  return c;
}
function periodChecked(club,input) {
  const p=periodOf(input);
  const err=periodLedgerError(club,p);
  if(err)throw new Error(err);
  for(const key of ['ticketChanges','stadiumSettlements','requests'])
    for(const entry of club.management?.[key]??[])
      if(periodDomain(entry.periodKey)!==periodDomain(p.key))throw new Error('period_migration_required');
  return p;
}
function successRate(club){
  const results=(club.board?.results??[]).slice(-5);
  return results.length?results.reduce((sum,r)=>sum+(r.result==='win'?1:r.result==='draw'?.5:0),0)/results.length:.5;
}
export function coachPresidentCompatibility(coach,profile) {
  const c=createCoach(coach),t=profile?.traits;
  if(!t)throw new Error('president_profile_required');
  return Math.round(clamp(50+(c.traits.leadership-t.authoritarianism)*.23+
    (c.traits.patience-t.patience)*.18+(c.traits.selfEsteem-t.vanity)*.1));
}
export function recommendTicketPrice(club,profile,settings={}) {
  const c=initializeManagement(club,profile),b=rules(settings);
  stadiumOf(c);
  const pap=c.boardTraits.papponeria;
  const form=successRate(c);
  return Math.round((b.referenceTicketITL*(.75+pap/200+form*.30))/50)*50;
}
/** President's greed creates a gameplay price floor; a 0-greed patron permits free entry. */
export function presidentTicketFloor(club,profile,settings={}) {
  const c=initializeManagement(club,profile);
  const recommended=recommendTicketPrice(c,profile,settings);
  return Math.round(recommended*(c.boardTraits.papponeria/150)/50)*50;
}
export function setTicketPrice(club,profile,{eventId,priceITL,period,balance={}}={}) {
  id(eventId,'eventId');integer(priceITL,'priceITL');
  const c=initializeManagement(club,profile),p=periodChecked(c,period),b=rules(balance);
  stadiumOf(c);
  if(priceITL>b.maximumTicketITL)throw new RangeError('ticket_price_above_cap');
  if(priceITL<presidentTicketFloor(c,profile,balance))return {accepted:false,reason:'president_refuses_low_price',club:c};
  if(c.management.ticketChanges.some(x=>x.eventId===eventId))return {accepted:false,reason:'already_applied',club:c};
  if(c.management.ticketChanges.some(x=>x.periodKey===p.key))return {accepted:false,reason:'price_already_set_this_period',club:c};
  const before=c.stadium.ticketPriceITL;
  c.stadium.ticketPriceITL=priceITL;
  c.management.ticketChanges.push({eventId,...ledgerEntry(p),was:before,now:priceITL,presidentId:profile.id});
  return {accepted:true,club:c,was:before,priceITL};
}
function matchVerified(club,fixture,p){
  if(!fixture||typeof fixture!=='object'||fixture.homeId!==club.id||!fixture.awayId||fixture.awayId===club.id)
    throw new Error('verified_home_fixture_required');
  id(fixture.id,'fixture.id');
  const row=club.board?.results?.find(x=>x.matchId===fixture.id);
  if(!row || !club.board.lastMatchIds?.includes(fixture.id))throw new Error('board_review_of_real_match_required');
  if(row.periodKey!==undefined && row.periodKey!==p.key)throw new Error('fixture_period_mismatch');
  if(!['win','draw','loss'].includes(row.result))throw new Error('invalid_board_result');
  if(fixture.result){
    const score=fixture.result.score;
    if(!score||score.home!==row.gf||score.away!==row.ga)throw new Error('fixture_result_mismatch');
  }
  return row;
}
/** Path A: receipt is a real book() income, tied to a reviewed home fixture. */
export function settleHomeAttendance(club,coach,profile,{fixture,period,balance={}}={}) {
  checkedCoach(coach,club);
  const c=initializeManagement(club,profile),p=periodChecked(c,period),b=rules(balance);
  const s=stadiumOf(c);
  if(fixture?.id && c.management.stadiumSettlements.some(x=>x.fixtureId===fixture.id))
    return {accepted:false,reason:'already_settled',club:c,coach};
  const row=matchVerified(c,fixture,p);
  if(!c.finance)throw new Error('finances_not_initialized');
  const ratio=s.ticketPriceITL/b.referenceTicketITL;
  const fill=clamp(b.baseFill+b.fanFill*c.supporters.approval/100+
    b.stadiumFill*s.condition/100+b.formFill*successRate(c)-b.pricePenalty*Math.max(0,ratio-1),0,1);
  const attendance=Math.min(s.capacity,Math.round(s.capacity*fill));
  const revenue=attendance*s.ticketPriceITL;
  integer(revenue,'stadium_revenue');
  const paid=book(c,{type:'income',amount:revenue,...ledgerEntry(p),note:'tickets:'+fixture.id});
  if(!paid.accepted)throw new Error(paid.reason);
  const next=paid.club;
  const fanDelta=Math.round(clamp((row.result==='win'?b.normalWinFanDelta:row.result==='loss'?b.normalLossFanDelta:0)+
    (s.condition-50)/30-Math.max(0,ratio-1)*4,-8,8));
  const payroll=weeklyPayroll(next);
  const boardDelta=revenue>=payroll?1:revenue<payroll/4?-1:0;
  next.supporters.approval=Math.round(clamp(next.supporters.approval+fanDelta));
  next.boardTrust=Math.round(clamp(next.boardTrust+boardDelta));
  const moraleDelta=fanDelta<0?-Math.min(4,Math.ceil(-fanDelta/2)):fanDelta>0?1:0;
  const effect=applyCoachMoraleEvent(coach,{eventId:'stadium:'+fixture.id,sourceId:'home_gate:'+fixture.id,
    reason:'stadium_gate',moraleDelta,relationships:{fans:fanDelta,board:boardDelta}});
  if(!effect.accepted)throw new Error('stadium_morale_'+effect.reason);
  const record={...ledgerEntry(p),fixtureId:fixture.id,attendance,revenue,
    priceITL:s.ticketPriceITL,fanDelta,boardDelta,moraleDelta,result:row.result};
  next.management.stadiumSettlements.push(record);
  next.board.notices.push({...ledgerEntry(p),kind:'stadium',fixtureId:fixture.id,attendance,revenue,fanDelta});
  return {accepted:true,club:next,coach:effect.coach,settlement:record};
}
const REQUEST_KINDS=new Set(['stadium_repair','training_facilities','market_mandate']);
/** Path B step 1: record one coach proposal, never debit before a decision. */
export function submitPresidentRequest(club,coach,profile,{requestId,kind,amountITL,period}={}){
  id(requestId,'requestId');if(!REQUEST_KINDS.has(kind))throw new Error('unsupported_board_request');
  integer(amountITL,'amountITL');if(amountITL===0)throw new RangeError('request_amount_must_be_positive');
  checkedCoach(coach,club);
  const c=initializeManagement(club,profile),p=periodChecked(c,period);
  if(c.management.requests.some(r=>r.id===requestId))return {accepted:false,reason:'request_exists',club:c};
  const request={id:requestId,kind,amountITL,status:'pending',presidentId:profile.id,...ledgerEntry(p)};
  c.management.requests.push(request);
  return {accepted:true,club:c,request};
}
/** Deterministic and reasoned: greed, availability, board trust and character compatibility all count. */
export function decidePresidentRequest(club,coach,profile,{requestId,period,balance={}}={}) {
  id(requestId,'requestId');checkedCoach(coach,club);
  const c=initializeManagement(club,profile),p=periodChecked(c,period),b=rules(balance);
  const request=c.management.requests.find(r=>r.id===requestId);
  if(!request)return {accepted:false,reason:'request_not_found',club:c,coach};
  if(request.status!=='pending')return {accepted:false,reason:'already_decided',club:c,coach};
  if(request.presidentId!==profile.id)throw new Error('president_mismatch');
  const cash=integer(c.finance?.cash,'finance.cash');
  const payroll=weeklyPayroll(c);
  const available=Math.max(0,cash-payroll*b.retainedCashPayrollWeeks);
  const reserved=c.management.requests.filter(r=>r.kind==='market_mandate'&&r.status==='approved')
    .reduce((sum,r)=>sum+r.amountITL,0);
  integer(reserved,'reserved_market_budget');
  const free=Math.max(0,available-reserved);
  const compatibility=coachPresidentCompatibility(coach,profile);
  const policyScore=Math.round(clamp(c.boardTraits.spendingWillingness*.37+
    (100-c.boardTraits.papponeria)*.27+c.boardTrust*.18+compatibility*.18+
    (request.kind==='stadium_repair'?(c.boardTraits.fanAttachment-50)*.08:0)-
    (cash?request.amountITL/cash*30:30),0,100));
  let reason='approved';
  if(c.finance?.arrears>0)reason='unpaid_liabilities';
  else if(request.amountITL>cash)reason='insufficient_cash';
  else if(request.amountITL>free)reason='payroll_or_mandate_reserve';
  else if(policyScore<b.presidentApprovalThreshold)reason='president_policy_rejects';
  let next=c;
  if(reason==='approved' && request.kind!=='market_mandate') {
    const out=book(next,{type:'expense',amount:request.amountITL,...ledgerEntry(p),note:'president_request:'+requestId});
    if(!out.accepted)reason=out.reason;else next=out.club;
  }
  const approved=reason==='approved';
  const item=next.management.requests.find(r=>r.id===requestId);
  item.status=approved?'approved':'rejected';item.decisionReason=reason;item.decisionPeriodKey=p.key;
  item.compatibility=compatibility;item.policyScore=policyScore;
  if(approved&&item.kind==='stadium_repair') {
    stadiumOf(next);
    item.conditionWas=next.stadium.condition;
    next.stadium.condition=Math.round(clamp(next.stadium.condition+
      Math.max(1,Math.min(25,Math.floor(request.amountITL/b.stadiumRepairCostUnitITL)))));
    item.conditionNow=next.stadium.condition;
    next.supporters.approval=Math.round(clamp(next.supporters.approval+2));
  }
  if(approved&&item.kind==='training_facilities') {
    next.management.trainingQuality=Math.round(clamp((next.management.trainingQuality??50)+
      Math.max(1,Math.min(10,Math.floor(request.amountITL/100000)))));
  }
  const boardDelta=approved?2:-2;
  next.boardTrust=Math.round(clamp(next.boardTrust+boardDelta));
  const fanDelta=approved&&item.kind==='stadium_repair'?2:0;
  const morale=applyCoachMoraleEvent(coach,{eventId:'president_request:'+requestId,sourceId:'board_request:'+requestId,
    reason:'president_request',moraleDelta:approved?1:-2,
    relationships:{board:boardDelta,...(fanDelta?{fans:fanDelta}:{})}});
  if(!morale.accepted)throw new Error('president_morale_'+morale.reason);
  next.board.notices.push({...ledgerEntry(p),kind:'president_request',requestId,decision:reason,
    presidentId:profile.id,amountITL:request.amountITL});
  return {accepted:true,approved,reason,club:next,coach:morale.coach,request:copy(item)};
}
