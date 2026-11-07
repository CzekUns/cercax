/** Native Node demonstration: complete first matchday using real 04/06/09 code.
 * The other 11 fixtures in a reduced 24-club world use a clearly labelled simulator.
 */
import {readFileSync} from 'node:fs';
import {
  newGame,listInitialOffers,acceptOffer,answerOpeningPress,prepareMatch,tickMatch,
  consumeMatchResult,answerPostMatchPress,advanceMatchday,saveGame,loadGame
} from './controller.js';
import {qaAvatar,qaMunicipalityCatalog} from './tests/qa-geography.mjs';
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const press={opening:json('../../content/press-opening.json'),
  postmatch:json('../../content/press-postmatch.json'),media:json('../../content/press-media.json')};
const presidents=json('../../content/presidents.json');
const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
const state=newGame({
 seed:1979,avatar:qaAvatar,municipalityCatalog:qaMunicipalityCatalog(),
 leagueSizes:{PROM:4,INTER:4,C2:4,C1:4,B:4,A:4}
});
// Synthetic QA geography, never advertised as reviewed real ISTAT places.
const offer=listInitialOffers(state).find(o=>state.clubs.find(c=>c.id===o.clubId)
  ?.macroRegion!==state.coach.origin.macroRegion);
if(!offer)throw Error('QA test fixture needs an out-of-macro offer');
const signed=acceptOffer(state,offer.id,{press});
if(!signed.accepted || signed.effectStatus!=='applied')
  throw Error('Real Agent09 morale must be applied: '+signed.reason);
for(const q of state.flow.press.opening.questions)
  answerOpeningPress(state,q.id,q.answers[0].id);
const prepared=prepareMatch(state);
if(!prepared.accepted)throw Error('Cannot prepare match: '+prepared.reason);
tickMatch(prepared.engine,900);
const played=consumeMatchResult(state,prepared.engine,{press});
if(!played.accepted)throw Error('Cannot record engine match: '+played.reason);
for(const q of state.flow.press.postmatch.questions)
  answerPostMatchPress(state,q.id,q.answers[0].id);
const advanced=advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:state.absoluteWeek});
if(!advanced.accepted)throw Error('Cannot advance matchday: '+advanced.reason);
const save=saveGame(state,storage);
const loaded=loadGame(storage);
if(loaded?.state?.absoluteWeek!==2)throw Error('Save/load lost week 2');
console.log(JSON.stringify({status:'HEADLESS_R03_DEMO',startYear:1979,clubId:state.coach.clubId,
  offerId:offer.id,playedFixtureId:played.fixtureId,engineScore:played.score,
  nextGameDate:loaded.state.gameDate,absoluteWeek:loaded.state.absoluteWeek,
  simulator:'other fixtures only',
  world:'SYNTHETIC_QA_ONLY_NOT_ISTAT (fictional input, never reviewed national data)',
  coachMorale:loaded.state.coach.morale,
  moraleEvents:loaded.state.coach.moraleEvents.length,
  pendingEffects:Object.values(loaded.state.flow.effectTransactions).filter(e=>e.status!=='applied').length,
  saveSequence:save.sequence},null,2));
