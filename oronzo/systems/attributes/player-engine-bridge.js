// Agent 08 -> Agent 06 PR #35 compatibility boundary. No temporary effects created here.
import {normalizePlayer} from './player-model.js';
import {normalizeOrigin,REGION_MACRO,REGION_ALIASES} from './geography.js';
import {clamp} from './rng.js';
export const REGION_TO_ENGINE = Object.freeze({
'Valle d’Aosta':'valle-d-aosta',Piemonte:'piemonte',Liguria:'liguria',Lombardia:'lombardia',
'Trentino-Alto Adige':'trentino-alto-adige',Veneto:'veneto','Friuli-Venezia Giulia':'friuli-venezia-giulia',
'Emilia-Romagna':'emilia-romagna',Toscana:'toscana',Umbria:'umbria',Marche:'marche',Lazio:'lazio',
Abruzzo:'abruzzo',Molise:'molise',Campania:'campania',Puglia:'puglia',Basilicata:'basilicata',
Calabria:'calabria',Sicilia:'sicilia',Sardegna:'sardegna'});
const ENGINE_TO_REGION=Object.freeze(Object.fromEntries(Object.entries(REGION_TO_ENGINE).map(([k,v])=>[v,k])));
const MACRO_TO_ENGINE=Object.freeze({Nord:'north',Centro:'centre',Sud:'south'});
const ENGINE_TO_MACRO=Object.freeze({north:'Nord',centre:'Centro',center:'Centro',south:'Sud'});
export function normalizeShoutTone(tone){
 if(tone==='gentle'||tone==='encourage')return 'encourage';
 if(tone==='hard'||tone==='harsh')return 'harsh';
 throw new RangeError('Individual tone must be gentle|hard or encourage|harsh');
}
export function toMatchEngineOrigin(origin,{allowRegionalOnly=false}={}){
 if(origin==null)return null;
 let canonical;
 if(typeof origin==='object' && (origin.regionId||origin.municipalityName)){
  const regione=ENGINE_TO_REGION[String(origin.regionId??'').trim().toLowerCase()]||
    REGION_ALIASES[origin.regione]||origin.regione;
  const comune=origin.comune??origin.municipalityName;
  if(!regione)return null;
  if(!comune){
   if(!allowRegionalOnly)return null; // Player without verified birthplace remains unknown.
   const valid=REGION_TO_ENGINE[regione], expected=MACRO_TO_ENGINE[REGION_MACRO[regione]];
   if(!valid||!expected||origin.macroRegion!=null&&origin.macroRegion!==expected)throw new RangeError('Invalid regional identity');
   return {regionId:valid,macroRegion:expected}; // Coach origin only: no invented municipality.
  }
  canonical=normalizeOrigin({comune,regione,macroregione:origin.macroregione??ENGINE_TO_MACRO[origin.macroRegion]});
 }else canonical=normalizeOrigin(origin);
 if(!canonical)return null;
 const regionId=REGION_TO_ENGINE[canonical.regione];
 if(!regionId||REGION_MACRO[canonical.regione]!==canonical.macroregione)throw new RangeError('Invalid regional identity');
 return {...canonical,regionId,macroRegion:MACRO_TO_ENGINE[canonical.macroregione]};
}
export function toMatchEnginePlayer(source){
 const p=normalizePlayer(source);
 return {...p,origin:toMatchEngineOrigin(p.origin),relationshipWithCoach:p.relationships.coachTrust,
  temporaryEffects:(p.temporaryEffects||[]).filter(e=>e.kind!=='coach-shout')};
}
export function toIndividualShoutCommand({teamId,player,coachOrigin=null,coachLeadership=50,tone='gentle',utteranceId,t}={}){
 if(typeof teamId!=='string'||!teamId.trim())throw new TypeError('teamId required');
 const p=normalizePlayer(player);
 if(p.teamId!==teamId)throw new Error('Target player belongs to another team');
 const payload={targetPlayerId:p.id,tone:normalizeShoutTone(tone),
  coachOrigin:toMatchEngineOrigin(coachOrigin,{allowRegionalOnly:true}),playerOrigin:toMatchEngineOrigin(p.origin),
  playerTrust:p.relationships.coachTrust,coachTraits:{leadership:clamp(coachLeadership)}};
 if(utteranceId!=null)payload.utteranceId=String(utteranceId);
 return {type:'shout',teamId,...(t==null?{}:{t}),payload};
}
// 09 owns persistence; process 06 coach_shout through collectCoachEffects(matchId,eventIds).
export function playerTrustForCoach(player){return normalizePlayer(player).relationships.coachTrust;}
