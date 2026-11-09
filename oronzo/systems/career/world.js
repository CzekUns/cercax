/** Verified-data import boundary for ORONZO. The research dataset is owned elsewhere. */
import { shuffle } from './league.js';

const REGION_MACRO = Object.freeze({
  'valle-daosta':'north', 'piemonte':'north','liguria':'north','lombardia':'north',
  'trentino-alto-adige':'north','veneto':'north','friuli-venezia-giulia':'north',
  'emilia-romagna':'north', 'toscana':'centre','umbria':'centre','marche':'centre',
  'lazio':'centre', 'abruzzo':'south','molise':'south','campania':'south',
  'puglia':'south','basilicata':'south','calabria':'south','sicilia':'south','sardegna':'south'
});
const alias = Object.freeze({'valle-d-aosta':'valle-daosta','trentino-sudtirol':'trentino-alto-adige'});
const clone = v => JSON.parse(JSON.stringify(v));
export const WORLD_M1_MINIMUM = 100;
export const WORLD_SOURCE_STATUS = 'external_review_required';
const nonempty = x => typeof x === 'string' && x.trim().length > 0;

export function validatedMunicipalities(catalog,{minimum=WORLD_M1_MINIMUM}={}) {
  if(!catalog || !Array.isArray(catalog.municipalities) || !Array.isArray(catalog.sources))
    throw new Error('WORLD_DATA_INVALID: municipalities[] and sources[] required');
  if(!nonempty(catalog.datasetId) || !nonempty(catalog.version) ||
     catalog.reviewStatus !== 'approved')
    throw new Error('WORLD_DATA_UNREVIEWED: explicit version and approved research review required');
  const sources = new Map();
  for(const src of catalog.sources) {
    if(!nonempty(src.id)||!nonempty(src.url)||!nonempty(src.publisher)||!nonempty(src.license))
      throw new Error('WORLD_SOURCE_INCOMPLETE');
    if(sources.has(src.id))throw new Error('WORLD_SOURCE_DUPLICATE');
    sources.set(src.id,clone(src));
  }
  // Research V2 permits explicitly unknown province/population-year metadata.
  // This does not establish municipality boundaries or demographics in 1979.
  const modernUnknowns = catalog.schemaVersion === 2 &&
    catalog.historicalScope === 'contemporary-geography-not-1979';
  const seen = new Set(), records=[];
  for(const entry of catalog.municipalities) {
    const id=String(entry.municipalityId ?? '');
    const region=alias[entry.regionId]??entry.regionId;
    const validProvince = /^[A-Z]{2}$/.test(entry.provinceCode??'') ||
      (modernUnknowns && entry.provinceCode === null);
    const validPopulationYear =
      (Number.isSafeInteger(entry.populationReferenceYear) &&
       entry.populationReferenceYear>=1861 && entry.populationReferenceYear<=2100) ||
      (modernUnknowns && entry.populationReferenceYear===null &&
       entry.historical1979===false && Number.isSafeInteger(entry.sourceSnapshotYear));
    if(!/^[0-9]{6}$/.test(id) || !nonempty(entry.municipalityName) ||
       !validProvince || !Object.hasOwn(REGION_MACRO,region) ||
       entry.macroRegion!==REGION_MACRO[region] || !sources.has(entry.sourceId) ||
       !validPopulationYear || !Number.isSafeInteger(entry.population) || entry.population<0)
      throw new Error('WORLD_RECORD_INVALID: '+id);
    if(seen.has(id))throw new Error('WORLD_DUPLICATE_ID: '+id);
    seen.add(id);
    records.push({
      municipalityId:id,municipalityName:entry.municipalityName.trim(),
      provinceCode:entry.provinceCode,regionId:region,macroRegion:entry.macroRegion,
      population:entry.population,populationReferenceYear:entry.populationReferenceYear,
      sourceId:entry.sourceId,
      ...(modernUnknowns ? {sourceSnapshotYear:entry.sourceSnapshotYear,historical1979:false} : {})
    });
  }
  if(records.length<minimum)throw new Error('WORLD_M1_GATE: need '+minimum+' reviewed records');
  // Sorting by durable ISTAT ID avoids incoming file order silently changing club origins.
  records.sort((a,b)=>a.municipalityId.localeCompare(b.municipalityId));
  return {
    datasetId:catalog.datasetId,version:catalog.version,reviewStatus:'approved',
    records, sources:[...sources.values()].sort((a,b)=>a.id.localeCompare(b.id)),
    historicalScope:modernUnknowns ? catalog.historicalScope : 'source_reference_year_not_verified_1979'
  };
}

/** Preserves club ID and player/kit data; only new worlds receive assignments. */
export function assignWorldToClubs(clubs,seed,catalog=null) {
  if(!Array.isArray(clubs)||!clubs.length)throw new Error('clubs required');
  if(!catalog) return {
    world:{mode:'demo',datasetStatus:'awaiting_research_review',
      disclaimer:'Fictional club/place labels; NOT a verified Italian municipality catalog',
      assignedMunicipalityIds:[], data:null},
    clubs
  };
  const data=validatedMunicipalities(catalog);
  const selected=shuffle(data.records,'world-1979:'+seed);
  const result=clubs.map((club,i)=>{
    const place=selected[i%selected.length];
    return {...club,
      // 1979 fictional football world; do not claim that a historically existing
      // football club played in the corresponding real municipality.
      name:'Sportiva '+place.municipalityName+' '+String(i+1),
      municipalityId:place.municipalityId,regionId:place.regionId,
      macroRegion:place.macroRegion,
      ...(place.provinceCode ? {provinceCode:place.provinceCode} : {}),
      geographicSourceId:place.sourceId,
      ...(Number.isSafeInteger(place.populationReferenceYear) ?
        {geographicReferenceYear:place.populationReferenceYear} : {})
    };
  });
  return {
    world:{mode:catalog.qaFixture === true ? 'qa_fixture' : 'reviewed_data',
      datasetStatus:catalog.qaFixture === true ? 'synthetic_test_only' : 'approved_import',
      disclaimer:catalog.qaFixture === true ?
        'SYNTHETIC QA RECORDS — NOT REAL ISTAT MUNICIPALITIES' :
        'Present administrative geography does not establish 1979 municipal borders or clubs',
      datasetId:data.datasetId,datasetVersion:data.version,
      historicalScope:data.historicalScope,
      data,assignedMunicipalityIds:result.map(c=>c.municipalityId)},
    clubs:result
  };
}

export function getClubGeography(state,clubId) {
  const club=state.clubs.find(c=>c.id===clubId);
  if(!club)return null;
  const rec=state.world?.data?.records?.find(x=>x.municipalityId===club.municipalityId);
  return rec ? clone(rec) : null; // Explicit null for fictional demo teams.
}
