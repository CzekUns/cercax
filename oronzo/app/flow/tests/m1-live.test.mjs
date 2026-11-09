import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  newGame,listInitialOffers,acceptOffer,answerOpeningPress,answerPostMatchPress,
  selectM1Training,commandM1Match,enableM1SourcedPlayers,
  getStateForUI,prepareMatch,tickMatch,consumeMatchResult,
  advanceMatchday,saveGame,loadGame
} from '../controller.js';
import {qaAvatar,qaMunicipalityCatalog} from './qa-geography.mjs';

const sizes={PROM:4,INTER:4,C2:4,C1:4,B:4,A:4};
const fromJSON=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const press={opening:fromJSON('../../../content/press-opening.json'),
  postmatch:fromJSON('../../../content/press-postmatch.json'),
  media:fromJSON('../../../content/press-media.json')};
const presidents=fromJSON('../../../content/presidents.json');
function store(){
  const map=new Map();
  return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),
    removeItem:k=>map.delete(k)};
}
function setup(seed){
  const state=newGame({seed,avatar:qaAvatar,
    municipalityCatalog:qaMunicipalityCatalog(),leagueSizes:sizes});
  const offer=listInitialOffers(state)[0];
  assert.equal(acceptOffer(state,offer.id,{press}).accepted,true);
  for(const q of state.flow.press.opening.questions)
    assert.equal(answerOpeningPress(state,q.id,q.answers[0].id).accepted,true);
  assert.equal(state.flow.stage,'hub');
  return state;
}
test('M1: real 08 weekly training and 06 tactic/substitution feed, fulltime, finance, persistence',()=>{
  const s=setup(910);
  const clubId=s.coach.clubId;
  const before=structuredClone(s.clubs.find(c=>c.id===clubId).players);
  const period=s.absoluteWeek;
  const picked=selectM1Training(s,{plan:'technical',intensity:60,expectedAbsoluteWeek:period});
  assert.equal(picked.accepted,true);
  assert.equal(s.coach.trainingPlan.week,period);
  const prepared=prepareMatch(s);
  assert.equal(prepared.accepted,true);
  const tactics=commandM1Match(s,prepared.engine,{type:'tacticChange',requestId:'tactical:1',
    payload:{formation:'4-3-3',mentality:60}});
  assert.equal(tactics.accepted,true);
  assert.equal(s.coach.tactics.formation,'4-3-3');
  assert.equal(commandM1Match(s,prepared.engine,{type:'tacticChange',
    requestId:'tactical:1',payload:{formation:'4-4-2'}}).reason,'already_sent');
  const selection=prepared.matchInput.homeClub.id===clubId
    ?{xi:prepared.matchInput.homeXI,bench:prepared.matchInput.homeBench}
    :{xi:prepared.matchInput.awayXI,bench:prepared.matchInput.awayBench};
  const members=s.clubs.find(c=>c.id===clubId).players;
  const isGK=id=>members.find(p=>p.id===id)?.positions.includes('GK');
  const outId=selection.xi.find(id=>!isGK(id));
  const inId=selection.bench.find(id=>!isGK(id));
  assert.ok(outId && inId);
  const substitution=commandM1Match(s,prepared.engine,{type:'substitution',
    requestId:'sub:1',payload:{outId,inId}});
  assert.equal(substitution.accepted,true);
  tickMatch(prepared.engine,900);
  const final=consumeMatchResult(s,prepared.engine,{press});
  assert.equal(final.accepted,true);
  assert.equal(final.source,'match_engine_06');
  assert.equal(s.flow.m1.matchLoads.length,1);
  for(const q of s.flow.press.postmatch.questions)
    assert.equal(answerPostMatchPress(s,q.id,q.answers[0].id).accepted,true);
  const completed=advanceMatchday(s,{presidentCatalog:presidents,expectedAbsoluteWeek:period});
  assert.equal(completed.accepted,true);
  assert.equal(s.absoluteWeek,period+1);
  assert.deepEqual(s.flow.m1.training.appliedWeeks,[period]);
  const after=s.clubs.find(c=>c.id===clubId).players;
  assert.deepEqual(after.map(p=>p.id),before.map(p=>p.id));
  assert.deepEqual(after.map(p=>p.contract.weeklyWage),before.map(p=>p.contract.weeklyWage));
  assert.ok(after.some((p,i)=>p.status.fatigue!==before[i].status.fatigue));
  assert.ok(after.some((p,i)=>p.technical.passing!==before[i].technical.passing));
  assert.ok(Object.values(s.flow.effectTransactions).every(x=>x.status==='applied'));
  const storage=store();
  saveGame(s,storage);
  const loaded=loadGame(storage).state;
  assert.deepEqual(loaded.flow.m1,s.flow.m1);
  assert.deepEqual(loaded.clubs.find(c=>c.id===clubId).players,after);
  assert.equal(advanceMatchday(loaded,{presidentCatalog:presidents,
    expectedAbsoluteWeek:period}).reason,'stale_week_action');
});

