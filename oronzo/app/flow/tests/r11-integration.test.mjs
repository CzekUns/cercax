import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {newGame,acceptOffer,listInitialOffers,answerOpeningPress,answerPostMatchPress,
 prepareMatch,tickMatch,consumeMatchResult,advanceMatchday,rolloverSeason,
 getCoachWeekStatus,selectM1Training,commandM1Match} from '../controller.js';
import {initializeCareerVenues,CAREER_STADIUM_POLICY_R11,changeCareerTicketPrice,
 requestCareerPresident,decideCareerPresident,getCareerMarketWindow,
 careerMarketOperation,careerSaleOperation,listCareerMarketCandidates}
 from '../management-r11.js';
import {createDurableSaveManager} from '../durable-save.js';
import {serialize,deserialize} from '../../../systems/career/save.js';
import {BUILTIN_SURNAME_CATALOG} from '../../../systems/attributes/surnames.js';
import {qaAvatar,qaMunicipalityCatalog} from './qa-geography.mjs';

const json=relative=>JSON.parse(readFileSync(new URL(relative,import.meta.url),'utf8'));
const presidents=json('../../../content/presidents.json');
const press={opening:json('../../../content/press-opening.json'),
 postmatch:json('../../../content/press-postmatch.json'),
 media:json('../../../content/press-media.json')};
