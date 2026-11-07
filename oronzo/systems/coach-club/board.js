import {copy,clamp,integer,rngFromSeed} from './core.js';
import {applyTrust} from './club.js';
import {book,settleWeek} from './finance.js';
import {presidentBehavior,presidentMatchesClub} from './presidents.js';
import {normalizeSeasonObjective} from './objectives.js';
import {periodOf,samePeriod,ledgerEntry,periodLedgerError} from './period.js';

const outcomeTrust={
  promotion:{win:4,draw:-1,loss:-5},top_half:{win:3,draw:0,loss:-4},
  safety:{win:3,draw:1,loss:-3},avoid_last:{win:3,draw:1,loss:-3},
  development:{win:2,draw:1,loss:-2}
};
const wrongPresident=(club,profile)=>presidentMatchesClub(club,profile)?null:
  {accepted:false,reason:'president_mismatch',club};

export function reviewMatch(club,profile,{matchId,snapshot,homeClubId,awayClubId,week,absoluteWeek,seasonYear},seed=1) {
  const mismatch=wrongPresident(club,profile);if(mismatch)return mismatch;
  const period=periodOf({week,absoluteWeek,seasonYear});
  const domainError=periodLedgerError(club,period);
  if(domainError)return {accepted:false,reason:domainError,club};
  if(!matchId)throw new Error('matchId required');
  // Unknown objectives are an integration error, never silent safety fallback.
  const objective=normalizeSeasonObjective(club.seasonObjective);
  if(snapshot?.phase!=='fulltime' || snapshot?.t<5400)
    return {accepted:false,reason:'not_fulltime',club};
  if(![homeClubId,awayClubId].includes(club.id)||homeClubId===awayClubId)
    return {accepted:false,reason:'wrong_match',club};
  const h=snapshot.score?.home,a=snapshot.score?.away;
  if(!Number.isSafeInteger(h)||h<0||!Number.isSafeInteger(a)||a<0)
    return {accepted:false,reason:'invalid_score',club};
  if(club.board.lastMatchIds.includes(matchId))
    return {accepted:false,reason:'already_recorded',club};
  const gf=homeClubId===club.id?h:a,ga=homeClubId===club.id?a:h;
  const result=gf>ga?'win':gf<ga?'loss':'draw';
  let c=copy(club);
  c.board.lastMatchIds.push(matchId);
  c.board.results.push({matchId,...ledgerEntry(period),result,gf,ga,objective});
  c.board.winStreak=result==='win'?c.board.winStreak+1:0;
  c.board.lossStreak=result==='loss'?c.board.lossStreak+1:0;
  const base=outcomeTrust[objective][result];
  const pressureScale=.7+(100-profile.traits.patience)/100;
  const delta=Math.round(base*(base<0?pressureScale:1));
  c=applyTrust(c,delta,'match:'+result,period.week);
  c.reputation=Math.round(clamp(c.reputation+(result==='win'?1:result==='loss'?-1:0)));
  if(c.finance?.arrears>0)c=applyTrust(c,-2,'unpaid_bills',period.week);
  if(c.boardTrust<35)c.board.weeksUnderPressure++;
  else c.board.weeksUnderPressure=0;
  const pressure=presidentBehavior(profile,{
    boardTrust:c.boardTrust,lossStreak:c.board.lossStreak,cash:c.budget
  },String(seed)+':dismiss');
  const eligible=c.boardTrust<=18 && c.board.weeksUnderPressure>=2;
  const fired=eligible && rngFromSeed(String(seed)+':sack')()<pressure.chances.dismissal;
  if(fired){
    c.board.status='sacked';
    c.board.notices.push({...ledgerEntry(period),kind:'dismissal',reason:'loss_of_confidence',presidentId:profile.id});
  }
  return {accepted:true,club:c,result,trustDelta:delta,dismissed:fired,presidentPressure:pressure.pressure};
}

