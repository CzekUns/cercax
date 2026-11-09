/** ORONZO 07B R11 · Career-owned transaction ports, consuming unmodified Coach09.
 * All rejected requests leave the source state unchanged, except explicit board
 * rejection decisions which are persisted as authorized 09 outcomes.
 */
import {initializeManagement,setTicketPrice,settleHomeAttendance,
 submitPresidentRequest,decidePresidentRequest,resolveClubPresident,
 requestTransferInWindow,reviewTransferInWindow,negotiateTransferInWindow,
 finalizeTransferInWindow,requestSaleInWindow,decideSaleInWindow,finalizeSaleInWindow,
 weeklyPayroll,book} from '../../systems/coach-club/index.js';

const copy=x=>JSON.parse(JSON.stringify(x));
const failure=reason=>({accepted:false,reason});
const commit=(state,draft)=>{for(const k of Object.keys(state))delete state[k];Object.assign(state,draft);};
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const capacity=Object.freeze({PROM:1200,INTER:2400,C2:4000,C1:6000,B:12000,A:24000});
export const CAREER_STADIUM_POLICY_R11=Object.freeze({
 source:'synthetic_gameplay_r11',description:'Impianto virtuale di bilanciamento, non dato storico',
 capacitiesByDivision:capacity,condition:70,ticketPriceITL:900
});
export const CAREER_MARKET_POLICY_R11=Object.freeze({
 source:'synthetic_gameplay_r11',description:'Finestre fittizie di gioco, non date di mercato 1979',
 openWeeks:[[1,4],[19,22]]
});
/** Only fresh careers: never backfill old saves with fabricated historical data. */
export function initializeCareerVenues(state,{policy=CAREER_STADIUM_POLICY_R11}={}){
 if(state?.flow?.stage!=='offers')return failure('initial_world_only');
 if(!policy||typeof policy.source!=='string')return failure('stadium_policy_required');
 const draft=copy(state);
 for(const club of draft.clubs){
  if(club.stadium)continue;
  const selected=policy.capacitiesByDivision?.[club.divisionId];
  if(!integer(selected)||selected<1||!Number.isInteger(policy.condition)||
     policy.condition<0||policy.condition>100||!integer(policy.ticketPriceITL))
   return failure('invalid_stadium_gameplay_policy');
  club.stadium={capacity:selected,condition:policy.condition,ticketPriceITL:policy.ticketPriceITL,
   provenance:policy.source,provenanceNote:policy.description};
 }
 draft.flow.stadiumPolicy={source:policy.source,description:policy.description};
 commit(state,draft);
 return {accepted:true,source:policy.source,clubs:state.clubs.length};
}
function context(state,presidents,expectedAbsoluteWeek,{hub=true}={}){
 if(state?.coach?.gameOver||state?.coach?.morale===0)return {error:'game_over'};
 if(!state?.coach?.clubId)return {error:'coach_unemployed'};
 if(hub&&state.flow?.stage!=='hub')return {error:'not_in_hub'};
 if(expectedAbsoluteWeek!==state.absoluteWeek)return {error:'stale_week_action'};
 const i=state.clubs.findIndex(c=>c.id===state.coach.clubId);
 if(i<0)return {error:'coach_club_missing'};
 const club=state.clubs[i];
 let president;
 try{president=resolveClubPresident(club,presidents)}catch(e){return {error:e.message}}
 return {index:i,club,president,period:{week:state.week,absoluteWeek:state.absoluteWeek,seasonYear:state.seasonYear}};
}
export function getCareerMarketWindow(state){
 if(state?.phase!=='inSeason')return {source:'career-07',open:false,id:'inactive',seasonYear:state?.seasonYear??0,
  policy:CAREER_MARKET_POLICY_R11.source};
 const range=CAREER_MARKET_POLICY_R11.openWeeks.find(([start,end])=>state.week>=start&&state.week<=end);
 return {source:'career-07',open:!!range,id:'market-'+state.seasonYear+'-'+(range?.[0]??'closed'),
  seasonYear:state.seasonYear,policy:CAREER_MARKET_POLICY_R11.source,assumption:true};
}
export function changeCareerTicketPrice(state,{presidentCatalog,clubId,priceITL,eventId,expectedAbsoluteWeek}={}){
 const c=context(state,presidentCatalog,expectedAbsoluteWeek);
 if(c.error)return failure(c.error);
 if(clubId!==c.club.id)return failure('wrong_coach_club');
 if(!integer(priceITL)||typeof eventId!=='string'||!eventId.trim())return failure('invalid_ticket_input');
 const draft=copy(state),club=draft.clubs[c.index];
 try{
  const result=setTicketPrice(club,c.president,{eventId,priceITL,period:c.period});
  if(!result.accepted)return failure(result.reason);
  draft.clubs[c.index]=result.club;
  commit(state,draft);
  return {accepted:true,priceITL,was:result.was,period:c.period};
 }catch(e){return failure(e.message)}
}
export function requestCareerPresident(state,{presidentCatalog,requestId,kind,amountITL,expectedAbsoluteWeek}={}){
 const c=context(state,presidentCatalog,expectedAbsoluteWeek);
 if(c.error)return failure(c.error);
 if(!integer(amountITL)||amountITL<=0)return failure('invalid_amountITL');
 const draft=copy(state);
 try{
  const result=submitPresidentRequest(draft.clubs[c.index],draft.coach,c.president,
   {requestId,kind,amountITL,period:c.period});
  if(!result.accepted)return failure(result.reason);
  draft.clubs[c.index]=result.club;
  commit(state,draft);
  return {accepted:true,request:result.request};
 }catch(e){return failure(e.message)}
}
export function decideCareerPresident(state,{presidentCatalog,requestId,expectedAbsoluteWeek}={}){
 const c=context(state,presidentCatalog,expectedAbsoluteWeek);
 if(c.error)return failure(c.error);
 const draft=copy(state);
 try{
  const result=decidePresidentRequest(draft.clubs[c.index],draft.coach,c.president,
   {requestId,period:c.period});
  if(!result.accepted)return failure(result.reason);
  draft.coach=result.coach;draft.clubs[c.index]=result.club;
  commit(state,draft);
  return {accepted:true,approved:result.approved,reason:result.reason,request:result.request};
 }catch(e){return failure(e.message)}
}
export function listCareerMarketCandidates(state,{limit=18}={}){
 const mine=state?.coach?.clubId;
 if(!mine)return [];
 return state.clubs.filter(c=>c.id!==mine).flatMap(c=>c.players.map(p=>({
  playerId:p.id,name:p.name,positions:p.positions,clubId:c.id,clubName:c.name,
  wageITL:p.contract?.weeklyWage??null,age:p.age??null}))).slice(0,Math.max(0,Math.min(50,limit)));
}
export function careerMarketOperation(state,{
 presidentCatalog,action,requestId,sellerClubId,playerId,feeITL,weeklyWage,
 mandateId,expectedAbsoluteWeek,sellerAccepts=true
}={}){
 const c=context(state,presidentCatalog,expectedAbsoluteWeek);
 if(c.error)return failure(c.error);
 const window=getCareerMarketWindow(state);
 if(!window.open)return failure('market_window_closed');
 const draft=copy(state),buyer=draft.clubs[c.index];
 const seller=draft.clubs.find(x=>x.id===sellerClubId&&x.id!==buyer.id);
 const period=c.period,pr=c.president;
 if(!requestId||typeof requestId!=='string')return failure('request_id_required');
 try{
  let out;
  if(action==='request'){
   const player=seller?.players.find(p=>p.id===playerId);
   if(!player)return failure('verified_seller_player_required');
   if(!integer(feeITL)||!integer(weeklyWage)||!mandateId)return failure('transfer_terms_required');
   out=requestTransferInWindow(buyer,draft.coach,pr,{request:{id:requestId,
    player:copy(player),askingFee:feeITL,weeklyWage,reason:'coach_request'},
    mandateId,window,period});
  }else if(action==='review'){
   out=reviewTransferInWindow(buyer,pr,{requestId,window,period,seed:state.seed+'|'+requestId});
  }else if(action==='negotiate'){
   const previous=buyer.market?.requests?.find(r=>r.id===requestId);
   if(!previous)return failure('transfer_request_missing');
   const original=draft.clubs.find(x=>x.id===previous.player?.teamId);
   if(!original?.players.some(p=>p.id===previous.player?.id))
    return failure('seller_no_longer_owns_player');
   out=negotiateTransferInWindow(buyer,{requestId,window,period,
    terms:{sellerAccepts,sellerFee:feeITL??previous.askingFee,
     agreedWage:weeklyWage??previous.weeklyWage}});
  }else if(action==='finalize'){
   const prev=buyer.market?.requests?.find(r=>r.id===requestId);
   if(!prev||prev.status!=='negotiated')return failure('transfer_not_negotiated');
   const original=draft.clubs.find(x=>x.id===prev.player.teamId&&x.id!==buyer.id);
   if(!original||original.players.filter(p=>p.id===prev.player.id).length!==1)
    return failure('seller_release_not_verified');
   const release={source:'career-07',confirmed:true,playerId:prev.player.id,sellerClubId:original.id};
   out=finalizeTransferInWindow(buyer,{requestId,window,period,sellerRelease:release});
   if(out.accepted){
    // Buyer expense is booked by 09; seller receipt uses the same 09 finance book.
    const receipt=book(original,{type:'income',amount:out.fee,...period,
      note:'seller_release:'+requestId});
    if(!receipt.accepted)return failure(receipt.reason);
    const sellerIndex=draft.clubs.findIndex(x=>x.id===original.id);
    receipt.club.players=receipt.club.players.filter(p=>p.id!==prev.player.id);
    if(out.club.players.filter(p=>p.id===prev.player.id).length!==1 ||
       receipt.club.players.some(p=>p.id===prev.player.id))
     return failure('transfer_roster_integrity_failed');
    draft.clubs[sellerIndex]=receipt.club;
   }
  }else return failure('unknown_market_action');
  // Board rejection is a real 09 decision; persist its rejected market request.
  if(!out.accepted){
   const decision=out.club?.market?.requests?.find(r=>r.id===requestId);
   if(action==='review'&&decision?.status==='rejected'){
    draft.clubs[c.index]=out.club;commit(state,draft);
    return {accepted:true,approved:false,reason:out.reason,request:decision};
   }
   return failure(out.reason);
  }
  draft.clubs[c.index]=out.club;
  commit(state,draft);
  return {accepted:true,approved:true,requestId,playerId:out.playerId??playerId,
   status:state.clubs[c.index].market.requests.find(r=>r.id===requestId)?.status};
 }catch(e){return failure(e.message)}
}