const small={PROM:4,INTER:4,C2:4,C1:4,B:4,A:4};
function setup(seed=1979,{standard=false,sourced=true}={}){
 const state=newGame({seed,avatar:qaAvatar,municipalityCatalog:qaMunicipalityCatalog(),
  ...(standard?{}:{leagueSizes:small}),
  ...(sourced?{surnameCatalog:BUILTIN_SURNAME_CATALOG}:{})});
 const offer=listInitialOffers(state).find(o=>o.divisionId==='PROM')||listInitialOffers(state)[0];
 assert.ok(offer);
 const hired=acceptOffer(state,offer.id,{press});assert.equal(hired.accepted,true);
 for(const q of state.flow.press.opening.questions)
  assert.equal(answerOpeningPress(state,q.id,q.answers[0].id,{press}).accepted,true);
 assert.equal(state.flow.stage,'hub');
 return state;
}
function playOne(state){
 const status=getCoachWeekStatus(state),period=state.absoluteWeek;
 if(status.kind==='bye_week'){
  const result=advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:period});
  assert.equal(result.accepted,true);assert.equal(result.weekType,'bye_week');
  assert.equal(result.playedFixtureId,null);
  assert.equal(advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:period}).reason,'stale_week_action');
  return 'bye';
 }
 assert.equal(status.kind,'match_pending');
 const p=prepareMatch(state);assert.equal(p.accepted,true);
 tickMatch(p.engine,900);assert.equal(p.engine.isFinished(),true);
 assert.equal(consumeMatchResult(state,p.engine,{press}).accepted,true);
 for(const q of state.flow.press.postmatch.questions)
  assert.equal(answerPostMatchPress(state,q.id,q.answers[0].id,{press}).accepted,true);
 const out=advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:period});
 assert.equal(out.accepted,true);assert.equal(out.weekType,'played_match');
 return 'match';
}
test('U3: stadium provenance is synthetic game policy, not invented history',()=>{
 const state=newGame({seed:1979,avatar:qaAvatar,municipalityCatalog:qaMunicipalityCatalog(),leagueSizes:small});
 assert.ok(state.clubs.every(c=>c.stadium?.capacity>0));
 assert.equal(state.clubs[0].stadium.provenance,CAREER_STADIUM_POLICY_R11.source);
 assert.equal(initializeCareerVenues(state).accepted,true); // no replacement of existing state
 assert.equal(state.clubs[0].stadium.ticketPriceITL,900);
});
test('U6: traced surnames bind to canonical roster and survive state clone',()=>{
 const s=setup(1979);
 assert.ok(s.flow.m1.playerDataset.recordCount>=600);
 const members=s.clubs.flatMap(c=>c.players),ids=members.map(p=>p.id);
 assert.ok(members.every(p=>p.surnameId&&p.surnameSourceId));
 assert.deepEqual(JSON.parse(JSON.stringify(s)).clubs.flatMap(c=>c.players.map(p=>p.id)),ids);
});
test('U3: ticket uses real 09 president, one change per period and no phantom income',()=>{
 const s=setup(912),club=s.clubs.find(c=>c.id===s.coach.clubId),before=club.finance.cash;
 const period=s.absoluteWeek;
 const result=changeCareerTicketPrice(s,{presidentCatalog:presidents,clubId:club.id,
  priceITL:10000,eventId:'ticket-test:912',expectedAbsoluteWeek:period});
 assert.equal(result.accepted,true);
 assert.equal(s.clubs.find(c=>c.id===club.id).finance.cash,before);
 assert.equal(changeCareerTicketPrice(s,{presidentCatalog:presidents,clubId:club.id,
  priceITL:9000,eventId:'ticket-test:912',expectedAbsoluteWeek:period}).accepted,false);
});
test('U4: real president request decision persists whether approved or rejected',()=>{
 const s=setup(913),period=s.absoluteWeek;
 const x=requestCareerPresident(s,{presidentCatalog:presidents,
  requestId:'r11-training:913',kind:'training_facilities',amountITL:100000,
  expectedAbsoluteWeek:period});
 assert.equal(x.accepted,true);
 const y=decideCareerPresident(s,{presidentCatalog:presidents,
  requestId:'r11-training:913',expectedAbsoluteWeek:period});
 assert.equal(y.accepted,true);
 assert.ok(['approved','rejected'].includes(s.clubs.find(c=>c.id===s.coach.clubId)
  .management.requests.find(r=>r.id==='r11-training:913').status));
 assert.equal(decideCareerPresident(s,{presidentCatalog:presidents,
  requestId:'r11-training:913',expectedAbsoluteWeek:period}).reason,'already_decided');
});
test('U4: transfer requires gameplay window and verified president mandate',()=>{
 const s=setup(914),candidate=listCareerMarketCandidates(s)[0];
 assert.ok(candidate);
 assert.equal(getCareerMarketWindow(s).open,true);
 const denied=careerMarketOperation(s,{presidentCatalog:presidents,action:'request',
  requestId:'no-mandate',sellerClubId:candidate.clubId,playerId:candidate.playerId,
  mandateId:'unapproved',feeITL:1000,weeklyWage:1000,expectedAbsoluteWeek:s.absoluteWeek});
 assert.equal(denied.accepted,false);
 assert.equal(denied.reason,'approved_market_mandate_required');
 s.week=12;
 assert.equal(getCareerMarketWindow(s).open,false);
 assert.equal(careerSaleOperation(s,{presidentCatalog:presidents,action:'request',
  requestId:'outside-window',playerId:s.clubs.find(c=>c.id===s.coach.clubId).players[0].id,
  feeITL:1000,expectedAbsoluteWeek:s.absoluteWeek}).reason,'market_window_closed');
});
test('U5: accepted individual shout is reconciled once into player trust',()=>{
 const s=setup(915),club=s.clubs.find(c=>c.id===s.coach.clubId),
  before=Object.fromEntries(club.players.map(p=>[p.id,p.relationships.coachTrust]));
 const prep=prepareMatch(s);assert.equal(prep.accepted,true);
 const my=prep.matchInput.homeClub.id===club.id?prep.matchInput.homeXI:prep.matchInput.awayXI;
 const playerId=my.find(id=>!club.players.find(p=>p.id===id).positions.includes('GK'));
 const shout=commandM1Match(s,prep.engine,{type:'individualShout',
  targetPlayerId:playerId,tone:'encourage',requestId:'trust:915'});
 assert.equal(shout.accepted,true);
 tickMatch(prep.engine,900);
 assert.equal(consumeMatchResult(s,prep.engine,{press}).accepted,true);
 const records=Object.values(s.flow.m1.persistentEvents);
 assert.equal(records.length,1);
 assert.equal(records[0].status,'applied');
 const trust=s.clubs.find(c=>c.id===club.id).players.find(p=>p.id===playerId).relationships.coachTrust;
 const delta=records[0].event.detail.persistentSuggestion.playerTrustDelta;
 assert.equal(trust,Math.min(100,Math.max(0,before[playerId]+delta)));
 assert.equal(Object.keys(s.clubs.find(c=>c.id===club.id).management.shouts).length,1);
});
test('U1: five live plans 0/100, no effect before advance',()=>{
 for(const plan of ['technical','athletic','tactical','balanced','rest']){
  const state=setup(920);
  const club=state.clubs.find(c=>c.id===state.coach.clubId);
  const before=club.players.map(p=>p.status.fatigue);
  const result=selectM1Training(state,{plan,intensity:plan==='rest'?0:100,
   expectedAbsoluteWeek:state.absoluteWeek});
  assert.equal(result.accepted,true);
  assert.deepEqual(club.players.map(p=>p.status.fatigue),before);
  assert.equal(selectM1Training(state,{plan,intensity:75,expectedAbsoluteWeek:state.absoluteWeek}).reason,'already_planned');
 }
});