test('M1: 600 sourced 08 surnames only when PR31 is available',async t=>{
  let module;
  try {module=await import('../../../systems/attributes/surnames.js');}
  catch(e){if(e.code==='ERR_MODULE_NOT_FOUND'){t.skip('PR31 not in this checkout');return;}throw e;}
  const catalog=module.BUILTIN_SURNAME_CATALOG;
  assert.ok(catalog?.surnames?.length>=500);
  const s=newGame({seed:927,avatar:qaAvatar,
    municipalityCatalog:qaMunicipalityCatalog(),leagueSizes:sizes});
  const ids=s.clubs.flatMap(c=>c.players.map(p=>p.id));
  const contracts=s.clubs.flatMap(c=>c.players.map(p=>p.contract.weeklyWage));
  const result=enableM1SourcedPlayers(s,{surnameCatalog:catalog,playerOrigins:[]});
  assert.equal(result.accepted,true);
  assert.equal(result.dataset.recordCount,catalog.surnames.length);
  assert.deepEqual(s.clubs.flatMap(c=>c.players.map(p=>p.id)),ids);
  assert.deepEqual(s.clubs.flatMap(c=>c.players.map(p=>p.contract.weeklyWage)),contracts);
  assert.ok(s.clubs.every(c=>c.players.every(p=>p.surnameId && p.surnameSourceId &&
    p.origin===null)));
  assert.equal(enableM1SourcedPlayers(s,{surnameCatalog:catalog}).reason,'already_attached');
  const storage=store();saveGame(s,storage);
  assert.deepEqual(loadGame(storage).state.flow.m1.playerDataset,result.dataset);
});

test('M1: individual commands only when PR35 engine is in the checkout',async t=>{
  try {await import('../../../systems/match-engine/orders.js');}
  catch(e){if(e.code==='ERR_MODULE_NOT_FOUND'){t.skip('PR35 not in this checkout');return;}throw e;}
  const s=setup(915),prepared=prepareMatch(s);
  assert.equal(prepared.accepted,true);
  const teamId=s.coach.clubId;
  const eleven=prepared.matchInput.homeClub.id===teamId
    ?prepared.matchInput.homeXI:prepared.matchInput.awayXI;
  const player=eleven.find(id=>!s.clubs.find(c=>c.id===teamId)
    .players.find(p=>p.id===id).positions.includes('GK'));
  const given=commandM1Match(s,prepared.engine,{requestId:'shout:1979:1',
    type:'individualShout',tone:'gentle',targetPlayerId:player});
  assert.equal(given.accepted,true);
  const state=prepared.engine.snapshot().players.find(p=>p.id===player);
  assert.equal(state.individualInstruction.tone,'encourage');
  assert.equal(commandM1Match(s,prepared.engine,{requestId:'shout:1979:1',
    type:'individualShout',tone:'gentle',targetPlayerId:player}).reason,'already_sent');
  tickMatch(prepared.engine,900);
  const response=consumeMatchResult(s,prepared.engine,{press});
  assert.equal(response.accepted,true);
  const records=Object.values(s.flow.m1.persistentEvents);
  assert.equal(records.length,1);
  assert.equal(records[0].status,'applied'); // R11 reconciles via 09 on fulltime.
  const persisted=s.clubs.find(c=>c.id===teamId).players.find(p=>p.id===player);
  assert.equal(Number.isFinite(persisted.relationships.coachTrust),true);
  assert.equal(Object.keys(s.clubs.find(c=>c.id===teamId).management.shouts).length,1);
  assert.equal(records[0].event.detail.temporaryOwner,'match-engine-06');
  const bank=store();for(const q of s.flow.press.postmatch.questions)
    answerPostMatchPress(s,q.id,q.answers[0].id);
  saveGame(s,bank);
  assert.deepEqual(loadGame(bank).state.flow.m1.persistentEvents,s.flow.m1.persistentEvents);
});

test('M1: 500 traced municipalities from #53 only when catalog exists',async t=>{
  let catalog;
  try {catalog=fromJSON('../../../data/world/municipalities-m1.json');}
  catch(e){if(e.code==='ENOENT'){t.skip('PR53 not in this checkout');return;}throw e;}
  const first=catalog.municipalities?.[0];
  assert.ok(first?.municipalityId);
  const avatar={...qaAvatar,origin:{municipalityId:first.municipalityId,
    regionId:first.regionId,macroRegion:first.macroRegion}};
  const s=newGame({seed:921,avatar,municipalityCatalog:catalog,leagueSizes:sizes});
  assert.ok(s.world?.data?.records?.length>=100);
  assert.equal(s.coach.origin.municipalityId,first.municipalityId);
  assert.ok(s.clubs.every(c=>typeof c.municipalityId==='string'));
  const bank=store();saveGame(s,bank);
  assert.deepEqual(loadGame(bank).state.world,s.world);
});
