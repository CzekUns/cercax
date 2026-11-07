import {copy,integer,clamp,rngFromSeed} from './core.js';
import {book,weeklyPayroll} from './finance.js';
import {presidentBehavior,presidentMatchesClub} from './presidents.js';

function findRequest(club,id) {
  return club.market.requests.find(r=>r.id===id);
}
export function requestTransfer(club, coach, {id,player,askingFee,weeklyWage,reason='tactical_need',week=0}) {
  if(coach.clubId!==club.id) return {accepted:false,reason:'wrong_club',club};
  if(!id || !player?.id || !player?.name || !Array.isArray(player.positions)) throw new Error('valid player candidate required');
  integer(askingFee,'askingFee');integer(weeklyWage,'weeklyWage');
  if(club.players.some(p=>p.id===player.id)) return {accepted:false,reason:'already_owned',club};
  if(findRequest(club,id)) return {accepted:false,reason:'request_exists',club};
  const c=copy(club);
  c.market.requests.push({id,kind:'buy',player:copy(player),askingFee,weeklyWage,reason,week,status:'proposed',history:[{status:'proposed',week,actor:'coach'}]});
  return {accepted:true,club:c,requestId:id};
}
export function reviewTransfer(club, profile, requestId, seed=1) {
  if(!presidentMatchesClub(club,profile))return {accepted:false,reason:'president_mismatch',club};
  const request=findRequest(club,requestId);
  if(!request || request.kind!=='buy' || request.status!=='proposed') return {accepted:false,reason:'not_a_pending_request',club};
  let reason=''; const director=club.staff?.sportingDirector;
  const payroll=weeklyPayroll(club);
  if(request.askingFee>club.finance.cash) reason='insufficient_cash';
  else if(payroll+request.weeklyWage>club.wageBudget) reason='wage_ceiling';
  else if(!director || (director.competence??50)<15) reason='director_rejects';
  const p=presidentBehavior(profile,{
    boardTrust:club.boardTrust,lossStreak:club.board.lossStreak,
    cash:club.finance.cash,requestedFee:request.askingFee},seed);
  const dsChance=clamp(.35+(director?.competence??50)*.006,0,1);
  const dsAccept=rngFromSeed(String(seed)+':director')()<dsChance;
  if(!reason && !dsAccept) reason='sporting_director_rejects';
  if(!reason && !p.decisions.marketApproval) reason='president_rejects';
  const c=copy(club);const entry=findRequest(c,requestId);
  entry.status=reason?'rejected':'approved';
  entry.boardReason=reason||'approved_to_negotiate';
  entry.maxFee=request.askingFee;entry.maxWeeklyWage=request.weeklyWage;
  entry.history.push({status:entry.status,actor:'club',reason:entry.boardReason,seed});
  return {accepted:!reason,club:c,reason:reason||undefined,president:p,request:copy(entry)};
}
export function negotiateWithSeller(club,requestId,{sellerAccepts,sellerFee,agreedWage}) {
  const r=findRequest(club,requestId);
  if(!r || r.kind!=='buy' || r.status!=='approved') return {accepted:false,reason:'not_authorized',club};
  integer(sellerFee,'sellerFee');integer(agreedWage,'agreedWage');
  if(!sellerAccepts) return {accepted:false,reason:'seller_declined',club};
  if(sellerFee>r.maxFee || agreedWage>r.maxWeeklyWage)
    return {accepted:false,reason:'exceeds_board_mandate',club};
  const c=copy(club);const item=findRequest(c,requestId);
  item.status='negotiated';item.agreement={sellerFee,agreedWage};
  item.history.push({status:'negotiated',actor:'director'});
  return {accepted:true,club:c};
}
export function finalizeTransfer(club,requestId,{week=0}={}) {
  const r=findRequest(club,requestId);
  if(!r || r.kind!=='buy' || r.status!=='negotiated') return {accepted:false,reason:'not_negotiated',club};
  if(club.players.some(p=>p.id===r.player.id)) return {accepted:false,reason:'already_owned',club};
  if(weeklyPayroll(club)+r.agreement.agreedWage>club.wageBudget)
    return {accepted:false,reason:'wage_ceiling',club};
  const payment=book(club,{type:'expense',amount:r.agreement.sellerFee,week,note:'transfer:'+r.player.id});
  if(!payment.accepted) return {accepted:false,reason:payment.reason,club};
  const c=payment.club;
  const signing=copy(r.player);signing.teamId=c.id;signing.contract={...(signing.contract||{}),weeklyWage:r.agreement.agreedWage};
  c.players.push(signing);
  const item=findRequest(c,requestId);item.status='completed';item.history.push({status:'completed',actor:'club',week});
  return {accepted:true,club:c,playerId:signing.id,fee:r.agreement.sellerFee};
}
export function requestSale(club,coach,{id,playerId,minimumFee,week=0}) {
  if(coach.clubId!==club.id)return {accepted:false,reason:'wrong_club',club};
  integer(minimumFee,'minimumFee');
  if(!club.players.some(p=>p.id===playerId))return {accepted:false,reason:'not_owned',club};
  if(findRequest(club,id))return {accepted:false,reason:'request_exists',club};
  const c=copy(club);
  c.market.requests.push({id,kind:'sell',playerId,minimumFee,week,status:'proposed',history:[{status:'proposed',actor:'coach',week}]});
  return {accepted:true,club:c};
}
export function decideSale(club,profile,requestId,seed=1) {
  if(!presidentMatchesClub(club,profile))return {accepted:false,reason:'president_mismatch',club};
  const r=findRequest(club,requestId);
  if(!r ||r.kind!=='sell'||r.status!=='proposed')return {accepted:false,reason:'not_pending',club};
  const t=profile.traits;const rng=rngFromSeed(seed);
  const probability=clamp(.3+t.frugality*.004+(100-t.ambition)*.0015,0,1);
  const approved=rng()<probability;
  const c=copy(club),item=findRequest(c,requestId);
  item.status=approved?'approved':'rejected';item.history.push({status:item.status,actor:'club',seed});
  return {accepted:approved,club:c,reason:approved?'approved':'board_wants_to_keep_player'};
}
export function finalizeSale(club,requestId,{buyerAccepts,fee,week=0}={}) {
  const r=findRequest(club,requestId);integer(fee,'fee');
  if(!r ||r.kind!=='sell'||r.status!=='approved')return {accepted:false,reason:'not_approved',club};
  if(!buyerAccepts || fee<r.minimumFee)return {accepted:false,reason:'no_acceptable_offer',club};
  if(!club.players.some(p=>p.id===r.playerId))return {accepted:false,reason:'player_not_owned',club};
  const receipt=book(club,{type:'income',amount:fee,week,note:'sale:'+r.playerId});
  const c=receipt.club;
  c.players=c.players.filter(p=>p.id!==r.playerId);
  const item=findRequest(c,requestId);item.status='completed';item.history.push({status:'completed',actor:'club',week});
  return {accepted:true,club:c,fee};
}
