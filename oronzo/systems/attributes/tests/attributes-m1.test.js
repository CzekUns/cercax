import test from 'node:test';
import assert from 'node:assert/strict';
import {BERGAMO_2021_METADATA,BERGAMO_2021_RECORDS} from '../data/bergamo-2021-m1.js';
import {BUILTIN_SURNAME_CATALOG,loadVerifiedSurnameSnapshot,chooseSurname} from '../surnames.js';
import {generatePlayer,generateSquad,generateLeague} from '../generator.js';
import {normalizePlayer,validatePlayer} from '../player-model.js';
import {toMatchEngineOrigin,toMatchEnginePlayer,toIndividualShoutCommand,normalizeShoutTone,REGION_TO_ENGINE,playerTrustForCoach} from '../player-engine-bridge.js';
import {effectiveAbility} from '../personality.js';
import {applyShout} from '../player-traits.js';
import {createRng} from '../rng.js';

const first=()=>generatePlayer({seed:1979,teamId:'bergamo',index:1,role:'FW'});
test('M1 pinned 600 genuine rows with distinct stable IDs, names, local frequencies and provenance',()=>{
 assert.equal(BERGAMO_2021_RECORDS.length,600);
 assert.equal(BUILTIN_SURNAME_CATALOG.surnames.length,600);
 assert.equal(BUILTIN_SURNAME_CATALOG.source.id,'bergamo-2021-italiani-cc0');
 assert.equal(BUILTIN_SURNAME_CATALOG.source.license,'CC0 1.0');
 assert.equal(BUILTIN_SURNAME_CATALOG.source.year,'2021');
 assert.equal(BUILTIN_SURNAME_CATALOG.source.sourceBlobSha,'de098d57f1ce47be4cd07ecfb64ba213a6835663');
 assert.equal(BERGAMO_2021_METADATA.records,600);
 assert.equal(new Set(BUILTIN_SURNAME_CATALOG.surnames.map(x=>x.id)).size,600);
 assert.equal(new Set(BUILTIN_SURNAME_CATALOG.surnames.map(x=>x.name.normalize('NFC').toLocaleLowerCase('it-IT').replace(/[’]/g,"'"))).size,600);
 assert.ok(BUILTIN_SURNAME_CATALOG.surnames.every(x=>Number.isInteger(x.frequency)&&x.frequency>=11&&x.frequency<=16&&x.rank===null));
 assert.equal(BUILTIN_SURNAME_CATALOG.surnames[0].frequency,11);
 assert.equal(BUILTIN_SURNAME_CATALOG.surnames.at(-1).frequency,16);
});
test('M1 snapshot mutation and duplicate IDs/names fail closed',()=>{
 const records=BERGAMO_2021_RECORDS;
 assert.throws(()=>loadVerifiedSurnameSnapshot(records,{...BERGAMO_2021_METADATA,records:999}),/count/i);
 assert.throws(()=>loadVerifiedSurnameSnapshot(records,{...BERGAMO_2021_METADATA,license:'unknown'}),/provenance/);
 const dup=[...records];dup[1]={...dup[1],id:dup[0].id};
 assert.throws(()=>loadVerifiedSurnameSnapshot(dup,BERGAMO_2021_METADATA),/Duplicate/);
 const dupName=[...records];dupName[1]={...dupName[1],name:dupName[0].name};
 assert.throws(()=>loadVerifiedSurnameSnapshot(dupName,BERGAMO_2021_METADATA),/Duplicate/);
});
test('M1 generator directly uses 600-entry catalog by default; stable surname IDs and no synthetic national ranks',()=>{
 const options={seed:'m1-1979',teamId:'club-a'};
 const a=generateSquad(options),b=generateSquad(options);
 assert.deepEqual(a,b);
 assert.equal(a.length,22);
 assert.ok(a.every(p=>p.surnameId&&p.surnameSourceId==='bergamo-2021-italiani-cc0'));
 assert.ok(a.every(p=>BUILTIN_SURNAME_CATALOG.surnames.some(s=>s.id===p.surnameId&&s.name===p.surname)));
 assert.ok(a.every(p=>validatePlayer(p).valid));
 assert.equal(new Set(a.map(p=>p.id)).size,22);
 const league=generateLeague({seed:'league',teams:15});
 assert.equal(new Set(league.flatMap(x=>x.players).map(x=>x.id)).size,330);
});
test('M1 catalog replacement after creation cannot change already persisted player identities',()=>{
 const original=generateSquad({seed:123,teamId:'club-saved'});
 const persisted=JSON.parse(JSON.stringify(original));
 const picked=chooseSurname(BUILTIN_SURNAME_CATALOG,createRng('seed'));
 assert.ok(picked.id&&picked.sourceId==='bergamo-2021-italiani-cc0');
 const changedCatalog={...BUILTIN_SURNAME_CATALOG,surnames:BUILTIN_SURNAME_CATALOG.surnames.toReversed()};
 const newSquad=generateSquad({seed:123,teamId:'club-saved',surnameCatalog:changedCatalog});
 assert.deepEqual(persisted.map(p=>p.surnameId),original.map(p=>p.surnameId));
 assert.ok(newSquad.some((p,i)=>p.surnameId!==persisted[i].surnameId));
 assert.deepEqual(persisted.map(p=>normalizePlayer(p)),persisted);
});
test('M1 0 trust survives normalization, reload and bridge even if legacy mirror conflicts',()=>{
 const p=first();p.relationships.coachTrust=0;p.relationshipWithCoach=100;
 const normalized=normalizePlayer(JSON.parse(JSON.stringify(p)));
 assert.equal(normalized.relationships.coachTrust,0);
 assert.equal(normalized.relationshipWithCoach,0);
 assert.equal(toMatchEnginePlayer(normalized).relationshipWithCoach,0);
 assert.equal(playerTrustForCoach(normalized),0);
 const mirrored=normalizePlayer({...p,relationships:{},relationshipWithCoach:13});
 assert.equal(mirrored.relationships.coachTrust,13);
});
test('M1 canonical origin remains unchanged by transient engine projection',()=>{
 const p=first(),before=JSON.stringify(p);
 const projection=toMatchEnginePlayer(p);
 assert.equal(projection.origin.regione,p.origin.regione);
 assert.equal(projection.origin.macroregione,p.origin.macroregione);
 assert.equal(projection.origin.regionId,REGION_TO_ENGINE[p.origin.regione]);
 assert.ok(['north','centre','south'].includes(projection.origin.macroRegion));
 assert.equal(JSON.stringify(p),before);
 assert.deepEqual(normalizePlayer(p).origin,p.origin);
});
test('M1 unknown origin stays null, including after save/load; no fictional municipality',()=>{
 const p=normalizePlayer({name:'Senza provenienza',teamId:'club',origin:null});
 assert.equal(p.origin,null);
 assert.equal(toMatchEnginePlayer(JSON.parse(JSON.stringify(p))).origin,null);
 assert.equal(toMatchEngineOrigin({regionId:'campania',macroRegion:'south'}),null);
 assert.deepEqual(toMatchEngineOrigin({municipalityName:'Napoli',regionId:'campania',macroRegion:'south'}),
  {comune:'Napoli',regione:'Campania',macroregione:'Sud',regionId:'campania',macroRegion:'south'});
});
test('M1 all 20 regions adapt deterministically, with same-region/same-macro split',()=>{
 for(const [region,slug] of Object.entries(REGION_TO_ENGINE)){
  const out=toMatchEngineOrigin({comune:'Comune di prova',regione:region});
  assert.equal(out.regionId,slug);
  assert.ok(['north','centre','south'].includes(out.macroRegion));
 }
 const home=toMatchEngineOrigin({comune:'Napoli',regione:'Campania'});
 const near=toMatchEngineOrigin({comune:'Bari',regione:'Puglia'});
 const away=toMatchEngineOrigin({comune:'Roma',regione:'Lazio'});
 assert.equal(home.macroRegion,near.macroRegion);
 assert.notEqual(home.macroRegion,away.macroRegion);
});
test('M1 gentle/hard and encourage/harsh map to exactly one contract',()=>{
 assert.equal(normalizeShoutTone('gentle'),'encourage');
 assert.equal(normalizeShoutTone('encourage'),'encourage');
 assert.equal(normalizeShoutTone('hard'),'harsh');
 assert.equal(normalizeShoutTone('harsh'),'harsh');
 assert.throws(()=>normalizeShoutTone('calm'),RangeError);
 const p=first();p.origin={comune:'Napoli',regione:'Campania',macroregione:'Sud'};
 const cmd=toIndividualShoutCommand({teamId:p.teamId,player:p,tone:'hard',t:120,coachOrigin:{comune:'Salerno',regione:'Campania'},coachLeadership:93,utteranceId:'copy-9'});
 assert.equal(cmd.payload.tone,'harsh');
 assert.equal(cmd.payload.playerOrigin.regionId,'campania');
 assert.equal(cmd.payload.coachOrigin.regionId,'campania');
 assert.equal(cmd.payload.playerTrust,p.relationships.coachTrust);
 assert.equal(cmd.t,120);
 assert.throws(()=>toIndividualShoutCommand({teamId:'wrong',player:p}),/another team/);
});
test('M1 old 180s bonus is ignored by effectiveAbility and stripped from engine projection',()=>{
 const p=first(),base=effectiveAbility(p,{skill:'shooting',t:100}).effective;
 p.temporaryEffects=[{id:'old',kind:'coach-shout',bonus:8,expiresAt:300}];
 assert.equal(effectiveAbility(p,{skill:'shooting',t:100}).effective,base);
 assert.equal(toMatchEnginePlayer(p).temporaryEffects.length,0);
 assert.throws(()=>applyShout(p,{eventId:'engine-1',t:200,tone:'hard'}),/scope required/);
});
test('M1 standalone-demo is explicit, idempotent and never manufactures match effects',()=>{
 const p=first(),one=applyShout(p,{eventId:'demo-one',scope:'standalone-demo',tone:'gentle',t:100});
 const after=JSON.parse(JSON.stringify(one.player));
 const two=applyShout(after,{eventId:'demo-one',scope:'standalone-demo',tone:'gentle',t:101});
 assert.equal(one.applied,true);assert.equal(two.applied,false);
 assert.equal(one.player.temporaryEffects.length,0);
 assert.equal(one.effects.durationSeconds,0);
 assert.deepEqual(two.player,after);
});
