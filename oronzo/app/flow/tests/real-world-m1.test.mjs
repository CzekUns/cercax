import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatedMunicipalities, assignWorldToClubs} from '../../../systems/career/world.js';
import {newGame,listInitialOffers} from '../controller.js';

const catalog=JSON.parse(readFileSync(new URL('../../../data/world/municipalities-m1.json',import.meta.url),'utf8'));

test('modern place identities: 500 durable ISTAT IDs, 19 source records, no invented 1979 fields',()=>{
 const validated=validatedMunicipalities(catalog);
 assert.equal(validated.records.length,500);
 assert.equal(new Set(validated.records.map(x=>x.municipalityId)).size,500);
 assert.equal(validated.historicalScope,'contemporary-geography-not-1979');
 assert.equal(validated.sources.length,19);
 assert.ok(validated.records.every(x=>x.provinceCode===null && x.populationReferenceYear===null && x.historical1979===false));
 assert.ok(validated.records.every(x=>/^[0-9]{6}$/.test(x.municipalityId)));
});
test('M1 catalog cannot silently become approved if review gate is absent',()=>{
 const pending={...catalog,reviewStatus:'pending'};
 assert.throws(()=>validatedMunicipalities(pending),/WORLD_DATA_UNREVIEWED/);
});
test('V2 real catalog does not weaken original V1 geographic validator',()=>{
 const v1={...catalog,schemaVersion:1};
 assert.throws(()=>validatedMunicipalities(v1),/WORLD_RECORD_INVALID/);
});
test('seed-stable real club origins preserve imaginary club identity',()=>{
 const clubs=Array.from({length:20},(_,i)=>({id:'club-'+i,name:'Club '+i}));
 const a=assignWorldToClubs(clubs,1979,catalog);
 const b=assignWorldToClubs(clubs,1979,catalog);
 assert.deepEqual(a,b);
 assert.equal(a.world.mode,'reviewed_data');
 assert.equal(a.world.assignedMunicipalityIds.length,20);
 assert.ok(a.clubs.every(x=>x.name.startsWith('Sportiva ')));
 assert.ok(a.clubs.every(x=>!Object.hasOwn(x,'geographicReferenceYear')));
 assert.ok(a.clubs.every(x=>!Object.hasOwn(x,'provinceCode')));
 assert.deepEqual(clubs[0],{id:'club-0',name:'Club 0'});
});
test('real municipalities produce 1979 career with 20 offers and persistent coach origin',()=>{
 const p=catalog.municipalities[0];
 const avatar={id:'m1-coach',traits:{luck:60,leadership:70,selfEsteem:75,patience:80},
  origin:{municipalityId:p.municipalityId,regionId:p.regionId,macroRegion:p.macroRegion}};
 const game=newGame({seed:1979,coachName:'Allenatore QA M1',avatar,municipalityCatalog:catalog});
 assert.equal(game.world.mode,'reviewed_data');
 assert.equal(game.world.historicalScope,'contemporary-geography-not-1979');
 assert.equal(game.coach.origin.municipalityId,p.municipalityId);
 assert.equal(listInitialOffers(game).length,20);
 assert.ok(game.clubs.every(x=>x.municipalityId&&x.regionId&&x.macroRegion));
});
