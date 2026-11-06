import {copy,clamp,integer,rngFromSeed} from './core.js';
import {applyTrust} from './club.js';
import {book,settleWeek} from './finance.js';
import {presidentBehavior,validatePresident} from './presidents.js';

const outcomeTrust={promotion:{win:4,draw:-1,loss:-5},top_half:{win:3,draw:0,loss:-4},
 safety:{win:3,draw:1,loss:-3},avoid_last:{win:3,draw:1,loss:-3},development:{win:2,draw:1,loss:-2}};
export function reviewMatch(club,profile,{matchId,snapshot,homeClubId,awayClubId,week},seed=1) {
  validatePresident(profile);
  if(!matchId || !Number.isSafeInteger(week) ||week<0) throw new Error('matchId and week are required');
  if(snapshot?.phase!=='fulltime' || snapshot?.t<5400) return {accepted:false,reason:'not_fulltime',club};
  if(![homeClubId,awayClubId].includes(club.id)||homeClubId===awayClubId)
    return {accepted:false,reason:'wrong_match',club};
  const h=snapshot.score?.home, a=snapshot.score?.away;
  if(!Number.isSafeInteger(h)||h<0||!Number.isSafeInteger(a)||a<0)
    return {accepted:false,reason:'invalid_score',club};
  if(club.board.lastMatchIds.includes(matchId))return {accepted:false,reason:'already_recorded',club};
  const gf=homeClubId===club.id?h:a,ga=homeClubId===club.id?a:h;
  const result=gf>ga?'win':gf<ga?'loss':'draw';
  let c=copy(club);
  c.board.lastMatchIds.push(matchId);
  c.board.results.push({matchId,week,result,gf,ga});
  c.board.winStreak=result==='win'?c.board.winStreak+1:0;
  c.board.lossStreak=result==='loss'?c.board.lossStreak+1:0;
  const adjustments=outcomeTrust[c.seasonObjective]||outcomeTrust.safety;
  const pressureScale=.7+(100-profile.traits.patience)/100;
  const base=adjustments[result];
  const delta=Math.round(base*(base<0?pressureScale:1));
  c=applyTrust(c,delta,'match:'+result,week);
  c.reputation=Math.round(clamp(c.reputation+(result==='win'?1:result==='loss'?-1:0)));
  if(c.finance?.arrears>0) c=applyTrust(c,-2,'unpaid_bills',week);
  if(c.boardTrust<35) c.board.weeksUnderPressure++;
  else c.board.weeksUnderPressure=0;
  const press=presidentBehavior(profile,{boardTrust:c.boardTrust,lossStreak:c.board.lossStreak,cash:c.budget},String(seed)+':dismiss');
  const eligible=c.boardTrust<=18 && c.board.weeksUnderPressure>=2;
  const fired=eligible && rngFromSeed(String(seed)+':sack')()<press.chances.dismissal;
  if(fired) {c.board.status='sacked';c.board.notices.push({week,kind:'dismissal',reason:'loss_of_confidence'});}
  return {accepted:true,club:c,result,trustDelta:delta,dismissed:fired,presidentPressure:press.pressure};
}
export function conveneBoard(club,profile,{week,seed=1,marketNeed=0}={}) {
  validatePresident(profile);integer(week,'week');integer(marketNeed,'marketNeed');
  if(club.board.notices.some(n=>n.kind==='meeting' && n.week===week))
    return {accepted:false,reason:'already_met_this_week',club};
  const policy=presidentBehavior(profile,{boardTrust:club.boardTrust,lossStreak:club.board.lossStreak,cash:club.budget,requestedFee:marketNeed},seed);
  let c=copy(club);
  const requests=[];
  if(policy.decisions.interference)requests.push({id:'formation',kind:'tactics',requested:'more_aggressive',mandatory:false});
  if(policy.decisions.ultimatum)requests.push({id:'win',kind:'result_target',requested:'win_next_match',mandatory:false});
  if(policy.decisions.publicStatement) c.board.notices.push({week,kind:'media',tone:policy.pressure>65?'critical':'reassuring'});
  if(policy.decisions.promise && marketNeed>0)
    c.board.promises.push({week,amount:marketNeed,dueWeek:week+2,status:'pledged'});
  c.board.notices.push({week,kind:'meeting',requests,presidentId:profile.id,pressure:policy.pressure});
  return {accepted:true,club:c,requests,policy};
}
export function answerBoardRequest(club,coach,{week,requestId,response}) {
  if(coach.clubId!==club.id) return {accepted:false,reason:'wrong_club',club};
  if(!['accept','negotiate','decline'].includes(response))return {accepted:false,reason:'bad_response',club};
  const meeting=club.board.notices.find(n=>n.kind==='meeting'&&n.week===week);
  const target=meeting?.requests?.find(r=>r.id===requestId);
  if(!target)return {accepted:false,reason:'request_not_found',club};
  if(target.response)return {accepted:false,reason:'already_answered',club};
  let c=copy(club);
  const q=c.board.notices.find(n=>n.kind==='meeting'&&n.week===week).requests.find(r=>r.id===requestId);
  q.response=response;
  c=applyTrust(c,response==='accept'?2:response==='negotiate'?0:-3,'president_request:'+response,week);
  return {accepted:true,club:c,request:q};
}
export function resolvePromises(club,{week,confirmedContributions={}}) {
  integer(week,'week');let c=copy(club);
  for(let i=0;i<c.board.promises.length;i++) {
    const p=c.board.promises[i];
    if(p.status!=='pledged')continue;
    const contribution=confirmedContributions[p.week] ?? 0;
    integer(contribution,'confirmedContribution');
    if(contribution>=p.amount && week<=p.dueWeek){
      c=book(c,{type:'income',amount:p.amount,week,note:'verified_president_contribution'}).club;
      c.board.promises[i].status='honored';c.board.promises[i].resolvedWeek=week;
    }else if(week>p.dueWeek){
      c.board.promises[i].status='broken';c.board.promises[i].resolvedWeek=week;
      c=applyTrust(c,-3,'broken_promise',week);
      c.players.forEach(player=>{if(player.mental)player.mental.morale=Math.round(clamp((player.mental.morale??50)-2));});
    }
  }
  return c;
}
export function applyClubEvent(club,event,optionId,{week}) {
  integer(week,'week');
  if(!event?.id || event.clubId!==club.id || !Array.isArray(event.options))
    return {accepted:false,reason:'invalid_event',club};
  const option=event.options.find(o=>o.id===optionId);
  if(!option)return {accepted:false,reason:'option_missing',club};
  const previous=club.board.eventsUsed[event.id];
  if(previous && (event.oncePerSeason || week-previous.lastWeek<(event.cooldownWeeks??0)))
    return {accepted:false,reason:'cooldown',club};
  const effects=option.effects||{};
  if(Object.keys(effects).some(k=>!['boardTrust','presidentTrust','morale','expense','sponsorIncome'].includes(k)))
    return {accepted:false,reason:'unsupported_effect',club};
  for(const [k,v] of Object.entries(effects)) {
    const limit=['expense','sponsorIncome'].includes(k)?1000000:15;
    if(!Number.isSafeInteger(v)||v<(['expense','sponsorIncome'].includes(k)?0:-limit)||v>limit)
      return {accepted:false,reason:'effect_out_of_bounds',club};
  }
  let c=copy(club);
  if(effects.expense) {
    const paid=book(c,{type:'expense',amount:effects.expense,week,note:'event:'+event.id});
    if(!paid.accepted)return {accepted:false,reason:'insufficient_cash',club};
    c=paid.club;
  }
  if(effects.sponsorIncome) c=book(c,{type:'income',amount:effects.sponsorIncome,week,note:'sponsor_event:'+event.id}).club;
  c.boardTrust=Math.round(clamp(c.boardTrust+(effects.boardTrust??0)+(effects.presidentTrust??0)));
  for(const p of c.players) if(p.mental) p.mental.morale=Math.round(clamp((p.mental.morale??50)+(effects.morale??0)));
  c.board.eventsUsed[event.id]={lastWeek:week,count:(previous?.count??0)+1};
  c.board.notices.push({week,kind:'narrative_event',id:event.id,optionId});
  return {accepted:true,club:c,effects:copy(effects)};
}
export function endClubWeek(club,{week,away=false,bonus=0,otherIncome=0}) {
  const settled=settleWeek(club,{week,away,bonus,otherIncome});
  if(!settled.accepted)return settled;
  let c=settled.club;
  if(c.finance.arrears>0){
    c=applyTrust(c,-2,'unpaid_commitments',week);
    c.players.forEach(p=>{if(p.mental)p.mental.morale=Math.round(clamp((p.mental.morale??50)-1));});
  }
  return {...settled,club:c};
}
