import {clamp,integer,rngFromSeed,copy} from './core.js';

export const TRAITS=['authoritarianism','frugality','vanity','patience','interference','ambition','riskTolerance'];
// SYNTHETIC TEST FALLBACKS, not the original characters/dialogue owned by agent 4.
const blueprints=[
 ['fixture-hierarch','Cerimonioso','hierarchical',[94,55,80,60,89,55,20]],
 ['fixture-dealer','Affarista','dealer',[65,25,85,40,63,78,89]],
 ['fixture-improviser','Improvvisatore','improviser',[48,20,76,9,67,92,97]],
 ['fixture-miser','Avaro','miser',[75,97,21,65,69,16,6]],
 ['fixture-grandiose','Megalomane','grandiose',[85,34,99,12,95,98,82]],
 ['fixture-veteran','Ex atleta','veteran',[45,38,44,78,47,67,50]],
 ['fixture-networker','Notabile','networker',[58,53,91,64,45,57,63]],
 ['fixture-patron','Benefattore','patron',[23,12,90,89,10,70,55]]
];
export const FALLBACK_PRESIDENTS=blueprints.map(([id,name,archetype,values])=>({
 id,name:'TEST · '+name,archetype,clubFlavor:'synthetic fixture',
 traits:Object.fromEntries(TRAITS.map((key,i)=>[key,values[i]]))
}));
export function validatePresident(profile) {
  if(!profile || typeof profile.id!=='string' || !profile.id || typeof profile.name!=='string' ||
     typeof profile.archetype!=='string' || typeof profile.clubFlavor!=='string') throw new Error('invalid PresidentProfileV1');
  for(const k of TRAITS) if(!Number.isFinite(profile.traits?.[k]) || profile.traits[k]<0 || profile.traits[k]>100)
    throw new RangeError('president trait '+k+' must be in 0..100');
  return true;
}
export function presidentRoster(data=FALLBACK_PRESIDENTS) {
  const profiles=Array.isArray(data) ? data : (data?.presidents ?? data?.profiles);
  if(!Array.isArray(profiles) || profiles.length===0) throw new Error('presidents array missing');
  profiles.forEach(validatePresident);
  if(new Set(profiles.map(p=>p.id)).size!==profiles.length) throw new Error('duplicate president id');
  return copy(profiles);
}
export async function loadPresidents(fetchJson, fallback=FALLBACK_PRESIDENTS) {
  try { return {source:'copy',profiles:presidentRoster(await fetchJson())}; }
  catch(error) { return {source:'synthetic_fallback',profiles:presidentRoster(fallback),reason:String(error.message ?? error)}; }
}
export function presidentBehavior(profile, state={}, seed=1) {
  validatePresident(profile);
  const rng=rngFromSeed(seed); const t=profile.traits;
  const trust=clamp(state.boardTrust ?? 60), losses=integer(state.lossStreak ?? 0,'lossStreak');
  const pressure=clamp((100-trust)*.55 + losses*12 +(100-t.patience)*.15);
  const fundingRatio=state.cash > 0 ? clamp((state.requestedFee ?? 0)/state.cash,0,5) : (state.requestedFee > 0 ? 5 : 0);
  const chances={
    marketApproval:clamp(.56+(t.ambition-t.frugality)*.003+trust*.0015+ (t.riskTolerance-50)*.001 - fundingRatio*.19,.03,.97),
    interference:clamp((t.interference*.58+t.authoritarianism*.18+pressure*.31)/100,0,.98),
    publicStatement:clamp((t.vanity*.55+pressure*.32)/100,0,.95),
    ultimatum:clamp((pressure*.6+(100-t.patience)*.28)/100,0,.95),
    promise:clamp((t.ambition*.35+t.vanity*.26+t.riskTolerance*.15)/100,0,.85),
    dismissal:clamp((pressure*.56+(100-t.patience)*.3-30)/100,0,.90)
  };
  const decisions=Object.fromEntries(Object.entries(chances).map(([k,v])=>[k,rng()<v]));
  // A promised resource is not cash; board must try funding it later.
  return {presidentId:profile.id,seed,pressure:Math.round(pressure),chances,decisions,request:'win_next_match',
    suggestedPromise:integer(Math.max(0,Math.round(state.requestedFee ?? 0)),'requestedFee')};
}


// Fail closed: the profile used for board decisions and narration must have
// the exact canonical ID persisted on this club (not just the same archetype).
export function presidentMatchesClub(club,profile) {
  validatePresident(profile);
  return Boolean(club?.presidentId && club.presidentId===profile.id);
}
export function resolveClubPresident(club,catalog) {
  const profiles=presidentRoster(catalog);
  const profile=profiles.find(p=>p.id===club?.presidentId);
  if(!profile) throw new Error('unknown canonical presidentId for club '+String(club?.id));
  return profile;
}
