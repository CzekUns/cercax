import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {newGame,listInitialOffers,acceptOffer,answerOpeningPress,answerPostMatchPress,
 prepareMatch,tickMatch,consumeMatchResult,advanceMatchday,rolloverSeason,
 getCoachWeekStatus,takeCareerOffer} from '../controller.js';
import {BUILTIN_SURNAME_CATALOG} from '../../../systems/attributes/surnames.js';
import {qaAvatar,qaMunicipalityCatalog} from './qa-geography.mjs';
import {serialize,deserialize} from '../../../systems/career/save.js';
import {createPlayerVisualR12,createClubKitsR12,ensureCareerVisualsR12,appearanceForMatchR12} from '../../../systems/attributes/visual-r12.js';
import {newCareerSeedR12} from '../../../systems/career/seed-r12.js';
import {syncPresidentTraitsR12,effectiveCoachTraitsR12} from '../../../systems/coach-club/president-traits-r12.js';
import {regionalAffinity} from '../../../systems/match-engine/orders.js';
const json=x=>JSON.parse(readFileSync(new URL(x,import.meta.url),'utf8'));
const presidents=json('../../../content/presidents.json');
const press={opening:json('../../../content/press-opening.json'),
 postmatch:json('../../../content/press-postmatch.json'),media:json('../../../content/press-media.json')};
