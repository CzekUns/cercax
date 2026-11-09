/**
 * R10-W2-02: two complete DEFAULT-SIZED league seasons (Promozione 30 rounds,
 * other divisions 38). No 4-club override, no simulated coach matches.
 * Real Engine06, Press04, Career07, Coach09, Attributes08 on an integrated checkout.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  newGame,listInitialOffers,acceptOffer,answerOpeningPress,answerPostMatchPress,
  prepareMatch,tickMatch,consumeMatchResult,getCoachWeekStatus,getStateForUI,
  selectM1Training,advanceMatchday,rolloverSeason,saveGame,loadGame
} from '../controller.js';
import {fixturesForWeek} from '../../../systems/career/career.js';
import {qaAvatar,qaMunicipalityCatalog} from './qa-geography.mjs';

const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const press={opening:json('../../../content/press-opening.json'),
  postmatch:json('../../../content/press-postmatch.json'),
  media:json('../../../content/press-media.json')};
const presidents=json('../../../content/presidents.json');
function store(){
  const map=new Map();
  return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),
    removeItem:k=>map.delete(k)};
}
function best(q){
  return [...q.answers].sort((a,b)=>
    (b.effects?.coachMorale??0)-(a.effects?.coachMorale??0))[0].id;
}
function answerAll(state,phase){
  const session=state.flow.press[phase];
  const answer=phase==='opening'?answerOpeningPress:answerPostMatchPress;
  assert.equal(session.questions.length,phase==='opening'?5:2);
  for(const q of session.questions){
    const response=answer(state,q.id,best(q));
    assert.equal(response.accepted,true);
    assert.equal(response.effectStatus,'applied');
  }
}
function setup(seed=1979){
  const state=newGame({seed,avatar:qaAvatar,municipalityCatalog:qaMunicipalityCatalog()});
  assert.equal(state.maxWeek,38);
  assert.equal(Math.max(...state.leagues.PROM.fixtures.map(f=>f.round)),30);
  assert.ok(Object.values(state.leagues).some(l=>l.fixtures.some(f=>f.round===38)));
  assert.equal(listInitialOffers(state).length,20);
  const offer=listInitialOffers(state).find(o=>o.divisionId==='PROM');
  assert.ok(offer,'at least one regional Promozione offer');
  assert.equal(acceptOffer(state,offer.id,{press}).accepted,true);
  answerAll(state,'opening');
  assert.equal(state.flow.stage,'hub');
  return state;
}
const payroll=s=>s.clubs.map(c=>c.finance?.settledWeeks?.length);

test('R10-W2-02: standard 30/38 fixtures, 1979-1981, 76 weeks, full save/retry',()=>{
  let state=setup(),played=0,byes=0;
  const bank=store(),seasonCounts=[];
  for(const season of [1979,1980]){
    assert.equal(state.seasonYear,season);
    let seasonGames=0,seasonByes=0,rounds=0;
    while(state.phase==='inSeason'){
      const week=state.week,period=state.absoluteWeek;
      assert.equal(week,++rounds);
      const status=getCoachWeekStatus(state);
      assert.deepEqual(getStateForUI(state).coachWeekStatus,status);
      assert.equal(status.absoluteWeek,period);
      const ownedFixture=fixturesForWeek(state).find(f=>f.homeId===state.coach.clubId||
        f.awayId===state.coach.clubId);
      const priorFinance=payroll(state);
      const priorEffects=JSON.stringify(state.coach.moraleEvents);
      const priorResults=JSON.stringify(state.flow.resultSources);
      const priorHistory=state.flow.history.length;
      const priorTraining=state.flow.m1.training.appliedWeeks.length;
      if(state.coach.clubId){
        const plan=selectM1Training(state,{
          plan:week%2?'technical':'rest',intensity:week%2?50:20,
          expectedAbsoluteWeek:period
        });
        assert.equal(plan.accepted,true);
      }
      if(ownedFixture){
        assert.equal(status.kind,'match_pending');
        assert.equal(status.canAdvance,false);
        assert.equal(advanceMatchday(state,{presidentCatalog:presidents,
          expectedAbsoluteWeek:period}).reason,'coach_match_not_recorded');
        const prepared=prepareMatch(state);
        assert.equal(prepared.accepted,true);
        assert.equal(tickMatch(prepared.engine,900).phase,'fulltime');
        const consumed=consumeMatchResult(state,prepared.engine,{press});
        assert.equal(consumed.accepted,true);
        assert.equal(consumed.fixtureId,ownedFixture.id);
        assert.equal(state.flow.resultSources[ownedFixture.id],'match_engine_06');
        answerAll(state,'postmatch');
        assert.equal(getCoachWeekStatus(state).kind,'match_recorded');
        played++;seasonGames++;
      } else if(state.coach.clubId){
        assert.equal(status.kind,'bye_week');
        assert.equal(status.canAdvance,true);
        const refused=prepareMatch(state);
        assert.equal(refused.reason,'bye_week');
        assert.equal(refused.expectedAbsoluteWeek,period);
        assert.equal(advanceMatchday(state,{presidentCatalog:presidents}).reason,
          'expected_week_required_when_bye');
        assert.equal(state.flow.press.postmatch,null);
        assert.equal(JSON.stringify(state.coach.moraleEvents),priorEffects);
        assert.equal(JSON.stringify(state.flow.resultSources),priorResults);
        seasonByes++;byes++;
      } else {
        assert.equal(status.kind,'unemployed');
        assert.equal(advanceMatchday(state,{presidentCatalog:presidents}).reason,
          'expected_week_required_when_unemployed');
      }
      const result=advanceMatchday(state,{presidentCatalog:presidents,
        expectedAbsoluteWeek:period});
      assert.equal(result.accepted,true);
      assert.equal(result.completedAbsoluteWeek,period);
      assert.equal(result.weekType,ownedFixture?'played_match':
        status.kind==='bye_week'?'bye_week':'unemployed');
      if(status.kind==='bye_week'){
        assert.equal(result.playedFixtureId,null);
        assert.equal(state.flow.history.at(-1).playedFixtureId,null);
        assert.equal(state.flow.history.at(-1).weekType,'bye_week');
        assert.equal(state.flow.press.postmatch,null);
        assert.equal(JSON.stringify(state.coach.moraleEvents),priorEffects);
      }
      assert.equal(state.absoluteWeek,period+1);
      assert.equal(state.flow.history.length,priorHistory+1);
      if(status.kind!=='unemployed')
        assert.equal(state.flow.m1.training.appliedWeeks.length,priorTraining+1);
      assert.equal(new Set(state.flow.m1.training.appliedWeeks).size,
        state.flow.m1.training.appliedWeeks.length);
      assert.ok(state.clubs.every(c=>c.finance.settledWeeks.includes('a:'+period)));
      assert.ok(payroll(state).every((count,i)=>count===priorFinance[i]+1));
      const savedJSON=JSON.stringify(state);
      assert.equal(advanceMatchday(state,{presidentCatalog:presidents,
        expectedAbsoluteWeek:period}).reason,'stale_week_action');
      assert.equal(JSON.stringify(state),savedJSON);
      saveGame(state,bank);
      const loaded=loadGame(bank);
      assert.equal(loaded.recovered,false);
      assert.deepEqual(loaded.state,state);
      state=loaded.state;
    }
    assert.equal(rounds,38);
    assert.equal(state.flow.stage,'season_complete');
    assert.equal(getCoachWeekStatus(state).kind,'season_complete');
    assert.ok(Object.values(state.leagues).every(l=>l.fixtures.every(f=>f.result)));
    if(season===1979){
      assert.equal(seasonGames,30,'Promozione has 30 actual matches');
      assert.equal(seasonByes,8,'Promozione must have byes 31..38');
    }
    seasonCounts.push({season,rounds,seasonGames,seasonByes});
    assert.equal(rolloverSeason(state).accepted,true);
    assert.equal(state.seasonYear,season+1);
    assert.equal(state.week,1);
    assert.equal(state.flow.m1.seasonDevelopments.filter(y=>y===season).length,1);
    const prev=JSON.stringify(state);
    assert.equal(rolloverSeason(state).reason,'season_not_complete');
    assert.equal(JSON.stringify(state),prev);
    saveGame(state,bank);
    state=loadGame(bank).state;
  }
  assert.equal(state.seasonYear,1981);
  assert.equal(state.history.length,2);
  assert.equal(state.flow.history.length,76);
  assert.ok(played>=30);
  assert.ok(byes>=8);
  assert.deepEqual(seasonCounts.map(x=>x.rounds),[38,38]);
});

test('R10-W2-02: match-pending cannot be skipped, game-over remains terminal',()=>{
  const s=setup(1979),period=s.absoluteWeek;
  assert.equal(getCoachWeekStatus(s).kind,'match_pending');
  const before=JSON.stringify(s);
  assert.equal(advanceMatchday(s,{presidentCatalog:presidents,
    expectedAbsoluteWeek:period}).reason,'coach_match_not_recorded');
  assert.equal(JSON.stringify(s),before);
  s.coach.morale=0;
  s.coach.gameOver={eventId:'qa:terminal',reason:'morale_zero',date:s.gameDate};
  const terminal=JSON.stringify(s);
  assert.throws(()=>advanceMatchday(s,{presidentCatalog:presidents,
    expectedAbsoluteWeek:period}),/GAME_OVER/);
  assert.throws(()=>prepareMatch(s),/GAME_OVER/);
  assert.equal(JSON.stringify(s),terminal);
});
