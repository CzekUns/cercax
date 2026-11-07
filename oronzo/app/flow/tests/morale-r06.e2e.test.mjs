import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  newGame,acceptOffer,listInitialOffers,answerOpeningPress,answerPostMatchPress,
  prepareMatch,tickMatch,consumeMatchResult,advanceMatchday,rolloverSeason,
  getStateForUI,saveGame,loadGame,exportGame,importGame
} from '../controller.js';
import {newCareer} from '../../../systems/career/career.js';
import {serialize} from '../../../systems/career/save.js';
import {
  createCoach,previewOfferMorale,applyOfferEffect,applyPressEffect,
  applyCoachMoraleEvent,endClubWeek
} from '../../../systems/coach-club/index.js';
import {qaAvatar,qaMunicipalityCatalog} from './qa-geography.mjs';

const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const press={opening:json('../../../content/press-opening.json'),
  postmatch:json('../../../content/press-postmatch.json'),
  media:json('../../../content/press-media.json')};
const presidents=json('../../../content/presidents.json');
const sizes={PROM:4,INTER:4,C2:4,C1:4,B:4,A:4};
const memory=()=>{const map=new Map();return{
  getItem:key=>map.get(key)??null,setItem:(key,val)=>map.set(key,val),
  removeItem:key=>map.delete(key),map
};};
const create=seed=>newGame({
  seed,avatar:qaAvatar,leagueSizes:sizes,municipalityCatalog:qaMunicipalityCatalog()
});
const maxAnswer=question=>question.answers.slice().sort((a,b)=>
  (b.effects.coachMorale??0)-(a.effects.coachMorale??0))[0];
function signAndOpen(state) {
  const offers=listInitialOffers(state);
  const offer=offers.find(o=>state.clubs.find(c=>c.id===o.clubId)
    ?.macroRegion!==state.coach.origin.macroRegion);
  assert.ok(offer,'fixture should contain an out-of-macro offer');
  const before=state.coach.morale;
  const forecast=previewOfferMorale(state.coach,offer,state.clubs.find(c=>c.id===offer.clubId));
  assert.ok(forecast.finalMoraleDelta<0);
  const accepted=acceptOffer(state,offer.id,{press});
  assert.equal(accepted.accepted,true);
  assert.equal(accepted.effectStatus,'applied');
  assert.equal(state.coach.morale,before+forecast.finalMoraleDelta);
  assert.equal(state.coach.moraleEvents.length,1);
  assert.equal(state.flow.effectTransactions['offer-morale:'+offer.id].status,'applied');
  assert.equal(state.flow.press.opening.questions.length,5);
  assert.equal(acceptOffer(state,offer.id).reason,'already_accepted');
  return offer;
}
function completeOpening(state) {
  for(const q of state.flow.press.opening.questions) {
    const chosen=maxAnswer(q);
    const count=state.coach.moraleEvents.length;
    const response=answerOpeningPress(state,q.id,chosen.id);
    assert.equal(response.accepted,true);
    assert.equal(response.effectStatus,'applied');
    assert.equal(state.coach.moraleEvents.length,count+1);
    const before=JSON.stringify(state);
    assert.equal(answerOpeningPress(state,q.id,chosen.id).accepted,false);
    assert.equal(JSON.stringify(state),before);
  }
  assert.equal(state.flow.stage,'hub');
}
function playOne(state) {
  if(state.flow.stage==='unemployed') {
    const period=state.absoluteWeek;
    assert.equal(advanceMatchday(state,{presidentCatalog:presidents,
      expectedAbsoluteWeek:period}).accepted,true);
    return {played:false};
  }
  const prepared=prepareMatch(state);
  assert.equal(prepared.accepted,true);
  assert.equal(prepared.engine.isFinished(),false);
  const tick=tickMatch(prepared.engine,900);
  assert.equal(tick.phase,'fulltime');
  assert.equal(prepared.engine.isFinished(),true);
  const result=consumeMatchResult(state,prepared.engine,{press});
  assert.equal(result.accepted,true);
  assert.equal(result.source,'match_engine_06');
  assert.deepEqual(state.leagues[prepared.fixture.divisionId].fixtures
    .find(f=>f.id===prepared.fixture.id).result.score,result.score);
  assert.equal(state.flow.press.postmatch.questions.length,2);
  const beforeEvents=state.coach.moraleEvents.length;
  for(const q of state.flow.press.postmatch.questions) {
    const answer=answerPostMatchPress(state,q.id,maxAnswer(q).id);
    assert.equal(answer.accepted,true);
    assert.equal(answer.effectStatus,'applied');
  }
  assert.equal(state.coach.moraleEvents.length,beforeEvents+2);
  const period=state.absoluteWeek;
  const advanced=advanceMatchday(state,{presidentCatalog:presidents,
    expectedAbsoluteWeek:period});
  assert.equal(advanced.accepted,true);
  assert.equal(advanceMatchday(state,{presidentCatalog:presidents,
    expectedAbsoluteWeek:period}).reason,'stale_week_action');
  return {played:true,result,period};
}

