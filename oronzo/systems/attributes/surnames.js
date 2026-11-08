const NAME_REGEX=/^[\p{L}][\p{L}'’ .-]{0,79}$/u;
const key=s=>String(s).normalize('NFC').toLocaleLowerCase('it-IT').replace(/[’]/g,"'");
function rowsFromCSV(text){
 if(typeof text!=='string')throw new TypeError('CSV must be text');
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){
   if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}
   else if(c==='"')quoted=false;
   else cell+=c;
  }else if(c==='"'){
   if(cell)throw new Error('Bad CSV quote');
   quoted=true;
  }else if(c===','){row.push(cell);cell='';}
  else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw new Error('Unterminated CSV quote');
 if(cell!==''||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
 return rows.filter(row=>row.some(x=>x.trim()));
}
function readNumber(x,name,integer=false){
 if(String(x).trim()==='')throw new RangeError(`Missing ${name}`);
 const n=Number(x);
 if(!Number.isFinite(n)||n<=0||(integer&&!Number.isInteger(n)))throw new RangeError(`Invalid ${name}`);
 return n;
}
function sourceMetadata(source){
 if(!source||typeof source!=='object')throw new TypeError('Documented source required');
 for(const field of ['id','url','license','year'])if(!String(source[field]??'').trim())throw new Error(`Missing source.${field}`);
 if(!String(source.url).startsWith('https://'))throw new Error('Source URL must be HTTPS');
 if(!['CC BY 4.0','CC BY-SA 4.0','CC0 1.0'].includes(source.license))throw new Error('Unverified license');
 if(!/^\d{4}(?:[–-]\d{4})?$/.test(String(source.year)))throw new Error('Source year must be stated');
 return {...source};
}
export function loadSurnameCSV(csv,{source,limit=5000,country='IT'}={}){
 if(!Number.isInteger(limit)||limit<1||limit>5000)throw new RangeError('limit must be 1..5000');
 const provenance=sourceMetadata(source),rows=rowsFromCSV(csv);
 const header=rows.shift()?.map(x=>x.trim().toLowerCase().replace(/^\uFEFF/,''));
 if(!header||!(header.includes('name')||header.includes('surname')))throw new Error('Missing name/surname column');
 const ix=k=>header.indexOf(k),val=(r,k)=>ix(k)<0?'':(r[ix(k)]??'').trim();
 const metric=header.includes('pct_in_country')?'pct_in_country':header.includes('frequency')?'frequency':header.includes('rank')?'rank':null;
 if(!metric)throw new Error('Cannot rank without real frequency or rank');
 let skippedCountries=0,duplicateRows=0;const canonical=new Map(),variants=[];
 for(const row of rows){
  if(row.length!==header.length)throw new Error('Wrong CSV column count');
  if(ix('country_code')>=0&&val(row,'country_code')!==country){skippedCountries++;continue;}
  const name=(val(row,'name')||val(row,'surname')).normalize('NFC');
  if(!NAME_REGEX.test(name))throw new Error(`Invalid surname: ${name}`);
  if(val(row,'variant_of')){variants.push({name,base:val(row,'variant_of')});continue;}
  const frequency=val(row,'frequency')?readNumber(val(row,'frequency'),'frequency'):null;
  const share=val(row,'pct_in_country')?readNumber(val(row,'pct_in_country'),'pct_in_country'):null;
  if(share!=null&&share>1)throw new RangeError('Share >1');
  const rank=val(row,'rank')?readNumber(val(row,'rank'),'rank',true):null;
  const metricValue=metric==='pct_in_country'?share:metric==='frequency'?frequency:rank;
  if(metricValue==null)throw new Error(`Missing ${metric} for ${name}`);
  const existing=canonical.get(key(name));
  if(existing){
   const v=metric==='pct_in_country'?'share':metric;
   if(existing[v]!==metricValue)throw new Error(`Conflicting duplicate ${name}`);
   duplicateRows++;continue;
  }
  canonical.set(key(name),{name,frequency,share,rank,variants:[]});
 }
 for(const {name,base} of variants){
  const target=canonical.get(key(base));
  if(!target)throw new Error(`Variant without canonical: ${base}`);
  if(key(name)===key(base)||canonical.has(key(name)))throw new Error('Variant collides with canonical');
  if(!target.variants.some(v=>key(v)===key(name)))target.variants.push(name);
 }
 const sorted=[...canonical.values()].sort((a,b)=>{
  const diff=metric==='rank'?b.rank-a.rank:metric==='frequency'?a.frequency-b.frequency:a.share-b.share;
  return diff||a.name.localeCompare(b.name,'it-IT');
 });
 const surnames=sorted.slice(0,limit).map((s,i)=>({...s,rarityOrder:i+1}));
 return {schemaVersion:1,source:provenance,country,metric,sort:'least-frequent-first',
  stats:{inputRows:rows.length,validRows:canonical.size,duplicateRows,skippedCountries,selected:surnames.length,cap:limit},
  surnames};
}
export function chooseSurname(catalog,rng){
 if(!catalog?.surnames?.length)throw new Error('Nonempty sourced catalog required');
 if(typeof rng!=='function')throw new TypeError('Seeded RNG required');
 const roll=rng();
 if(!Number.isFinite(roll)||roll<0||roll>=1)throw new RangeError('rng must return [0,1)');
 const row=catalog.surnames[Math.floor(roll*catalog.surnames.length)];
 return {id:row.id ?? null,name:row.name,sourceId:catalog.source.id,rarityOrder:row.rarityOrder};
}



