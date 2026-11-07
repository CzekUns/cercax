export const REGION_MACRO = Object.freeze({
  'Valle d’Aosta':'Nord',Piemonte:'Nord',Liguria:'Nord',Lombardia:'Nord',
  'Trentino-Alto Adige':'Nord',Veneto:'Nord','Friuli-Venezia Giulia':'Nord',
  'Emilia-Romagna':'Nord',Toscana:'Centro',Umbria:'Centro',Marche:'Centro',
  Lazio:'Centro',Abruzzo:'Sud',Molise:'Sud',Campania:'Sud',
  Puglia:'Sud',Basilicata:'Sud',Calabria:'Sud',Sicilia:'Sud',Sardegna:'Sud'
});
export const REGION_ALIASES=Object.freeze({"Valle d'Aosta":'Valle d’Aosta',
 'Trentino Alto Adige':'Trentino-Alto Adige','Friuli Venezia Giulia':'Friuli-Venezia Giulia','Emilia Romagna':'Emilia-Romagna'});
// Real regional capitals used ONLY as demo fixture; Agent 7 provides verified small municipalities.
export const DEMO_ORIGINS=Object.freeze([
{comune:'Torino',regione:'Piemonte'},{comune:'Milano',regione:'Lombardia'},
{comune:'Genova',regione:'Liguria'},{comune:'Bologna',regione:'Emilia-Romagna'},
{comune:'Venezia',regione:'Veneto'},{comune:'Firenze',regione:'Toscana'},
{comune:'Perugia',regione:'Umbria'},{comune:'Ancona',regione:'Marche'},
{comune:'Roma',regione:'Lazio'},{comune:'Napoli',regione:'Campania'},
{comune:'Campobasso',regione:'Molise'},{comune:'L’Aquila',regione:'Abruzzo'},
{comune:'Bari',regione:'Puglia'},{comune:'Potenza',regione:'Basilicata'},
{comune:'Catanzaro',regione:'Calabria'},{comune:'Palermo',regione:'Sicilia'},
{comune:'Cagliari',regione:'Sardegna'}]);
// Null origin means unknown: never assign a random region to old saves.
export function normalizeOrigin(origin){
 if(origin==null) return null;
 if(!origin||typeof origin!=='object'||Array.isArray(origin))throw new TypeError('origin must be object or null');
 const comune=String(origin.comune??origin.city??'').trim();
 const raw=String(origin.regione??origin.region??'').trim();
 const regione=REGION_ALIASES[raw]||raw;
 if(!comune||!Object.hasOwn(REGION_MACRO,regione))throw new RangeError('Invalid comune or Italian region');
 const macroregione=REGION_MACRO[regione];
 const provided=origin.macroregione??origin.macroregion;
 if(provided!=null&&provided!==macroregione)throw new RangeError('Region/macroregion mismatch');
 // Commune-region correctness is responsibility of Agent 7's sourced towns dataset.
 return {comune,regione,macroregione};
}
export function regionAffinity(playerOrigin,coachOrigin){
 if(!playerOrigin||!coachOrigin)return {level:'unknown',strength:0};
 const a=normalizeOrigin(playerOrigin),b=normalizeOrigin(coachOrigin);
 if(a.regione===b.regione)return {level:'same-region',strength:1};
 if(a.macroregione===b.macroregione)return {level:'same-macroregion',strength:.45};
 return {level:'different-macroregion',strength:0};
}

