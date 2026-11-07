/** Native Node demonstration: complete first matchday using real 04/06/09 code.
 * The other 11 fixtures in a reduced 24-club world use a clearly labelled simulator.
 */
import {readFileSync} from 'node:fs';
import {
  newGame,listInitialOffers,acceptOffer,answerOpeningPress,prepareMatch,tickMatch,
  consumeMatchResult,answerPostMatchPress,advanceMatchday,saveGame,loadGame
} from './controller.js';
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const press={opening:json('../../content/press-opening.json'),
  postmatch:json('../../content/press-postmatch.json'),media:json('../../content/press-media.json')};
const presidents=json('../../content/presidents.json');
const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
const state=newGame({
 seed:1979,avatar:{id:'mister-demo',traits:{luck:50,leadership:60,selfEsteem:60,patience:50},
   origin:{municipalityId:null,regionId:null,macroRegion:null}},
 leagueSizes:{PROM:4,INTER:4,C2:4,C1:4,B:4,A:4}
});
const offer=listInitialOffers(state).find(o=>o.clubId!=='PROM-01');
acceptOffer(state,offer.id,{press});
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
  simulator:'other fixtures only',world:'fictional demo, no verified municipality dataset',
  coachMorale:'Agent09 effect API pending',saveSequence:save.sequence},null,2));