/** Sale from the coach's squad: an explicitly identified buyer, not phantom cash. */
export function careerSaleOperation(state,{presidentCatalog,action,requestId,playerId,
 buyerClubId,feeITL,expectedAbsoluteWeek}={}){
 const c=context(state,presidentCatalog,expectedAbsoluteWeek);
 if(c.error)return failure(c.error);
 const window=getCareerMarketWindow(state);
 if(!window.open)return failure('market_window_closed');
 const draft=copy(state),seller=draft.clubs[c.index],period=c.period;
 if(typeof requestId!=='string'||!requestId)return failure('request_id_required');
 try{
  let out;
  if(action==='request'){
   if(!seller.players.some(p=>p.id===playerId))return failure('player_not_owned');
   if(!integer(feeITL))return failure('invalid_sale_fee');
   out=requestSaleInWindow(seller,draft.coach,
    {request:{id:requestId,playerId,minimumFee:feeITL},window,period});
  }else if(action==='review'){
   out=decideSaleInWindow(seller,c.president,{requestId,window,period,
    seed:state.seed+'|sale|'+requestId});
  }else if(action==='finalize'){
   const req=seller.market?.requests.find(r=>r.id===requestId);
   if(!req||req.status!=='approved')return failure('sale_not_approved');
   const player=seller.players.find(p=>p.id===req.playerId);
   const buyerIndex=draft.clubs.findIndex(x=>x.id===buyerClubId&&x.id!==seller.id);
   if(!player||buyerIndex<0)return failure('verified_buyer_required');
   const buyer=draft.clubs[buyerIndex];
   const fee=feeITL??req.minimumFee;
   if(!integer(fee)||fee<req.minimumFee)return failure('fee_below_minimum');
   if(buyer.players.some(p=>p.id===player.id))return failure('duplicate_buyer_player');
   if(weeklyPayroll(buyer)+player.contract.weeklyWage>buyer.wageBudget)
    return failure('buyer_wage_ceiling');
   const paid=book(buyer,{type:'expense',amount:fee,...period,note:'purchase:'+requestId});
   if(!paid.accepted)return failure(paid.reason);
   out=finalizeSaleInWindow(seller,{requestId,window,period,buyerAccepts:true,fee});
   if(!out.accepted)return failure(out.reason);
   paid.club.players.push({...player,teamId:paid.club.id});
   draft.clubs[buyerIndex]=paid.club;
  }else return failure('unknown_sale_action');
  if(!out.accepted){
   const req=out.club?.market?.requests?.find(r=>r.id===requestId);
   if(action==='review'&&req?.status==='rejected'){
    draft.clubs[c.index]=out.club;commit(state,draft);
    return {accepted:true,approved:false,reason:out.reason,request:req};
   }
   return failure(out.reason);
  }
  draft.clubs[c.index]=out.club;
  commit(state,draft);
  return {accepted:true,approved:true,requestId,
   status:state.clubs[c.index].market.requests.find(r=>r.id===requestId)?.status};
 }catch(e){return failure(e.message)}
}
