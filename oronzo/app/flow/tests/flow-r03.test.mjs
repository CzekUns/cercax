import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  newGame,listInitialOffers,acceptOffer,answerOpeningPress,answerPostMatchPress,
  getStateForUI,getRosterPlayer,getTrainingPlayer,prepareMatch,tickMatch,
  consumeMatchResult,advanceMatchday,rolloverSeason,saveGame,loadGame,
  exportGame,importGame,MATCH_SIM_SECONDS_PER_REAL_SECOND
} from '../controller.js';
import { validatedMunicipalities } from '../../../systems/career/world.js';
import {newCareer} from '../../../systems/career/career.js';
import {serialize} from '../../../systems/career/save.js';

const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const presses={opening:json('../../../content/press-opening.json'),
  postmatch:json('../../../content/press-postmatch.json'),
  media:json('../../../content/press-media.json')};
const presidents=json('../../../content/presidents.json');
const sizes={PROM:4,INTER:4,C2:4,C1:4,B:4,A:4};
const avatar={id:'av:old_school',traits:{luck:55,leadership:64,selfEsteem:72,patience:47},
  origin:{municipalityId:'TEST_ONLY',regionId:'campania',macroRegion:'south'}};
const storage=()=>{
  const data=new Map();
  return {getItem:key=>data.get(key)??null,setItem:(k,v)=>data.set(k,v),
    removeItem:key=>data.delete(key),data};
};
function start(seed=31,visuals={}) {
  const state=newGame({seed,avatar,leagueSizes:sizes,...visuals});
  const offered=listInitialOffers(state);
  const reply=acceptOffer(state,offered.find(o=>o.clubId!=='PROM-01')?.id??offered[0].id,
    {press:presses});
  assert.equal(reply.accepted,true);
  assert.equal(reply.effectStatus,'awaiting_agent09');
  assert.equal(state.flow.press.opening.questions.length,5);
  for(const question of state.flow.press.opening.questions) {
    const answer=answerOpeningPress(state,question.id,question.answers[0].id);
    assert.equal(answer.accepted,true);
    assert.equal(answer.effectStatus,'awaiting_agent09');
    assert.equal(answerOpeningPress(state,question.id,question.answers[0].id).accepted,false);
  }
  assert.equal(state.flow.stage,'hub');
  return state;
}
function playMatchday(state) {
  if(state.flow.stage==='unemployed') {
    const expectedAbsoluteWeek=state.absoluteWeek;
    const result=advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek});
    assert.equal(result.accepted,true);
    assert.equal(advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek}).reason,
      'stale_week_action');
    return;
  }
  assert.equal(state.flow.stage,'hub');
  const fixture=prepareMatch(state);
  assert.equal(fixture.accepted,true);
  assert.equal(fixture.engine.isFinished(),false);
  // Never use engine.advanceRealSeconds(): it is currently 60x; flow is 6x.
  const final=tickMatch(fixture.engine,900);
  assert.equal(fixture.engine.isFinished(),true);
  assert.equal(final.phase,'fulltime');
  const submitted=consumeMatchResult(state,fixture.engine,{press:presses});
  assert.equal(submitted.accepted,true);
  assert.equal(submitted.source,'match_engine_06');
  assert.equal(consumeMatchResult(state,fixture.engine).accepted,false);
  assert.equal(state.flow.press.postmatch.questions.length,2);
  for(const q of state.flow.press.postmatch.questions) {
    const response=answerPostMatchPress(state,q.id,q.answers[0].id);
    assert.equal(response.accepted,true);
    assert.equal(response.effectStatus,'awaiting_agent09');
  }
  const registered=state.leagues[fixture.fixture.divisionId].fixtures
    .find(f=>f.id===fixture.fixture.id);
  assert.deepEqual(registered.result.score,submitted.score);
  const beforeWeek=state.absoluteWeek;
  const after=advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:beforeWeek});
  assert.equal(after.accepted,true);
  assert.equal(state.absoluteWeek,beforeWeek+1);
  assert.equal(advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:beforeWeek}).reason,
    'stale_week_action');
}