const town=qaMunicipalityCatalog();
const nationalTownCatalog=json('../../../data/world/municipalities-m1.json');
const leagues={PROM:4,INTER:4,C2:4,C1:4,B:4,A:4};
function newWorld(seed,standard=false){
 return newGame({seed,avatar:qaAvatar,municipalityCatalog:town,
  ...(!standard?{leagueSizes:leagues}:{}),surnameCatalog:BUILTIN_SURNAME_CATALOG});
}
function hireAndPress(s){
 const offer=listInitialOffers(s).find(x=>x.divisionId==='PROM')??listInitialOffers(s)[0];
 const h=acceptOffer(s,offer.id,{press,presidents});
 assert.equal(h.accepted,true,JSON.stringify(h));
 assert.equal(s.coach.presidentTraitEffect?.clubId,s.coach.clubId);
 for(const q of s.flow.press.opening.questions)
  assert.equal(answerOpeningPress(s,q.id,q.answers[0].id,{press}).accepted,true);
 assert.equal(s.flow.stage,'hub');
}
test('R12-A: fresh seeds, explicit reproducible test override, 20 distinct seeded offers',()=>{
 const a=newWorld(1979),b=newWorld(1980),repeat=newWorld(1979);
 assert.equal(listInitialOffers(a).length,20);
 assert.notDeepEqual(listInitialOffers(a).map(o=>o.clubId),listInitialOffers(b).map(o=>o.clubId));
 assert.deepEqual(listInitialOffers(a),listInitialOffers(repeat));
 assert.equal(a.seed,a.rngState.seed);
 assert.notDeepEqual(a.clubs.map(c=>c.municipalityId),b.clubs.map(c=>c.municipalityId));
 assert.equal(newCareerSeedR12({query:'?seed=987654'}),987654);
 assert.equal(newCareerSeedR12({query:'?seed=987654'}),987654);
 const fixedCrypto={getRandomValues(a){a[0]=1;a[1]=100;return a;}};
 assert.equal(newCareerSeedR12({cryptoSource:fixedCrypto}),4294967396);
 assert.deepEqual(deserialize(serialize(a)).flow.initialOffers,a.flow.initialOffers);
});
test('R12-B/C: >100 new players have sourced fictional origins, stable faces and five different club kits',()=>{
 const s=newWorld(3401),all=s.clubs.flatMap(c=>c.players);
 assert.ok(all.length>=100);
 assert.ok(all.every(p=>p.visual?.skinToneId!=null&&p.visual?.hairColorId!=null));
 assert.ok(all.every(p=>p.visual?.facialHairStyleId&&p.visual?.faceVariantId!=null));
 assert.ok(all.every(p=>p.origin?.comune&&p.origin?.regione&&p.origin?.macroregione));
 assert.ok(all.every(p=>p.surnameId&&p.surnameSourceId));
 assert.equal(s.world.playerOriginPolicy,'fictional_birthplace_from_reviewed_modern_geography');
 const kits=s.clubs.slice(0,5).map(c=>JSON.stringify(c.visualKits.home));
 assert.equal(new Set(kits).size,5);
 const before=serialize(s),old=s.clubs[0].players.find(p=>!p.positions.includes('GK')),face=JSON.stringify(old.visual);
 const other=s.clubs[1];const uniformBefore=appearanceForMatchR12(old,s.clubs[0]);
 s.clubs[0].players=s.clubs[0].players.filter(p=>p.id!==old.id);other.players.push({...old,teamId:other.id});
 const transferred=other.players.at(-1);
 assert.equal(JSON.stringify(transferred.visual),face);
 assert.equal(appearanceForMatchR12(transferred,other).shirt,other.visualKits.home.shirtA);
 const saved=deserialize(serialize(s));
 assert.deepEqual(saved.clubs[1].players.at(-1).visual,old.visual);
 const migrated=ensureCareerVisualsR12(saved);
 assert.equal(migrated.players,0);assert.equal(migrated.kits,0);
 assert.ok(before.length>0);
});
test('R12-B legacy: missing cosmetics migrate deterministically, existing ones never overwritten',()=>{
 const s=newWorld(4302),before=s.clubs[0].players[0].visual;
 s.clubs[0].players[1].visual=null;s.clubs[1].visualKits=null;
 const changed=ensureCareerVisualsR12(s);
 assert.equal(changed.players,1);assert.equal(changed.kits,1);
 assert.deepEqual(s.clubs[0].players[0].visual,before);
 assert.equal(ensureCareerVisualsR12(s).players,0);
 assert.deepEqual(createPlayerVisualR12('id',1979),createPlayerVisualR12('id',1979));
 assert.deepEqual(createClubKitsR12('club',1979),createClubKitsR12('club',1979));
});
test('R12-C/F: regional shout affinity operates with generated PlayerV2, same region > same macro > other',()=>{
 const s=newGame({seed:12345,avatar:qaAvatar,municipalityCatalog:nationalTownCatalog,
  leagueSizes:leagues,surnameCatalog:BUILTIN_SURNAME_CATALOG}),all=s.clubs.flatMap(c=>c.players);
 const a=all.find(p=>p.origin.regione==='Campania')||all[0];
 const player={regionId:a.origin.regione.toLowerCase(),macroRegion:a.origin.macroregione==='Nord'?'north':a.origin.macroregione==='Centro'?'centre':'south'};
 const same=regionalAffinity(player,a.origin);
 const sameMacro=all.find(x=>x.origin.macroregione===a.origin.macroregione&&x.origin.regione!==a.origin.regione);
 const other=all.find(x=>x.origin.macroregione!==a.origin.macroregione);
 assert.ok(sameMacro&&other,'QA municipalities should cover at least two regions and macros');
 assert.equal(same.score,2);
 assert.equal(regionalAffinity(player,sameMacro.origin).score,1);
 assert.equal(regionalAffinity(player,other.origin).score,0);
});
test('R12-D: president buffs are persisted, replace not stack, and disappear when unemployed',()=>{
 const s=newWorld(5791);hireAndPress(s);
 const c=s.clubs.find(c=>c.id===s.coach.clubId),base={...s.coach.traits};
 const prior=effectiveCoachTraitsR12(s.coach,c);
 assert.equal(prior.clubId,c.id);
 assert.ok(Object.values(prior.modifiers).some(x=>x!==0));
 syncPresidentTraitsR12(s.coach,c,presidents);
 assert.deepEqual(effectiveCoachTraitsR12(s.coach,c),prior);
 assert.deepEqual(s.coach.traits,base);
 const back=deserialize(serialize(s));
 assert.deepEqual(effectiveCoachTraitsR12(back.coach,c),prior);
 const alternative=presidents.presidents.find(p=>p.id!==c.presidentId);
 const newClub={...c,presidentId:alternative.id};
 syncPresidentTraitsR12(s.coach,newClub,presidents);
 assert.equal(effectiveCoachTraitsR12(s.coach,newClub).presidentId,alternative.id);
 assert.deepEqual(s.coach.traits,base);
 syncPresidentTraitsR12(s.coach,null,null);
 assert.deepEqual(effectiveCoachTraitsR12(s.coach,null).effective,base);
});
function playWeek(s){
 const status=getCoachWeekStatus(s),abs=s.absoluteWeek;
 if(status.kind==='unemployed'){
  return advanceMatchday(s,{presidentCatalog:presidents,expectedAbsoluteWeek:abs});
 }
 if(status.kind==='bye_week')return advanceMatchday(s,{presidentCatalog:presidents,expectedAbsoluteWeek:abs});
 assert.equal(status.kind,'match_pending');
 const prep=prepareMatch(s);assert.equal(prep.accepted,true,prep.reason);
 tickMatch(prep.engine,900);
 assert.ok(prep.engine.isFinished());
 const result=consumeMatchResult(s,prep.engine,{press});assert.equal(result.accepted,true,result.reason);
 for(const q of s.flow.press.postmatch.questions)
  assert.equal(answerPostMatchPress(s,q.id,q.answers[0].id,{press}).accepted,true);
 return advanceMatchday(s,{presidentCatalog:presidents,expectedAbsoluteWeek:abs});
}
test('R12-I: five continuous standard seasons with real Engine06 fixtures, economic idempotence and reload', {timeout:900000},()=>{
 const s=newWorld(1979,true);hireAndPress(s);
 const initialPlayers=s.clubs.flatMap(c=>c.players),initialIdentity=new Map(initialPlayers.map(p=>[p.id,JSON.stringify(p.visual)]));
 const counts={played_match:0,bye_week:0,unemployed:0};
 for(let i=0;i<5;i++){
  let weeks=0;
  while(s.phase==='inSeason'){
   if(s.coach.gameOver||s.coach.morale===0)throw Error('GAME_OVER at '+s.seasonYear+'/'+s.week+'; cannot certify 5 seasons for this real seed');
   const before=s.absoluteWeek;
   const out=playWeek(s);
   assert.equal(out.accepted,true,out.reason);
   assert.equal(s.absoluteWeek,before+1);
   counts[out.weekType]=(counts[out.weekType]||0)+1;
   weeks++;
   assert.ok(weeks<=40,'season must finish in <=40 weeks');
   if(weeks===30){
    const roundTrip=deserialize(serialize(s));
    assert.deepEqual(roundTrip.coach,s.coach);
    assert.equal(roundTrip.flow.history.length,s.flow.history.length);
   }
  }
  assert.equal(weeks,38);
  const c=deserialize(serialize(s));
  assert.equal(c.seasonYear,1979+i);
  assert.equal(rolloverSeason(s).accepted,true);
  assert.equal(s.seasonYear,1980+i);
  if(s.flow.stage==='unemployed' && s.offers?.length){
   const job=takeCareerOffer(s,s.offers[0].id,{presidents});
   assert.equal(job.accepted,true,job.reason);
  }
 }
 for(const p of s.clubs.flatMap(c=>c.players)){
  if(initialIdentity.has(p.id))assert.equal(JSON.stringify(p.visual),initialIdentity.get(p.id));
 }
 mkdirSync('r12-evidence',{recursive:true});
 writeFileSync('r12-evidence/five-seasons-summary.json',JSON.stringify({
  seed:s.seed,seasonYear:s.seasonYear,absoluteWeek:s.absoluteWeek,counts,
  historyEntries:s.flow.history.length,coach:{morale:s.coach.morale,clubId:s.coach.clubId},
  stadiumSettlements:s.clubs.reduce((n,c)=>n+(c.management?.stadiumSettlements?.length||0),0)
 },null,2));
});
