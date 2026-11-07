/** Persistent initial job offer ledger. Never mutate coach morale in Career 07. */
import { shuffle, seededRandom } from './league.js';
const clone = x => JSON.parse(JSON.stringify(x));
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
export const INITIAL_OFFER_COUNT=20;

export function createInitialOffers(state) {
  if(state.flow?.initialOffers?.length) return state.flow.initialOffers;
  if(state.clubs.length<INITIAL_OFFER_COUNT)throw new Error('Need 20 distinct available clubs');
  const regional=state.clubs.filter(c=>['PROM','INTER'].includes(c.divisionId));
  const pool=regional.length>=INITIAL_OFFER_COUNT?regional:state.clubs;
  const choices=shuffle(pool.map(c=>c.id),'initial-offers:'+state.seed+':'+state.seasonYear)
    .slice(0,INITIAL_OFFER_COUNT);
  const byId=new Map(state.clubs.map(c=>[c.id,c]));
  const offers=choices.map((clubId,i)=>{
    const c=byId.get(clubId),rng=seededRandom('initial-wage:'+state.seed+':'+clubId);
    const payroll=c.players.reduce((sum,p)=>sum+p.contract.weeklyWage,0);
    // Nominal ITL fictional negotiation values, not historically sourced wages.
    const coachWageITL=Math.max(1000,Math.round((payroll*.045 + 7000*rng())/1000)*1000);
    return {
      id:'initial:'+state.seasonYear+':'+clubId,
      clubId,divisionId:c.divisionId,clubName:c.name,
      municipalityId:c.municipalityId ?? null,regionId:c.regionId ?? null,
      macroRegion:c.macroRegion ?? null,presidentId:c.presidentId,
      advertisedPrestige:c.reputation,coachWageITL,generatedSeed:state.seed,
      expiresAtGameDate:null,contractUntil:state.seasonYear+2,
      status:'open',conditions:{termSeasons:2,objective:c.seasonObjective},
      order:i
    };
  });
  if(new Set(offers.map(o=>o.clubId)).size!==INITIAL_OFFER_COUNT)
    throw new Error('Duplicate opening job offers');
  state.flow.initialOffers=offers;
  state.offeredJobIds=offers.map(o=>o.id);
  return offers;
}
export function listInitialOffers(state) {
  if(!state?.flow?.initialOffers)throw new Error('No initial offers for legacy careers');
  return clone(state.flow.initialOffers);
}
export function selectInitialOffer(state,offerId) {
  if(!state?.flow)throw new Error('Not a flow-managed career');
  if(state.flow.acceptedOfferId) {
    if(state.flow.acceptedOfferId===offerId)
      return {accepted:false,reason:'already_accepted',offer:clone(state.flow.initialOffers.find(o=>o.id===offerId))};
    return {accepted:false,reason:'opening_contract_already_signed'};
  }
  if(state.flow.stage!=='offers')throw new Error('Opening offers stage is not active');
  const selected=state.flow.initialOffers.find(o=>o.id===offerId);
  if(!selected || selected.status!=='open')return {accepted:false,reason:'unknown_or_closed_offer'};
  if(state.coach.clubId || state.coach.contract)
    throw new Error('Coach must be initially unemployed');
  const club=state.clubs.find(c=>c.id===selected.clubId);
  if(!club||club.presidentId!==selected.presidentId)throw new Error('Offer has invalid president or club');
  state.coach.clubId=club.id;
  state.coach.contract={until:selected.contractUntil,weeklyWage:selected.coachWageITL};
  state.coach.hiredSeason=state.seasonYear;
  state.flow.acceptedOfferId=offerId;
  state.flow.acceptedOffer=clone(selected);
  for(const offer of state.flow.initialOffers)
    offer.status=offer.id===offerId?'accepted':'declined';
  state.flow.stage='opening_press';
  state.log.push({type:'opening_appointment',clubId:club.id,offerId,
    seasonYear:state.seasonYear,week:state.week,absoluteWeek:state.absoluteWeek});
  return {accepted:true,offer:clone(selected),clubId:club.id,
    moraleStatus:'requires_agent09_preview_and_application'};
}
