/** R10 market port: Agent07 supplies validated transfer windows, 09 owns financing.
 * No historical calendar inference: absent/closed window fails closed.
 */
import {copy,integer} from './core.js';
import {periodOf,periodLedgerError,ledgerEntry} from './period.js';
import {requestTransfer,reviewTransfer,negotiateWithSeller,finalizeTransfer,requestSale,decideSale,finalizeSale} from './negotiations.js';
import {presidentMatchesClub} from './presidents.js';

function windowCheck(club,window,period) {
  const p=periodOf(period);
  if(!window||window.source!=='career-07'||typeof window.id!=='string'||!window.id)
    return {reason:'career07_market_window_required'};
  if(window.open!==true)return {reason:'market_window_closed'};
  if(!Number.isSafeInteger(window.seasonYear)||window.seasonYear!==p.seasonYear)
    return {reason:'market_window_season_mismatch'};
  if(!Number.isSafeInteger(p.absoluteWeek))return {reason:'absolute_week_required'};
  const ledgerError=periodLedgerError(club,p);
  if(ledgerError)return {reason:ledgerError};
  return {period:p};
}
function isCurrentMandate(club,mandateId,amount) {
  const req=club.management?.requests?.find(r=>r.id===mandateId);
  if(!req || req.kind!=='market_mandate'||req.status!=='approved')return 'approved_market_mandate_required';
  if(req.amountITL<amount)return 'fee_exceeds_president_mandate';
  return null;
}
function matchWindow(request,window){return request?.marketWindowId===window.id;}
/** Market request is still a real negotiations.js request with an explicit president mandate. */
export function requestTransferInWindow(club,coach,profile,{request,mandateId,window,period}={}){
  if(!presidentMatchesClub(club,profile))return {accepted:false,reason:'president_mismatch',club};
  if(coach?.clubId!==club.id)return {accepted:false,reason:'wrong_club',club};
  if(coach.gameOver||coach.morale===0)return {accepted:false,reason:'game_over',club};
  const result=windowCheck(club,window,period);if(result.reason)return {accepted:false,reason:result.reason,club};
  const amount=integer(request?.askingFee,'askingFee');
  const reason=isCurrentMandate(club,mandateId,amount);
  if(reason)return {accepted:false,reason,club};
  const outcome=requestTransfer(club,coach,{...request,week:result.period.week});
  if(!outcome.accepted)return outcome;
  const c=outcome.club,entry=c.market.requests.find(r=>r.id===request.id);
  entry.marketWindowId=window.id;entry.mandateId=mandateId;
  entry.requestedPeriodKey=result.period.key;
  return {...outcome,club:c};
}
/** Recheck the window before the manager can even ask for board consideration. */
export function reviewTransferInWindow(club,profile,{requestId,window,period,seed=1}={}){
  if(!presidentMatchesClub(club,profile))return {accepted:false,reason:'president_mismatch',club};
  const check=windowCheck(club,window,period);if(check.reason)return {accepted:false,reason:check.reason,club};
  const req=club.market?.requests?.find(r=>r.id===requestId);
  if(!matchWindow(req,window))return {accepted:false,reason:'market_window_changed',club};
  const reason=isCurrentMandate(club,req.mandateId,req.askingFee);
  if(reason)return {accepted:false,reason,club};
  return reviewTransfer(club,profile,requestId,seed);
}
export function negotiateTransferInWindow(club,{requestId,terms,window,period}={}){
  const check=windowCheck(club,window,period);if(check.reason)return {accepted:false,reason:check.reason,club};
  const req=club.market?.requests?.find(r=>r.id===requestId);
  if(!matchWindow(req,window))return {accepted:false,reason:'market_window_changed',club};
  return negotiateWithSeller(club,requestId,terms);
}
export function finalizeTransferInWindow(club,{requestId,window,period}={}){
  const check=windowCheck(club,window,period);if(check.reason)return {accepted:false,reason:check.reason,club};
  const req=club.market?.requests?.find(r=>r.id===requestId);
  if(!matchWindow(req,window))return {accepted:false,reason:'market_window_changed',club};
  const reason=isCurrentMandate(club,req.mandateId,req.agreement?.sellerFee??req.askingFee);
  if(reason)return {accepted:false,reason,club};
  const settled=finalizeTransfer(club,requestId,ledgerEntry(check.period));
  if(!settled.accepted)return settled;
  const c=settled.club,mandate=c.management.requests.find(x=>x.id===req.mandateId);
  mandate.status='spent';mandate.spentTransferId=requestId;
  return {...settled,club:c};
}
/** Sale paths also validate the career-owned window and original negotiations constraints. */
export function requestSaleInWindow(club,coach,{request,window,period}={}){
  if(coach?.gameOver||coach?.morale===0)return {accepted:false,reason:'game_over',club};
  const check=windowCheck(club,window,period);if(check.reason)return {accepted:false,reason:check.reason,club};
  const result=requestSale(club,coach,{...request,week:check.period.week});
  if(!result.accepted)return result;
  const c=result.club;c.market.requests.find(x=>x.id===request.id).marketWindowId=window.id;
  return {...result,club:c};
}
export function decideSaleInWindow(club,profile,{requestId,window,period,seed=1}={}){
  if(!presidentMatchesClub(club,profile))return {accepted:false,reason:'president_mismatch',club};
  const check=windowCheck(club,window,period);if(check.reason)return {accepted:false,reason:check.reason,club};
  if(!matchWindow(club.market?.requests?.find(r=>r.id===requestId),window))return {accepted:false,reason:'market_window_changed',club};
  return decideSale(club,profile,requestId,seed);
}
export function finalizeSaleInWindow(club,{requestId,window,period,buyerAccepts,fee}={}){
  const check=windowCheck(club,window,period);if(check.reason)return {accepted:false,reason:check.reason,club};
  if(!matchWindow(club.market?.requests?.find(r=>r.id===requestId),window))return {accepted:false,reason:'market_window_changed',club};
  return finalizeSale(club,requestId,{...ledgerEntry(check.period),buyerAccepts,fee});
}
