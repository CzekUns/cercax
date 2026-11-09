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

test('U4: actual approved transfer debits buyer, credits seller, moves player once and survives save/load',()=>{
 let chosen=null;
 for(let seed=960;seed<1030;seed++){
  const state=setup(seed),id='market-mandate:'+seed;
  const proposed=requestCareerPresident(state,{presidentCatalog:presidents,
   requestId:id,kind:'market_mandate',amountITL:5000,
   expectedAbsoluteWeek:state.absoluteWeek});
  if(!proposed.accepted)continue;
  const voted=decideCareerPresident(state,{presidentCatalog:presidents,
   requestId:id,expectedAbsoluteWeek:state.absoluteWeek});
  if(voted.accepted&&voted.approved){chosen={state,mandateId:id,seed};break}
 }
 assert.ok(chosen,'at least one authentic 09 president must approve a modest mandate');
 const {state,mandateId,seed}=chosen;
 const buyer=state.clubs.find(c=>c.id===state.coach.clubId);
 const seller=state.clubs.find(c=>c.id!==buyer.id&&c.divisionId===buyer.divisionId);
 assert.ok(seller,'real source club');
 const player=seller.players.slice().sort((a,b)=>a.contract.weeklyWage-b.contract.weeklyWage)[0];
 const room=buyer.wageBudget-buyer.players.reduce((sum,x)=>sum+x.contract.weeklyWage,0);
 const weeklyWage=Math.max(0,Math.min(1000,room));
 const ctx={presidentCatalog:presidents,expectedAbsoluteWeek:state.absoluteWeek};
 const cashBuyer=buyer.finance.cash,cashSeller=seller.finance.cash;
 let approved=null;
 for(let i=0;i<35;i++){
  const requestId='r11-purchase:'+seed+':'+i;
  const ask=careerMarketOperation(state,{...ctx,action:'request',requestId,
   sellerClubId:seller.id,playerId:player.id,feeITL:1000,weeklyWage,mandateId});
  assert.equal(ask.accepted,true,ask.reason);
  const review=careerMarketOperation(state,{...ctx,action:'review',requestId});
  if(review.accepted&&review.approved){approved=requestId;break}
 }
 assert.ok(approved,'at least one deterministic board/director approval must succeed');
 const negotiation=careerMarketOperation(state,{...ctx,action:'negotiate',
  requestId:approved,feeITL:1000,weeklyWage,sellerAccepts:true});
 assert.equal(negotiation.accepted,true,negotiation.reason);
 const signed=careerMarketOperation(state,{...ctx,action:'finalize',requestId:approved});
 assert.equal(signed.accepted,true,signed.reason);
 const afterBuyer=state.clubs.find(c=>c.id===buyer.id),afterSeller=state.clubs.find(c=>c.id===seller.id);
 assert.equal(afterBuyer.players.filter(p=>p.id===player.id).length,1);
 assert.equal(afterSeller.players.filter(p=>p.id===player.id).length,0);
 assert.equal(afterBuyer.players.find(p=>p.id===player.id).teamId,buyer.id);
 assert.equal(afterBuyer.players.find(p=>p.id===player.id).contract.weeklyWage,weeklyWage);
 assert.equal(afterBuyer.finance.cash,cashBuyer-1000);
 assert.equal(afterSeller.finance.cash,cashSeller+1000);
 assert.equal(afterBuyer.management.requests.find(r=>r.id===mandateId).status,'spent');
 const checkpoint=JSON.stringify(state);
 const duplicate=careerMarketOperation(state,{...ctx,action:'finalize',requestId:approved});
 assert.equal(duplicate.accepted,false);
 assert.equal(JSON.stringify(state),checkpoint,'retry may not double debit or duplicate the roster');
 const restored=deserialize(serialize(state));
 assert.deepEqual(restored.clubs.find(c=>c.id===buyer.id).players.map(p=>p.id),
  afterBuyer.players.map(p=>p.id));
});
test('U4: approved sale moves a real player to a distinct club and books both sides',()=>{
 let found=null;
 for(let seed=1100;seed<1130;seed++){
  const s=setup(seed),club=s.clubs.find(c=>c.id===s.coach.clubId);
  const wanted=club.players.find(p=>!p.positions.includes('GK'));
  const buyer=s.clubs.find(c=>c.id!==club.id&&c.divisionId===club.divisionId);
  if(!wanted||!buyer)continue;
  const ctx={presidentCatalog:presidents,expectedAbsoluteWeek:s.absoluteWeek};
  for(let i=0;i<35;i++){
   const id='r11-sale:'+seed+':'+i;
   const request=careerSaleOperation(s,{...ctx,action:'request',requestId:id,
    playerId:wanted.id,feeITL:1000});
   assert.equal(request.accepted,true,request.reason);
   const decision=careerSaleOperation(s,{...ctx,action:'review',requestId:id});
   if(decision.accepted&&decision.approved){found={s,ctx,clubId:club.id,buyerId:buyer.id,
     playerId:wanted.id,requestId:id};break}
  }
  if(found)break;
 }
 assert.ok(found,'a real president must eventually authorize a sale');
 const {s,ctx,clubId,buyerId,playerId,requestId}=found;
 const beforeSeller=s.clubs.find(c=>c.id===clubId).finance.cash;
 const beforeBuyer=s.clubs.find(c=>c.id===buyerId).finance.cash;
 const out=careerSaleOperation(s,{...ctx,action:'finalize',requestId,
  buyerClubId:buyerId,feeITL:1000});
 assert.equal(out.accepted,true,out.reason);
 const sell=s.clubs.find(c=>c.id===clubId),buy=s.clubs.find(c=>c.id===buyerId);
 assert.equal(sell.players.some(p=>p.id===playerId),false);
 assert.equal(buy.players.filter(p=>p.id===playerId).length,1);
 assert.equal(buy.players.find(p=>p.id===playerId).teamId,buyerId);
 assert.equal(sell.finance.cash,beforeSeller+1000);
 assert.equal(buy.finance.cash,beforeBuyer-1000);
 assert.equal(careerSaleOperation(s,{...ctx,action:'finalize',requestId,
  buyerClubId:buyerId,feeITL:1000}).accepted,false);
 assert.equal(sell.players.some(p=>p.id===playerId),false);
 assert.deepEqual(deserialize(serialize(s)).clubs.find(c=>c.id===buyerId).players.map(p=>p.id),
  buy.players.map(p=>p.id));
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
  const managed=state.clubs.find(c=>c.id===originalClub);
  const settlements=managed.management?.stadiumSettlements||[];
  assert.equal(settlements.length,15*(season+1),
    'exactly one authentic home attendance settlement per home fixture');
  assert.equal(new Set(settlements.map(x=>x.fixtureId)).size,settlements.length);
  assert.ok(settlements.every(x=>Number.isSafeInteger(x.attendance)&&
    Number.isSafeInteger(x.revenue)&&x.revenue===x.attendance*x.priceITL));
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