test('R06-2 no geography blocks signing with explicit reason and zero mutation',()=>{
  const state=newGame({seed:191,avatar:{
    id:'r06',traits:{luck:40,leadership:80,selfEsteem:50,patience:80},
    origin:{regionId:'campania',macroRegion:'sud'}
  }});
  assert.equal(state.coach.morale,50);
  assert.equal(state.world.mode,'demo');
  assert.equal(state.flow.effectsMode,'integrated');
  assert.equal(listInitialOffers(state).length,20);
  const before=JSON.stringify(state);
  const result=acceptOffer(state,state.flow.initialOffers[0].id,{press});
  assert.equal(result.accepted,false);
  assert.equal(result.reason,'geography_required');
  assert.equal(result.messageKey,'oronzo.geography_required');
  assert.ok(result.missing.includes('club.regionId'));
  assert.equal(JSON.stringify(state),before);
  assert.equal(state.coach.clubId,null);
  assert.equal(state.coach.moraleEvents.length,0);
  assert.equal(Object.keys(state.flow.effectTransactions).length,0);
  const saved=importGame(exportGame(state));
  assert.equal(acceptOffer(saved,saved.flow.initialOffers[0].id).reason,'geography_required');
  assert.deepEqual(saved.flow.initialOffers,state.flow.initialOffers);
});

test('R06-2 validated synthetic fixture has traceable regions; errors are atomic',()=>{
  const state=create(319);
  assert.equal(state.world.mode,'qa_fixture');
  assert.equal(state.world.datasetStatus,'synthetic_test_only');
  assert.equal(state.coach.origin.macroRegion,'south'); // canonical "sud" input mapping.
  assert.ok(state.clubs.every(c=>['south','north'].includes(c.macroRegion)));
  assert.ok(state.clubs.every(c=>c.municipalityId));
  const initial=JSON.stringify(state);
  const offer=listInitialOffers(state)[0];
  assert.throws(()=>acceptOffer(state,offer.id,{press:{
    opening:{questions:[]},media:press.media
  }}),/not enough eligible distinct questions/);
  assert.equal(JSON.stringify(state),initial,'failed press factory must not commit offer/morale');
  signAndOpen(state);
  assert.equal(state.flow.stage,'opening_press');
  assert.ok(state.coach.moraleEvents.length===1);
});

test('R06-1+R06-3 one real 1979 E2E: Agent09 morale, Copy04, Match06, finance, save/retry',()=>{
  let state=create(714);
  const initialCoach=createCoach(state.coach);
  assert.equal(initialCoach.morale,50);
  assert.deepEqual(Object.keys(initialCoach.relationships).sort(),
    ['board','fans','media','playerTrustById','squad'].sort());
  const offer=signAndOpen(state);
  const store=memory();
  saveGame(state,store);
  state=loadGame(store).state;
  assert.equal(state.coach.moraleEvents[0].eventId,'offer-morale:'+offer.id);
  completeOpening(state);
  assert.equal(state.coach.moraleEvents.length,6);
  assert.ok(Object.values(state.flow.effectTransactions).every(e=>e.status==='applied'));
  const coachBeforeMatch=state.coach.morale;
  const played=playOne(state);
  assert.equal(played.played,true);
  assert.equal(state.absoluteWeek,2);
  assert.equal(state.flow.stage,'hub');
  assert.equal(state.flow.resultSources[played.result.fixtureId],'match_engine_06');
  assert.equal(state.coach.moraleEvents.length,8);
  assert.ok(state.coach.morale>=0&&state.coach.morale<=100);
  assert.ok(Number.isInteger(coachBeforeMatch));
  assert.deepEqual(getStateForUI(state).pendingEffectTransactions,[]);
  for(const event of state.coach.moraleEvents)
    assert.equal(state.flow.effectTransactions[event.eventId].status,'applied');
  assert.ok(state.clubs.every(c=>c.finance.settledWeeks.includes('a:1')));
  const paid=state.clubs.find(c=>c.id===state.coach.clubId);
  const retry=endClubWeek(paid,{week:1,absoluteWeek:1,seasonYear:1979});
  assert.equal(retry.accepted,false);
  assert.equal(retry.reason,'week_already_settled');
  saveGame(state,store);
  const loaded=loadGame(store);
  assert.equal(loaded.legacy,false);
  assert.deepEqual(loaded.state.coach.moraleEvents,state.coach.moraleEvents);
  assert.deepEqual(loaded.state.flow.effectTransactions,state.flow.effectTransactions);
  assert.equal(loaded.state.absoluteWeek,2);
  assert.equal(acceptOffer(loaded.state,offer.id).reason,'already_accepted');
  assert.deepEqual(importGame(exportGame(loaded.state)),loaded.state);
  assert.equal(previewOfferMorale(initialCoach,offer,paid).finalMoraleDelta,
    state.coach.moraleEvents[0].requestedMoraleDelta);
  assert.equal(applyOfferEffect({eventId:'offer-morale:'+offer.id,coach:loaded.state.coach,
    offer,club:paid}).reason,'already_applied');
  const pressEvent=loaded.state.coach.moraleEvents.find(e=>e.kind==='press');
  assert.ok(pressEvent);
  assert.equal(applyPressEffect({eventId:pressEvent.eventId,coach:loaded.state.coach,
    semanticEffects:loaded.state.flow.effectTransactions[pressEvent.eventId].semanticEffects})
    .reason,'already_applied');
});

