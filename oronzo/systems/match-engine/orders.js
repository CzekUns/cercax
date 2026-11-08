// ORONZO 06 / PlayerV2 08 compatibility boundary.
// Match engine alone owns the 150-second temporary performance modifier.
// Never call attributes/applyShout() inside a match: that would add a second
// 180-second temporary bonus and mutate persistent player morale/trust.
import { clamp, stat } from './rng.js';

const clean = value => typeof value==='string'
  ? value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[’\x60]/g,"'").trim().toLocaleLowerCase('it-IT').replace(/\s+/g,' ')
  : '';
const macro = value => {
  const v=clean(value);
  return ({nord:'north',north:'north',centro:'centre',centre:'centre',center:'centre',
    sud:'south',south:'south'})[v] || v;
};
const safeNumber=(value,fallback=50)=>Number.isFinite(value)?clamp(value,0,100):fallback;
// Same 20-region macro classification as Attributes08/geography.js.
// This is a documented regional classification, never a fabricated birthplace.
const ITALIAN_MACROS=Object.freeze(Object.fromEntries([
  ...["Valle d'Aosta","Piemonte","Liguria","Lombardia","Trentino-Alto Adige",
    "Veneto","Friuli-Venezia Giulia","Emilia-Romagna"].map(x=>[clean(x),'north']),
  ...["Toscana","Umbria","Marche","Lazio"].map(x=>[clean(x),'centre']),
  ...["Abruzzo","Molise","Campania","Puglia","Basilicata","Calabria",
    "Sicilia","Sardegna"].map(x=>[clean(x),'south']),
]));

export const INDIVIDUAL_TONES=Object.freeze({
  encourage:'encourage',gentle:'encourage',harsh:'harsh',hard:'harsh'
});
export function normalizeIndividualTone(tone) {
  return typeof tone==='string'?INDIVIDUAL_TONES[tone.trim().toLowerCase()]??null:null;
}
export function toAttributesTone(tone) {
  const canonical=normalizeIndividualTone(tone);
  return canonical==='encourage'?'gentle':canonical==='harsh'?'hard':null;
}

// Prefer the real PlayerV2 origin: {comune,regione,macroregione}.
// Also accept the proposed CoachV2 {regionId,macroRegion} and legacy adapters.
// An unknown origin stays unknown; never invent a region or municipality.
export function normalizeMatchOrigin(value) {
  if(!value || typeof value!=='object' || Array.isArray(value))
    return {regionId:null,macroRegion:null};
  const regionId=clean(value.regione ?? value.regionId ?? value.region);
  const suppliedMacro=macro(value.macroregione ?? value.macroRegion ?? value.macroregion);
  // Real 08 normalizeOrigin() derives macro from region. Do likewise when a
  // valid Italian region is supplied without macro. Known mapping prevails
  // over contradictory payload macro, but unknown regions stay unknown.
  return {regionId:regionId||null,
    macroRegion:ITALIAN_MACROS[regionId] ?? suppliedMacro || null};
}
export function normalizePlayerMatchContext(player) {
  const rawTrust=player?.relationships?.coachTrust ?? player?.relationshipWithCoach;
  return {
    origin:player?.origin ? normalizeMatchOrigin(player.origin) : null,
    coachTrust:rawTrust==null?null:safeNumber(rawTrust),
  };
}
export function regionalAffinity(coachOrigin,playerOrigin) {
  const coach=normalizeMatchOrigin(coachOrigin), player=normalizeMatchOrigin(playerOrigin);
  if(coach.regionId && player.regionId && coach.regionId===player.regionId)
    return {kind:'region',score:2};
  if(coach.macroRegion && player.macroRegion && coach.macroRegion===player.macroRegion)
    return {kind:'macro',score:1};
  return {kind:coach.macroRegion&&player.macroRegion?'other':'unknown',score:0};
}

export function individualPerformanceFactor(player,t) {
  const current=player?.personalShout;
  return current && Number.isFinite(t) && t>=current.startedAt &&
    t<current.expiresAt ? 1+current.modifier : 1;
}

// Pure adapter for career07: the player is already in ClubV1.players on createMatch.
// CoachV2 has traits.leadership and origin; player PlayerV2 has origin/relationships.
// No trust or regional data are fabricated by this helper.
export function createIndividualShoutCommand({teamId,player,coach,tone,utteranceId}={}) {
  if(typeof teamId!=='string'||!teamId || !player || typeof player.id!=='string' ||
     !player.id || (player.teamId && player.teamId!==teamId))
    throw new TypeError('valid teamId and same-team player required');
  const canonical=normalizeIndividualTone(tone);
  if(!canonical)throw new RangeError('individual tone must be encourage/harsh or gentle/hard');
  const payload={targetPlayerId:player.id,tone:canonical};
  if(coach?.origin)payload.coachOrigin=coach.origin;
  if(coach?.traits && Number.isFinite(coach.traits.leadership))
    payload.coachTraits={leadership:coach.traits.leadership};
  if(player.origin)payload.playerOrigin=player.origin; // legacy backup only
  if(utteranceId!==undefined)payload.utteranceId=utteranceId;
  return {type:'shout',teamId,payload};
}

// Inputs are copied PlayerV2 objects in the engine's private roster.
// RNG comes only from match-engine seeded state; one roll per accepted order.
export function calculateIndividualShout(player,payload,rng,t) {
  const tone=normalizeIndividualTone(payload.tone);
  if(!tone)throw new RangeError('invalid individual shout tone');
  // The roster's authoritative origin takes priority over a conflicting payload.
  // An explicit payload origin is only a fallback for historical PlayerV1.
  const origin=player?.matchContext?.origin ?? player?.origin ?? payload.playerOrigin ?? null;
  const affinity=regionalAffinity(payload.coachOrigin,origin);
  const trust=safeNumber(player?.matchContext?.coachTrust ??
    player?.relationships?.coachTrust ?? player?.relationshipWithCoach ?? payload.playerTrust);
  const leadership=safeNumber(payload.coachTraits?.leadership ??
    payload.coachLeadership);
  const character=stat(player,'mental','character');
  const composure=stat(player,'mental','composure');
  const discipline=stat(player,'mental','discipline');
  const susceptibility=stat(player,'mental','suscettibilita');
  const impulsivity=stat(player,'mental','impulsivita');
  const affinityBoost=affinity.score===2?.020:affinity.score===1?.010:0;
  const jitter=(rng.next()-.5)*.010;
  const receptive=clamp((trust*.36+leadership*.24+character*.20+composure*.20)/100,0,1);
  const modifier=tone==='encourage'
    ?clamp(.014+.065*receptive+affinityBoost+jitter
        -(susceptibility-50)*.00008,.008,.115)
    :clamp((character*.40+composure*.35+discipline*.25-55)*.0015+
       (trust-50)*.00025+affinityBoost*.30+jitter-.020
       -(susceptibility-50)*.00028-(impulsivity-50)*.00015,-.115,.055);
  const trustDelta=tone==='encourage'?(affinity.score===2?2:1):(modifier>=0?-1:-2);
  return {
    tone,attributesTone:toAttributesTone(tone),
    modifier:Number(modifier.toFixed(6)),startedAt:t,expiresAt:t+150,
    affinity:affinity.kind,coachTrustAtCommand:trust,
    persistentSuggestion:{playerTrustDelta:trustDelta,coachMoraleDelta:0},
  };
}