// M1: frozen CC0 municipal snapshot imported from the unmodified research PR #40.
import {BERGAMO_2021_METADATA,BERGAMO_2021_RECORDS} from './data/bergamo-2021-m1.js';
const normalizeSurnameKey=name=>String(name).normalize('NFC').trim().toLocaleLowerCase('it-IT').replace(/[’]/g,"'");
/**
 * Verify the locked 2021 municipal snapshot before using it in the generator.
 * NO claim of Italian national surname frequency, rarity or etymology.
 * A surname ID comes from the source and NEVER from the entry's array position.
 */
export function loadVerifiedSurnameSnapshot(records,metadata) {
  if(!Array.isArray(records)||!metadata||typeof metadata!=='object')throw new TypeError('Snapshot records and metadata required');
  if(metadata.license!=='CC0 1.0'||metadata.referenceYear!==2021||metadata.sourceId!=='bergamo-2021-italiani-cc0'||
    typeof metadata.sourceCommitSha!=='string'||!/^[a-f0-9]{40}$/.test(metadata.sourceCommitSha)||
    typeof metadata.sourceBlobSha!=='string'||!/^[a-f0-9]{40}$/.test(metadata.sourceBlobSha)||
    !String(metadata.sourceURL||'').startsWith('https://'))throw new Error('Unverified municipal snapshot provenance');
  if(records.length!==metadata.records||records.length<500)throw new Error('Snapshot count differs from pinned metadata or M1 threshold');
  const ids=new Set(),names=new Set();
  const surnames=records.map(row=>{
    if(!row||typeof row.id!=='string'||!/^it-surname-[a-z0-9-]+$/.test(row.id)||
      typeof row.name!=='string'||!NAME_REGEX.test(row.name)||
      !Number.isInteger(row.frequency)||row.frequency<=10)throw new Error('Invalid sourced surname record');
    const key=normalizeSurnameKey(row.name);
    if(ids.has(row.id)||names.has(key))throw new Error('Duplicate surname name or ID');
    ids.add(row.id);names.add(key);
    return {id:row.id,name:row.name,frequency:row.frequency,share:null,rank:null,variants:[]};
  });
  surnames.sort((a,b)=>a.frequency-b.frequency||a.name.localeCompare(b.name,'it-IT'));
  surnames.forEach((row,i)=>row.rarityOrder=i+1);
  return {
    schemaVersion:2,
    source:{id:metadata.sourceId,url:metadata.sourceURL,year:String(metadata.referenceYear),license:metadata.license,
      datasetSnapshotId:metadata.id,sourceCommitSha:metadata.sourceCommitSha,sourceBlobSha:metadata.sourceBlobSha,
      frequencyScope:metadata.frequencyScope,rankScope:'bergamo-2021-only'},
    country:'IT',metric:'municipal-frequency',sort:'least-frequent-first',
    stats:{inputRows:records.length,validRows:surnames.length,duplicateRows:0,skippedCountries:0,
      selected:surnames.length,cap:surnames.length},
    surnames
  };
}
export const BUILTIN_SURNAME_CATALOG=loadVerifiedSurnameSnapshot(BERGAMO_2021_RECORDS,BERGAMO_2021_METADATA);
