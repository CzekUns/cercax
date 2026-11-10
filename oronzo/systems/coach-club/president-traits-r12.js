/** R12 president-to-coach modifiers; base traits remain immutable.
 * Fictional balancing coefficients, not 1979 historical claims. */
const KEYS=['luck','leadership','selfEsteem','patience'];
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const bounded=x=>clamp(Math.round(x),-8,8);
export function presidentTraitModifiersR12(profile){
  const t=profile?.traits;
  if(!profile?.id||!t||['riskTolerance','frugality','ambition','interference','vanity','authoritarianism','patience'].some(k=>!Number.isFinite(t[k])))
    throw new Error('R12_PRESIDENT_PROFILE_REQUIRED');
  return {
    luck:bounded((t.riskTolerance-50)/12-(t.frugality-50)/30),
    leadership:bounded((t.ambition-50)/12-(t.interference-50)/18),
    selfEsteem:bounded((t.vanity-50)/11-(t.authoritarianism-50)/20),
    patience:bounded((t.patience-50)/10-(t.interference-50)/20)
  };
}
/** Idempotent: replace previous appointment rather than adding to existing stats. */
export function syncPresidentTraitsR12(coach,club,presidentCatalog){
  if(!coach || !coach.traits)throw new Error('R12_COACH_REQUIRED');
  if(!club){
    coach.presidentTraitEffect=null;return null;
  }
  const profiles=Array.isArray(presidentCatalog)?presidentCatalog:
    (presidentCatalog?.presidents??presidentCatalog?.profiles);
  const profile=profiles?.find(p=>p.id===club.presidentId);
  if(!profile)throw new Error('R12_MISSING_CANONICAL_PRESIDENT:'+club.presidentId);
  const effect={source:'r12-president-contract',clubId:club.id,presidentId:profile.id,
    modifiers:presidentTraitModifiersR12(profile)};
  coach.presidentTraitEffect=effect;
  return effect;
}
export function effectiveCoachTraitsR12(coach,club=null){
  const base={...coach?.traits},effect=coach?.presidentTraitEffect;
  const valid=!!effect&&!!club&&effect.clubId===club.id&&effect.presidentId===club.presidentId;
  const modifiers={};
  const effective={};
  for(const k of KEYS){
    modifiers[k]=valid ? clamp(effect.modifiers?.[k]??0,-8,8) : 0;
    effective[k]=clamp(Math.round((base[k]??50)+modifiers[k]));
  }
  return {base,modifiers,effective,presidentId:valid?effect.presidentId:null,clubId:valid?effect.clubId:null};
}
