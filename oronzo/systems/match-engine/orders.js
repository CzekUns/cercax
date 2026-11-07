// ORONZO v0.2: per-player touchline instructions. This module never mutates
// career morale, persistent trust or the player record supplied by Agent 08.
import { clamp, stat } from './rng.js';

const originOf = o => o && typeof o === 'object' ? o : {};
const normalized = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
const safeNumber = (value,fallback=50) => Number.isFinite(value) ? clamp(value,0,100) : fallback;

export function regionalAffinity(coachOrigin,playerOrigin) {
  const coach=originOf(coachOrigin), player=originOf(playerOrigin);
  const a=normalized(coach.regionId),b=normalized(player.regionId);
  if(a && b && a===b)return {kind:'region',score:2};
  const x=normalized(coach.macroRegion),y=normalized(player.macroRegion);
  if(x && y && x===y)return {kind:'macro',score:1};
  return {kind:x&&y?'other':'unknown',score:0};
}

export function individualPerformanceFactor(player,t) {
  const current=player?.personalShout;
  return current && Number.isFinite(t) && t>=current.startedAt &&
    t<current.expiresAt ? 1+current.modifier : 1;
}

// Receives only PlayerV2/CoachV2 fields supplied from upstream. Jitter is
// seeded via the parent match PRNG and always bounded, never a guaranteed goal.
export function calculateIndividualShout(player,payload,rng,t) {
  const affinity=regionalAffinity(payload.coachOrigin,player.origin ?? payload.playerOrigin);
  const trust=safeNumber(player.relationshipWithCoach ?? payload.playerTrust);
  const leadership=safeNumber(payload.coachTraits?.leadership);
  const character=stat(player,'mental','character');
  const composure=stat(player,'mental','composure');
  const discipline=stat(player,'mental','discipline');
  const affinityBoost=affinity.score===2?.020:affinity.score===1?.010:0;
  const jitter=(rng.next()-.5)*.010;
  const receptive=clamp((trust*.36+leadership*.24+character*.20+composure*.20)/100,0,1);
  const tone=payload.tone;
  const modifier=tone==='encourage'
    ?clamp(.014+.065*receptive+affinityBoost+jitter,.008,.115)
    :clamp((character*.40+composure*.35+discipline*.25-55)*.0015+
       (trust-50)*.00025+affinityBoost*.30+jitter-.020,-.115,.055);
  const trustDelta=tone==='encourage'
    ?(affinity.score===2?2:1)
    :(modifier>=0?-1:-2);
  return {
    tone,modifier:Number(modifier.toFixed(6)),startedAt:t,expiresAt:t+150,
    affinity:affinity.kind,
    persistentSuggestion:{playerTrustDelta:trustDelta,coachMoraleDelta:0},
  };
}