test('R06-3 game-over zero persists and prevents all flow progress/recovery',()=>{
  const state=create(941);
  signAndOpen(state);
  const before=state.coach.morale;
  const terminal=applyCoachMoraleEvent(state.coach,{
    eventId:'qa:terminal:decision',reason:'qa_deterministic_morale_test',
    moraleDelta:-100,date:state.gameDate
  });
  assert.equal(terminal.accepted,true);
  assert.equal(terminal.coach.morale,0);
  assert.equal(terminal.coach.gameOver.reason,'morale_zero');
  state.coach=terminal.coach;
  const bank=memory();
  saveGame(state,bank);
  const restored=loadGame(bank).state;
  assert.equal(restored.coach.morale,0);
  assert.deepEqual(restored.coach.gameOver,state.coach.gameOver);
  assert.equal(applyCoachMoraleEvent(restored.coach,{
    eventId:'qa:terminal:decision',moraleDelta:-100}).reason,'already_applied');
  assert.equal(applyCoachMoraleEvent(restored.coach,{
    eventId:'qa:rescue:invalid',moraleDelta:50}).reason,'game_over');
  const frozen=JSON.stringify(restored);
  assert.throws(()=>answerOpeningPress(restored,'any','any'),/GAME_OVER/);
  assert.throws(()=>advanceMatchday(restored,{presidentCatalog:presidents}),/GAME_OVER/);
  assert.throws(()=>prepareMatch(restored),/GAME_OVER/);
  assert.equal(JSON.stringify(restored),frozen);
  assert.ok(before>0);
});

test('R06-3 two seasons with true 06+09 processing, save/reload and 1985 legacy',()=>{
  let s=create(106);
  signAndOpen(s);
  completeOpening(s);
  const bank=memory(),firstIds=s.clubs.flatMap(c=>c.players.map(p=>p.id));
  const presidentsAtStart=s.clubs.map(c=>c.presidentId);
  let realMatches=0;
  for(let y=0;y<2;y++) {
    while(s.phase==='inSeason') {
      const before=s.absoluteWeek;
      const one=playOne(s);
      realMatches+=Number(one.played);
      assert.equal(s.absoluteWeek,before+1);
      saveGame(s,bank);
      s=loadGame(bank).state;
    }
    if(y===0) {
      const ended=s.absoluteWeek;
      assert.equal(rolloverSeason(s).accepted,true);
      assert.equal(s.seasonYear,1980);
      assert.ok(s.absoluteWeek>ended);
      saveGame(s,bank);
      s=loadGame(bank).state;
    }
  }
  assert.ok(realMatches>0);
  assert.equal(s.seasonYear,1980);
  assert.equal(s.flow.stage,'season_complete');
  assert.equal(new Set(s.flow.history.map(x=>x.absoluteWeek)).size,s.flow.history.length);
  assert.deepEqual(s.clubs.flatMap(c=>c.players.map(p=>p.id)),firstIds);
  assert.deepEqual(s.clubs.map(c=>c.presidentId),presidentsAtStart);
  assert.ok(s.clubs.every(c=>c.finance.settledWeeks.length===s.flow.history.length));
  assert.ok(Object.values(s.flow.effectTransactions).every(x=>x.status==='applied'));
  const legacy=newCareer({leagueSizes:sizes},109);
  assert.equal(legacy.seasonYear,1985);
  const oldBank=memory();oldBank.setItem('oronzo.career.v2:A',serialize(legacy));
  oldBank.setItem('oronzo.career.v2:active','A');
  const loaded=loadGame(oldBank);
  assert.equal(loaded.legacy,true);
  assert.equal(loaded.state.seasonYear,1985);
  assert.equal(loaded.state.week,1);
});