test('U2: two 4MB recoverable verified IndexedDB copies and read-only legacy migration',async t=>{
 let IDBFactory;
 try{({IDBFactory}=await import('fake-indexeddb'));}catch{t.skip('optional fake-indexeddb not installed; Chromium native quota test required');return}
 const indexedDB=new IDBFactory();
 const local=new Map(),storage={getItem:k=>local.get(k)??null,setItem:(k,v)=>local.set(k,v),
  removeItem:k=>local.delete(k)};
 const {createSaveManager}=await import('../../../systems/career/save.js');
 const state=setup(930);
 // Valid career with a large data field, tests real serialization/checksum without a mocked quota.
 state.flow.qaLargeHistory='x'.repeat(4200000);
 const old=createSaveManager(storage,'oronzo.career.flow.r03');
 old.save(state);const legacyA=storage.getItem('oronzo.career.flow.r03:A');
 const manager=createDurableSaveManager({indexedDB,legacyStorage:storage});
 const initial=await manager.load();
 assert.equal(initial.provider,'localstorage_legacy');
 assert.equal(initial.state.flow.qaLargeHistory.length,4200000);
 const first=await manager.save(state);
 assert.equal(first.verified,true);
 state.absoluteWeek+=1;state.week+=1;
 const second=await manager.save(state);
 assert.equal(second.sequence,first.sequence+1);
 const diagnostic=await manager.inspect();
 assert.equal(diagnostic.A.valid,true);assert.equal(diagnostic.B.valid,true);
 const loaded=await manager.load();
 assert.equal(loaded.provider,'indexeddb');assert.equal(loaded.state.absoluteWeek,state.absoluteWeek);
 assert.equal(storage.getItem('oronzo.career.flow.r03:A'),legacyA,
  'legacy backup is never deleted or modified during IDB upgrade');
 // Reject an unavailable/denied provider without deleting the existing good DB.
 const denied=createDurableSaveManager({indexedDB:{open(){throw new Error('QuotaExceededError')}}});
 await assert.rejects(denied.save(state),/QuotaExceededError/);
 assert.equal((await manager.load()).state.absoluteWeek,state.absoluteWeek);
});
test('U8: two standard seasons, 30 coach fixtures + bye weeks 31–38 and checksum reload', {timeout:240000},()=>{
 const state=setup(1979,{standard:true});
 const originalClub=state.coach.clubId;
 let checks=0;
 for(let season=0;season<2;season++){
  let matches=0,byes=0;
  while(state.phase==='inSeason'){
   const wk=state.week;
   const event=playOne(state);if(event==='bye'){byes++;assert.ok(wk>=31&&wk<=38);}
   else matches++;
   if(state.week===31 || state.phase==='seasonComplete'){
    const restored=deserialize(serialize(state));
    assert.deepEqual(restored.flow.m1,state.flow.m1);
    checks++;
   }
  }
  assert.equal(matches,30);
  assert.equal(byes,8);
  assert.equal(state.flow.history.filter(x=>x.seasonYear===1979+season&&x.weekType==='bye_week').length,8);
  // Both files are genuine final states after 30 played fixtures and bye 31–38;
  // Chromium uses them to test two native IndexedDB slots at browser quota.
  mkdirSync('r11-screenshots',{recursive:true});
  writeFileSync('r11-screenshots/standard-'+(season===0?'one':'two')+'-season.json',serialize(state));
  if(season===0){
   const rolled=rolloverSeason(state);assert.equal(rolled.accepted,true);
   assert.equal(state.seasonYear,1980);
   assert.equal(state.phase,'inSeason');
  }
 }
 const next=rolloverSeason(state);
 assert.equal(next.accepted,true);
 assert.equal(state.seasonYear,1981); // 1979→1980→1981 after two complete seasons.
 assert.equal(state.phase,'inSeason');
 assert.ok(checks>=4);
 assert.ok(state.clubs.some(x=>x.id===originalClub));
});