export function conveneBoard(club,profile,{week,absoluteWeek,seasonYear,seed=1,marketNeed=0}={}) {
  const mismatch=wrongPresident(club,profile);if(mismatch)return mismatch;
  const period=periodOf({week,absoluteWeek,seasonYear});
  const domainError=periodLedgerError(club,period);
  if(domainError)return {accepted:false,reason:domainError,club};
  integer(marketNeed,'marketNeed');
  if(club.board.notices.some(n=>n.kind==='meeting'&&samePeriod(n,period)))
    return {accepted:false,reason:'already_met_this_week',club};
  const policy=presidentBehavior(profile,{
    boardTrust:club.boardTrust,lossStreak:club.board.lossStreak,
    cash:club.budget,requestedFee:marketNeed
  },seed);
  let c=copy(club);
  const requests=[];
  if(policy.decisions.interference)
    requests.push({id:'formation',kind:'tactics',requested:'more_aggressive',mandatory:false});
  if(policy.decisions.ultimatum)
    requests.push({id:'win',kind:'result_target',requested:'win_next_match',mandatory:false});
  if(policy.decisions.publicStatement)
    c.board.notices.push({...ledgerEntry(period),kind:'media',presidentId:profile.id,
      tone:policy.pressure>65?'critical':'reassuring'});
  if(policy.decisions.promise && marketNeed>0)
    c.board.promises.push({...ledgerEntry(period),amount:marketNeed,
      dueWeek:period.week+2,
      ...(period.absoluteWeek===undefined?{}:{dueAbsoluteWeek:period.absoluteWeek+2}),
      status:'pledged',presidentId:profile.id});
  c.board.notices.push({...ledgerEntry(period),kind:'meeting',
    requests,presidentId:profile.id,pressure:policy.pressure});
  return {accepted:true,club:c,requests,policy};
}

export function answerBoardRequest(club,coach,{week,absoluteWeek,seasonYear,requestId,response}) {
  if(coach.clubId!==club.id)return {accepted:false,reason:'wrong_club',club};
  if(!['accept','negotiate','decline'].includes(response))
    return {accepted:false,reason:'bad_response',club};
  const period=periodOf({week,absoluteWeek,seasonYear});
  const domainError=periodLedgerError(club,period);
  if(domainError)return {accepted:false,reason:domainError,club};
  const meeting=club.board.notices.find(n=>n.kind==='meeting'&&samePeriod(n,period));
  if(meeting && meeting.presidentId!==club.presidentId)
    return {accepted:false,reason:'president_mismatch',club};
  const target=meeting?.requests?.find(r=>r.id===requestId);
  if(!target)return {accepted:false,reason:'request_not_found',club};
  if(target.response)return {accepted:false,reason:'already_answered',club};
  let c=copy(club);
  const item=c.board.notices.find(n=>n.kind==='meeting'&&samePeriod(n,period))
    .requests.find(r=>r.id===requestId);
  item.response=response;
  c=applyTrust(c,response==='accept'?2:response==='negotiate'?0:-3,
    'president_request:'+response,period.week);
  return {accepted:true,club:c,request:item};
}

export function resolvePromises(club,{week,absoluteWeek,seasonYear,confirmedContributions={}}={}) {
  const period=periodOf({week,absoluteWeek,seasonYear});
  const domainError=periodLedgerError(club,period);
  if(domainError)throw new Error(domainError);
  let c=copy(club);
  for(let i=0;i<c.board.promises.length;i++) {
    const promise=c.board.promises[i];
    if(promise.status!=='pledged')continue;
    if(promise.presidentId && promise.presidentId!==c.presidentId)
      throw new Error('promise belongs to a different president');
    if(promise.dueAbsoluteWeek!==undefined && period.absoluteWeek===undefined)
      throw new Error('absoluteWeek required for promise deadline');
    const now=promise.dueAbsoluteWeek!==undefined?period.absoluteWeek:period.week;
    const deadline=promise.dueAbsoluteWeek??promise.dueWeek;
    const contribution=confirmedContributions[promise.periodKey] ??
      (typeof promise.periodKey==='number'||promise.periodKey===undefined
        ?confirmedContributions[promise.week]:undefined) ?? 0;
    integer(contribution,'confirmedContribution');
    if(contribution>=promise.amount && now<=deadline){
      c=book(c,{type:'income',amount:promise.amount,...ledgerEntry(period),
        note:'verified_president_contribution'}).club;
      c.board.promises[i].status='honored';
      c.board.promises[i].resolvedWeek=period.week;
      c.board.promises[i].resolvedPeriodKey=period.key;
    }else if(now>deadline){
      c.board.promises[i].status='broken';
      c.board.promises[i].resolvedWeek=period.week;
      c.board.promises[i].resolvedPeriodKey=period.key;
      c=applyTrust(c,-3,'broken_promise',period.week);
      c.players.forEach(player=>{
        if(player.mental)player.mental.morale=Math.round(clamp((player.mental.morale??50)-2));
      });
    }
  }
  return c;
}

