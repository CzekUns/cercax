/** ORONZO R03 · Agent 09 owns persistent coach morale and relationship deltas.
 * Every number here is a configurable INITIAL BALANCING PROPOSAL, not approved economics.
 * Inputs and outputs are JSON-serializable; no RNG, finance or match mutations.
 */
import {createCoach} from './coach-model.js';
import {clamp,copy} from './core.js';

export const OFFER_MORALE_BALANCE=Object.freeze({
  sameRegionCost:0,otherRegionCost:1,otherMacroRegionCost:3,
  expectedWageBaseITL:14000,expectedWagePerPrestigeITL:250,
  wealthyLocalRatio:1.75,wealthyLocalBonus:2,
  leadershipPressThreshold:80,patiencePressThreshold:80,luckPressThreshold:90
});
const hasOwn=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const ownString=(x,label)=>{
  if(typeof x!=='string'||!x.trim())throw new TypeError(label+' required');
  return x;
};
function balance(overrides={}) {
  if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('balance must be an object');
  const b={...OFFER_MORALE_BALANCE,...overrides};
  for(const [key,value] of Object.entries(b))
    if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw new RangeError('invalid balance '+key);
  if(b.wealthyLocalRatio<1)throw new RangeError('wealthyLocalRatio must be >=1');
  return b;
}
function location(obj,label) {
  if(!obj||typeof obj!=='object')throw new TypeError(label+' required');
  const geo=obj.origin&&typeof obj.origin==='object'?obj.origin:obj;
  const regionId=ownString(geo.regionId,label+'_region_required');
  const macroRegion=ownString(geo.macroRegion,label+'_macroregion_required');
  return {regionId,macroRegion};
}
function checkOffer(coach,offer,club){
  ownString(offer?.id,'offer_id');
  ownString(offer?.clubId,'offer_clubId');
  ownString(club?.id,'club_id');
  if(offer.clubId!==club.id)throw new Error('offer_club_mismatch');
  if(!Number.isSafeInteger(offer.coachWageITL)||offer.coachWageITL<0)
    throw new RangeError('coach_wage_required: coachWageITL must be non-negative ITL');
  if(!Number.isInteger(offer.advertisedPrestige)||offer.advertisedPrestige<0||offer.advertisedPrestige>100)
    throw new RangeError('advertisedPrestige must be integer 0..100');
  const from=location(coach,'coach_origin');
  const to=location(club,'club');
  if(from.regionId===to.regionId&&from.macroRegion!==to.macroRegion)
    throw new Error('geography_macroregion_conflict');
  return {from,to};
}

/** Pure, deterministic, does not mutate coach, offer or club. */
export function previewOfferMorale(coach,offer,club,settings={}) {
  const b=balance(settings);
  const {from,to}=checkOffer(coach,offer,club);
  const sameRegion=from.regionId===to.regionId;
  const sameMacro=from.macroRegion===to.macroRegion;
  const baseDistanceCost=sameRegion?b.sameRegionCost:sameMacro?b.otherRegionCost:b.otherMacroRegionCost;
  const selfEsteem=createCoach(coach).traits.selfEsteem;
  const expectedWage=b.expectedWageBaseITL+b.expectedWagePerPrestigeITL*offer.advertisedPrestige;
  if(!Number.isSafeInteger(expectedWage)||expectedWage<=0)throw new RangeError('invalid_expected_wage');
  const wageShortfall=Math.max(0,(expectedWage-offer.coachWageITL)/expectedWage);
  const esteemPressure=Math.max(0,(selfEsteem-50)/50);
  const selfEsteemMultiplier=Math.round((1+esteemPressure*wageShortfall)*1000)/1000;
  const wealthyLocal=sameRegion&&offer.coachWageITL>=expectedWage*b.wealthyLocalRatio;
  const finalMoraleDelta=(wealthyLocal?b.wealthyLocalBonus:0)-Math.round(baseDistanceCost*selfEsteemMultiplier);
  const reasons=[sameRegion?'same_region':sameMacro?'other_region_same_macro':'other_macroregion'];
  if(selfEsteemMultiplier>1)reasons.push('self_esteem_low_pay');
  if(wealthyLocal)reasons.push('wealthy_local_offer');
  return {baseDistanceCost,selfEsteemMultiplier,finalMoraleDelta,reasons};
}