test('R03 1979, 20 deterministic available jobs, one signed contract, persistent save',()=>{
  const first=newGame({seed:211,avatar,leagueSizes:sizes});
  const second=newGame({seed:211,avatar,leagueSizes:sizes});
  const offers=listInitialOffers(first);
  assert.equal(first.seasonYear,1979);
  assert.equal(first.coach.clubId,null);
  assert.equal(first.coach.contract,null);
  assert.equal(first.gameDate,'1979-08-01');
  assert.deepEqual(offers,listInitialOffers(second));
  assert.equal(offers.length,20);
  assert.equal(new Set(offers.map(o=>o.clubId)).size,20);
  assert.ok(offers.every(o=>o.coachWageITL>0&&o.presidentId));
  // A reduced 4x6 QA world has only eight low-league clubs, so it explicitly
  // falls back to the full set. The real default-size opening offers stay low tier.
  const full=newGame({seed:211,avatar});
  assert.ok(listInitialOffers(full).every(o=>['PROM','INTER'].includes(o.divisionId)));
  assert.equal(first.world.datasetStatus,'awaiting_research_review');
  assert.equal(getStateForUI(first).stage,'offers');
  const chosen=offers[3];
  assert.equal(acceptOffer(first,chosen.id,{press:presses}).accepted,true);
  assert.equal(acceptOffer(first,chosen.id).reason,'already_accepted');
  assert.equal(acceptOffer(first,offers[4].id).reason,'opening_contract_already_signed');
  assert.equal(first.coach.clubId,chosen.clubId);
  assert.equal(first.coach.contract.weeklyWage,chosen.coachWageITL);
  const store=storage();
  saveGame(first,store);
  const loaded=loadGame(store);
  assert.deepEqual(loaded.state.coach,first.coach);
  assert.deepEqual(listInitialOffers(loaded.state),listInitialOffers(first));
  assert.equal(loaded.state.seasonYear,1979);
  assert.equal(loaded.state.flow.acceptedOfferId,chosen.id);
  assert.deepEqual(importGame(exportGame(first)),first);
  // Never retcon an older V1-created 1985 career when it is loaded by the V2 serializer.
  const legacy=newCareer({leagueSizes:sizes},211);
  assert.equal(legacy.seasonYear,1985);
  assert.equal(importGame(serialize(legacy)).seasonYear,1985);
});

test('R03 visuals have a single player ID + kit source in roster, training and reload',()=>{
  const id='PROM-01:P01';
  const visual={skinToneId:'skin-03',hairColorId:'hair-02',hairStyleId:'curly',
    facialHairStyleId:'moustache',facialHairColorId:'hair-02',portraitAssetId:null};
  const kit={home:{shirtA:'red',shirtB:'white',shirtPatternId:'vertical-stripes',
    shorts:'black',socks:'red',trim:'white'}};
  const s=newGame({seed:31,avatar,leagueSizes:sizes,
    playerVisualById:{[id]:visual},clubVisualKitsById:{'PROM-01':kit}});
  const roster=getRosterPlayer(s,id),training=getTrainingPlayer(s,id);
  assert.deepEqual(roster,training);
  assert.deepEqual(roster.visual,visual);
  assert.deepEqual(roster.visualKits,kit);
  assert.equal(roster.appearance.facialHairStyleId,'moustache');
  const roundtrip=importGame(exportGame(s));
  assert.deepEqual(getTrainingPlayer(roundtrip,id),roster);
  assert.equal(getRosterPlayer(s,'PROM-01:P03').appearance,null);
  assert.throws(()=>newGame({seed:31,avatar,leagueSizes:sizes,
    playerVisualById:{'not-existing':visual}}),/Unknown visual/);
});