export function applyClubEvent(club,event,optionId,{week,absoluteWeek,seasonYear}={}) {
  const period=periodOf({week,absoluteWeek,seasonYear});
  const domainError=periodLedgerError(club,period);
  if(domainError)return {accepted:false,reason:domainError,club};
  if(!event?.id || event.clubId!==club.id || !Array.isArray(event.options))
    return {accepted:false,reason:'invalid_event',club};
  const option=event.options.find(o=>o.id===optionId);
  if(!option)return {accepted:false,reason:'option_missing',club};
  const previous=club.board.eventsUsed[event.id];
  if(previous){
    const sameSeason=seasonYear===undefined || previous.seasonYear===undefined ||
      previous.seasonYear===seasonYear;
    if(event.oncePerSeason && sameSeason)return {accepted:false,reason:'cooldown',club};
    const difference=absoluteWeek!==undefined && previous.absoluteWeek!==undefined
      ?absoluteWeek-previous.absoluteWeek
      :sameSeason?period.week-previous.lastWeek:Infinity;
    if(difference<(event.cooldownWeeks??0))return {accepted:false,reason:'cooldown',club};
  }
  const effects=option.effects||{};
  if(Object.keys(effects).some(k=>!['boardTrust','presidentTrust','morale','expense','sponsorIncome'].includes(k)))
    return {accepted:false,reason:'unsupported_effect',club};
  for(const [k,v]of Object.entries(effects)){
    const money=['expense','sponsorIncome'].includes(k),limit=money?1000000:15;
    if(!Number.isSafeInteger(v)||v<(money?0:-limit)||v>limit)
      return {accepted:false,reason:'effect_out_of_bounds',club};
  }
  let c=copy(club);
  if(effects.expense){
    const paid=book(c,{type:'expense',amount:effects.expense,...ledgerEntry(period),note:'event:'+event.id});
    if(!paid.accepted)return {accepted:false,reason:'insufficient_cash',club};
    c=paid.club;
  }
  if(effects.sponsorIncome)
    c=book(c,{type:'income',amount:effects.sponsorIncome,...ledgerEntry(period),
      note:'sponsor_event:'+event.id}).club;
  c.boardTrust=Math.round(clamp(c.boardTrust+(effects.boardTrust??0)+(effects.presidentTrust??0)));
  for(const p of c.players)
    if(p.mental)p.mental.morale=Math.round(clamp((p.mental.morale??50)+(effects.morale??0)));
  c.board.eventsUsed[event.id]={
    lastWeek:period.week,periodKey:period.key,
    ...(period.absoluteWeek===undefined?{}:{absoluteWeek:period.absoluteWeek}),
    ...(period.seasonYear===undefined?{}:{seasonYear:period.seasonYear}),
    count:(previous?.count??0)+1
  };
  c.board.notices.push({...ledgerEntry(period),kind:'narrative_event',id:event.id,optionId});
  return {accepted:true,club:c,effects:copy(effects)};
}

export function endClubWeek(club,{week,absoluteWeek,seasonYear,away=false,bonus=0,otherIncome=0}) {
  const period=periodOf({week,absoluteWeek,seasonYear});
  const settled=settleWeek(club,{...ledgerEntry(period),away,bonus,otherIncome});
  if(!settled.accepted)return settled;
  let c=settled.club;
  if(c.finance.arrears>0){
    c=applyTrust(c,-2,'unpaid_commitments',period.week);
    c.players.forEach(p=>{
      if(p.mental)p.mental.morale=Math.round(clamp((p.mental.morale??50)-1));
    });
  }
  return {...settled,club:c};
}