function signed(value,label,min=-100,max=100) {
  if(!Number.isSafeInteger(value)||value<min||value>max)throw new RangeError(label+' must be integer '+min+'..'+max);
  return value;
}
/** Immutable, idempotent. Persist returned coach along with the career transaction in one save. */
export function applyCoachMoraleEvent(coach,{eventId,reason='decision',moraleDelta=0,relationships={},sourceId=null,date=null}={}){
  ownString(eventId,'eventId');
  ownString(reason,'reason');
  if(sourceId!==null)ownString(sourceId,'sourceId');
  if(date!==null && (typeof date!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)))
    throw new TypeError('date must be YYYY-MM-DD or null');
  signed(moraleDelta,'moraleDelta');
  if(!relationships||typeof relationships!=='object'||Array.isArray(relationships))throw new TypeError('relationships must be an object');
  const allowed=new Set(['board','squad','fans','media']);
  for(const [key,value] of Object.entries(relationships)){
    if(!allowed.has(key))throw new Error('unsupported_relationship: '+key);
    signed(value,'relationships.'+key);
  }
  const current=createCoach(coach);
  if(current.moraleEvents.some(e=>e.eventId===eventId))
    return {accepted:false,reason:'already_applied',coach:current};
  if(sourceId&&current.moraleEvents.some(e=>e.sourceId===sourceId))
    return {accepted:false,reason:'source_already_applied',coach:current};
  if(current.gameOver)return {accepted:false,reason:'game_over',coach:current};
  const next=copy(current),before=next.morale;
  next.morale=Math.round(clamp(before+moraleDelta));
  const appliedRelations={};
  for(const [key,delta] of Object.entries(relationships)){
    const was=next.relationships[key];
    next.relationships[key]=Math.round(clamp(was+delta));
    appliedRelations[key]=next.relationships[key]-was;
  }
  const event={eventId,sourceId,kind:reason,date,moraleBefore:before,
    requestedMoraleDelta:moraleDelta,appliedMoraleDelta:next.morale-before,
    relationships:appliedRelations};
  next.moraleEvents.push(event);
  if(next.morale===0)next.gameOver={eventId,reason:'morale_zero',date};
  return {accepted:true,reason:'applied',coach:next,event,gameOver:next.gameOver};
}

/** Adapter for Agent 07 flow.recordEffect: kind='initial_offer', stable eventId. */
export function applyOfferEffect({eventId,coach,offer,club,semanticEffects={},balance:settings={}}={}){
  ownString(eventId,'eventId');
  const preview=previewOfferMorale(coach,offer,club,settings);
  if(semanticEffects?.preview && JSON.stringify(semanticEffects.preview)!==JSON.stringify(preview))
    throw new Error('offer_preview_mismatch');
  return applyCoachMoraleEvent(coach,{eventId,sourceId:'offer:'+offer.id,reason:'accepted_offer',moraleDelta:preview.finalMoraleDelta});
}

/** Adapter for Agent 07, consumes Copy04 semanticEffects (not dialogue text). */
export function applyPressEffect({eventId,coach,semanticEffects,kind='press',date=null,balance:settings={}}={}){
  ownString(eventId,'eventId');
  if(kind!=='press')throw new Error('invalid_press_kind');
  if(!semanticEffects||typeof semanticEffects!=='object'||Array.isArray(semanticEffects))
    throw new TypeError('semanticEffects required');
  const allowed=new Set(['coachMorale','supportersTrust','mediaReputation','presidentTrust']);
  for(const [key,value] of Object.entries(semanticEffects)){
    if(!allowed.has(key))throw new Error('unsupported_press_effect: '+key);
    signed(value,'semanticEffects.'+key,-3,3);
  }
  const b=balance(settings),c=createCoach(coach);
  let moraleDelta=semanticEffects.coachMorale??0;
  let mediaDelta=semanticEffects.mediaReputation??0;
  if(moraleDelta<0&&c.traits.patience>=b.patiencePressThreshold)moraleDelta++;
  if(mediaDelta<0&&c.traits.luck>=b.luckPressThreshold)mediaDelta++;
  const relationships={board:semanticEffects.presidentTrust??0,
    fans:semanticEffects.supportersTrust??0,media:mediaDelta};
  if((semanticEffects.supportersTrust??0)>0&&c.traits.leadership>=b.leadershipPressThreshold)
    relationships.squad=1;
  return applyCoachMoraleEvent(c,{eventId,sourceId:'press:'+eventId,reason:'press',moraleDelta,relationships,date});
}