test('R03 100 reviewed municipality records are required for M1; demo is explicit',()=>{
  assert.equal(newGame({seed:91,avatar,leagueSizes:sizes}).world.mode,'demo');
  const sources=[{id:'test-only',url:'https://example.org/fictional-test',
    publisher:'synthetic fixture, not ISTAT',license:'test fixture'}];
  const municipalities=Array.from({length:100},(_,i)=>({
    municipalityId:String(i+1).padStart(6,'0'),municipalityName:'TEST COMUNE '+i,
    provinceCode:'NA',regionId:'campania',macroRegion:'south',population:100+i,
    populationReferenceYear:2025,sourceId:'test-only'
  }));
  const data={datasetId:'synthetic-tests',version:'0',reviewStatus:'approved',
    sources,municipalities};
  assert.throws(()=>validatedMunicipalities({...data,municipalities:municipalities.slice(1)}),
    /WORLD_M1_GATE/);
  const verifiedAvatar={...avatar,origin:{municipalityId:'000001',regionId:'campania',macroRegion:'south'}};
  const c=newGame({seed:91,avatar:verifiedAvatar,leagueSizes:sizes,municipalityCatalog:data});
  assert.equal(c.world.mode,'reviewed_data');
  assert.equal(c.world.data.records.length,100);
  assert.equal(c.clubs[0].municipalityId.length,6);
  assert.equal(c.world.historicalScope,'source_reference_year_not_verified_1979');
  assert.deepEqual(importGame(exportGame(c)).clubs,c.clubs);
  const corrupted=structuredClone(data);corrupted.municipalities[0].sourceId='missing';
  assert.throws(()=>validatedMunicipalities(corrupted),/WORLD_RECORD_INVALID/);
});

test('R03 engine06 fulltime, press04, board09 payroll, two seasons and save/load',()=>{
  let state=start(44);
  const bank=storage();
  const playerIds=state.clubs.flatMap(c=>c.players.map(p=>p.id));
  const expectedPresidents=state.clubs.map(c=>c.presidentId);
  let realMatches=0,simulatedMatches=0;
  for(let season=0;season<2;season++) {
    while(state.phase==='inSeason') {
      const before=state.absoluteWeek;
      const controlled=Boolean(state.coach.clubId);
      playMatchday(state);
      if(controlled)realMatches++;
      assert.equal(state.absoluteWeek,before+1);
      const logs=Object.values(state.flow.resultSources);
      simulatedMatches=logs.filter(s=>s==='deterministic_uncontrolled_fixture_v1').length;
      saveGame(state,bank);
      const restored=loadGame(bank);
      assert.equal(restored.recovered,false);
      assert.deepEqual(restored.state.clubs.map(c=>c.presidentId),expectedPresidents);
      state=restored.state;
    }
    assert.equal(state.flow.stage,'season_complete');
    if(season===0) {
      const rollover=rolloverSeason(state);
      assert.equal(rollover.accepted,true);
      assert.equal(state.seasonYear,1980);
      assert.equal(state.week,1);
      saveGame(state,bank);
      state=loadGame(bank).state;
    }
  }
  assert.equal(state.history.length,1); // Last season remains pending finishSeason.
  assert.ok(realMatches>=1);
  assert.ok(simulatedMatches>0);
  assert.deepEqual(state.clubs.flatMap(c=>c.players.map(p=>p.id)),playerIds);
  assert.deepEqual(state.clubs.map(c=>c.presidentId),expectedPresidents);
  assert.equal(new Set(state.flow.history.map(x=>x.absoluteWeek)).size,state.flow.history.length);
  assert.ok(state.clubs.every(c=>c.finance.settledWeeks.length===state.flow.history.length));
  assert.ok(Object.values(state.flow.effectTransactions).every(x=>x.status==='awaiting_agent09'));
  assert.ok(state.coach.morale===undefined || state.coach.morale!==0);
});

test('R03 prevents engine results without real fulltime and invalid stage/replay',()=>{
  const s=start(59);
  const pending=prepareMatch(s);
  assert.equal(pending.accepted,true);
  assert.equal(consumeMatchResult(s,pending.engine).reason,'engine_not_fulltime');
  const corrupt=Object.values(s.leagues).flatMap(l=>l.fixtures).find(f=>f.id===pending.fixture.id);
  assert.equal(corrupt.result,null);
  assert.equal(advanceMatchday(s,{presidentCatalog:presidents}).accepted,false);
  assert.equal(MATCH_SIM_SECONDS_PER_REAL_SECOND,6);
  s.coach.gameOver={eventId:'09:death',reason:'morale_zero',date:s.gameDate};
  assert.throws(()=>prepareMatch(s),/GAME_OVER/);
  const before=JSON.stringify(s);
  assert.throws(()=>advanceMatchday(s,{presidentCatalog:presidents}),/GAME_OVER/);
  assert.equal(JSON.stringify(s),before);
});
