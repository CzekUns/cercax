/** R12 geographic bridge from reviewed modern ISTAT municipality records.
 * Fictional players may be assigned a contemporary municipality as a gameplay origin:
 * neither residence nor birthplace in 1979 is an independently attested fact. */
export const WORLD_REGIONS_R12=Object.freeze({
 'valle-daosta':['Valle d’Aosta','Nord'],'piemonte':['Piemonte','Nord'],
 'liguria':['Liguria','Nord'],'lombardia':['Lombardia','Nord'],
 'trentino-alto-adige':['Trentino-Alto Adige','Nord'],'veneto':['Veneto','Nord'],
 'friuli-venezia-giulia':['Friuli-Venezia Giulia','Nord'],
 'emilia-romagna':['Emilia-Romagna','Nord'],'toscana':['Toscana','Centro'],
 'umbria':['Umbria','Centro'],'marche':['Marche','Centro'],'lazio':['Lazio','Centro'],
 'abruzzo':['Abruzzo','Sud'],'molise':['Molise','Sud'],'campania':['Campania','Sud'],
 'puglia':['Puglia','Sud'],'basilicata':['Basilicata','Sud'],
 'calabria':['Calabria','Sud'],'sicilia':['Sicilia','Sud'],'sardegna':['Sardegna','Sud']
});
export function derivePlayerOriginsFromWorldR12(world){
 const records=world?.data?.records;
 if(!Array.isArray(records))return [];
 const origins=[];
 for(const r of records){
   const region=WORLD_REGIONS_R12[r.regionId];
   if(!region||!r.municipalityName||!r.municipalityId)continue;
   const expected={Nord:'north',Centro:'centre',Sud:'south'}[region[1]];
   if(r.macroRegion!==expected)throw new Error('R12_GEO_MACRO_MISMATCH:'+r.municipalityId);
   origins.push({comune:r.municipalityName,regione:region[0],macroregione:region[1]});
 }
 return origins;
}
