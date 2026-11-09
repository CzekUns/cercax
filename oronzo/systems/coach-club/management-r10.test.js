import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeFinances,settleWeek,weeklyPayroll} from './finance.js';
import {createCoach} from './coach-model.js';
import {initializeManagement,coachPresidentCompatibility,recommendTicketPrice,presidentTicketFloor,setTicketPrice,settleHomeAttendance,
 submitPresidentRequest,decidePresidentRequest} from './management-r10.js';
import {persistShout} from './shouts-r10.js';
const president=(changes={})=>({id:'canon-presidente',name:'Signor Direttore',archetype:'dealer',clubFlavor:'fictional',traits:{frugality:12,vanity:35,ambition:88,patience:65,authoritarianism:35,interference:40,riskTolerance:70,...changes}});
const period=(year=1979,week=1,absoluteWeek=1)=>({seasonYear:year,week,absoluteWeek});
function setup(){
 const p=president();const coach=createCoach({id:'coach',name:'Mister',clubId:'club-1',
   traits:{luck:55,leadership:80,patience:80,selfEsteem:55},morale:50});
 let club=initializeFinances({id:'club-1',name:'FC Borrello',presidentId:p.id,budget:800000,
  wageBudget:120000,boardTrust:65,reputation:30,staff:{sportingDirector:{competence:99,loyalty:50}},
  board:{results:[],lastMatchIds:[],notices:[],promises:[],eventsUsed:{},lossStreak:0},market:{requests:[]},
  stadium:{condition:65,capacity:2000,ticketPriceITL:1200},supporters:{approval:65},
  players:[{id:'p1',teamId:'club-1',contract:{weeklyWage:10000},relationships:{coachTrust:50},relationshipWithCoach:50}]},
 {sponsorPerWeek:20000,travelCost:3000});
 club=initializeManagement(club,p);return {p,coach,club};
}
const proof=(club,fixtureId,p)=>{
 const c=structuredClone(club),home={id:fixtureId,homeId:c.id,awayId:'away',result:{score:{home:2,away:1},events:[]}};
 c.board.lastMatchIds.push(fixtureId);
 c.board.results.push({matchId:fixtureId,periodKey:'a:'+p.absoluteWeek,...p,result:'win',gf:2,ga:1});
 return {club:c,fixture:home};
};
test('initialize derives persistent papponeria from canonical profile only once',()=>{
 const {p,club}=setup();assert.ok(club.boardTraits.papponeria>=0&&club.boardTraits.papponeria<=100);
 assert.equal(initializeManagement(JSON.parse(JSON.stringify(club)),president({frugality:95})).boardTraits.papponeria,club.boardTraits.papponeria);
 assert.throws(()=>initializeManagement(club,{...p,id:'wrong'}),/president_mismatch/);
 const before=JSON.stringify(club);recommendTicketPrice(club,p);assert.equal(JSON.stringify(club),before);
});
test('character compatibility and president policies give different outputs',()=>{
 const a=setup(),boss=president({authoritarianism:100});
 assert.notEqual(coachPresidentCompatibility(a.coach,a.p),coachPresidentCompatibility(a.coach,boss));
 const price=recommendTicketPrice(a.club,a.p);assert.ok(price>0);
 const greedier=structuredClone(a.club);greedier.boardTraits.papponeria=95;
 assert.ok(recommendTicketPrice(greedier,a.p)>price);
});
test('path A: change price -> gate cash -> fans, board, coach morale and exact receipts',()=>{
 const {club,coach,p}=setup(),r=period();const priced=setTicketPrice(club,p,{eventId:'price1979-1',priceITL:3500,period:r});
 assert.equal(priced.accepted,true);
 const {club:played,fixture}=proof(priced.club,'fixture:1979:1',r);
 const before=played.finance.cash;
 const result=settleHomeAttendance(played,coach,p,{fixture,period:r});
 assert.equal(result.accepted,true);
 assert.ok(result.settlement.attendance>=0&&result.settlement.attendance<=played.stadium.capacity);
 assert.equal(result.settlement.revenue,result.settlement.attendance*3500);
 assert.equal(result.club.finance.cash,before+result.settlement.revenue);
 assert.equal(result.club.finance.transactions.at(-1).note,'tickets:fixture:1979:1');
 assert.notEqual(result.club.supporters.approval,played.supporters.approval);
 assert.notEqual(result.coach.morale,coach.morale);
 assert.equal(result.coach.moraleEvents.at(-1).eventId,'stadium:fixture:1979:1');
 const saved=JSON.parse(JSON.stringify(result));
 const retry=settleHomeAttendance(saved.club,saved.coach,p,{fixture,period:r});
 assert.equal(retry.accepted,false);assert.equal(retry.reason,'already_settled');
 assert.equal(saved.club.finance.transactions.length,result.club.finance.transactions.length);
});
test('a fixture must be authentically recorded as home and in the matching period',()=>{
 const {club,p,coach}=setup(),r=period();
 assert.throws(()=>settleHomeAttendance(club,coach,p,{fixture:{id:'fake',homeId:club.id,awayId:'x'},period:r}),/board_review/);
 const {club:played,fixture}=proof(club,'fixture-real',r);
 assert.throws(()=>settleHomeAttendance(played,coach,p,{fixture:{...fixture,homeId:'other'},period:r}),/verified_home_fixture/);
 assert.throws(()=>settleHomeAttendance(played,coach,p,{fixture:{...fixture,result:{score:{home:5,away:0}}},period:r}),/fixture_result_mismatch/);
 assert.throws(()=>settleHomeAttendance(played,coach,p,{fixture,period:period(1980,1,40)}),/fixture_period_mismatch/);
});
test('ticket change idempotent across reload; period rule prevents two prices in one week',()=>{
 const a=setup(),r=period();const x=setTicketPrice(a.club,a.p,{eventId:'c',priceITL:1900,period:r});
 const saved=JSON.parse(JSON.stringify(x.club));
 assert.equal(setTicketPrice(saved,a.p,{eventId:'c',priceITL:1900,period:r}).reason,'already_applied');
 assert.equal(setTicketPrice(saved,a.p,{eventId:'d',priceITL:2200,period:r}).reason,'price_already_set_this_period');
 const y=setTicketPrice(saved,a.p,{eventId:'e',priceITL:2200,period:period(1980,1,40)});
 assert.equal(y.accepted,true);assert.equal(y.club.stadium.ticketPriceITL,2200);
 assert.throws(()=>setTicketPrice(saved,a.p,{eventId:'bad',priceITL:-1,period:r}),RangeError);
});
test('path B: president request -> approval -> debit -> conditions and relationships',()=>{
 const a=setup(),r=period();const proposed=submitPresidentRequest(a.club,a.coach,a.p,{requestId:'repair:1',kind:'stadium_repair',amountITL:100000,period:r});
 assert.equal(proposed.accepted,true);assert.equal(proposed.club.finance.cash,a.club.finance.cash);
 const decided=decidePresidentRequest(proposed.club,a.coach,a.p,{requestId:'repair:1',period:r});
 assert.equal(decided.accepted,true);assert.equal(decided.approved,true);
 assert.equal(decided.club.finance.cash,a.club.finance.cash-100000);
 assert.ok(decided.club.stadium.condition>a.club.stadium.condition);
 assert.ok(decided.club.supporters.approval>a.club.supporters.approval);
 assert.equal(decided.club.finance.transactions.at(-1).note,'president_request:repair:1');
 assert.ok(decided.coach.relationships.board>a.coach.relationships.board);
 const save=JSON.parse(JSON.stringify(decided));
 const retry=decidePresidentRequest(save.club,save.coach,a.p,{requestId:'repair:1',period:r});
 assert.equal(retry.reason,'already_decided');
 assert.equal(save.club.finance.cash,decided.club.finance.cash);
});
test('path B: papponeria, arrears, cash and reserve produce reasoned rejections without debits',()=>{
 const a=setup(),r=period();const greedy=structuredClone(a.club);greedy.boardTraits.papponeria=100;greedy.boardTraits.spendingWillingness=0;
 const proposal=submitPresidentRequest(greedy,a.coach,a.p,{requestId:'costly',kind:'training_facilities',amountITL:200000,period:r});
 const rejected=decidePresidentRequest(proposal.club,a.coach,a.p,{requestId:'costly',period:r});
 assert.equal(rejected.approved,false);assert.equal(rejected.reason,'president_policy_rejects');
 assert.equal(rejected.club.finance.cash,greedy.finance.cash);
 assert.equal(rejected.coach.morale,a.coach.morale-2);
 const indebted=structuredClone(a.club);indebted.finance.arrears=1;
 const want=submitPresidentRequest(indebted,a.coach,a.p,{requestId:'unpaid',kind:'stadium_repair',amountITL:20000,period:r});
 assert.equal(decidePresidentRequest(want.club,a.coach,a.p,{requestId:'unpaid',period:r}).reason,'unpaid_liabilities');
 const impossible=submitPresidentRequest(a.club,a.coach,a.p,{requestId:'impossible',kind:'stadium_repair',amountITL:900000,period:r});
 assert.equal(decidePresidentRequest(impossible.club,a.coach,a.p,{requestId:'impossible',period:r}).reason,'insufficient_cash');
});
test('market mandate approved but does not create fake cash or payroll or player',()=>{
 const a=setup(),r=period(),pending=submitPresidentRequest(a.club,a.coach,a.p,
  {requestId:'market:1',kind:'market_mandate',amountITL:50000,period:r});
 const decided=decidePresidentRequest(pending.club,a.coach,a.p,{requestId:'market:1',period:r});
 assert.equal(decided.approved,true);
 assert.equal(decided.club.finance.cash,a.club.finance.cash);
 assert.equal(decided.club.players.length,a.club.players.length);
 assert.equal(weeklyPayroll(decided.club),weeklyPayroll(a.club));
});
test('two seasons, salary settlement and gate receipt never duplicate on save/load',()=>{
 let {club,coach,p}=setup();
 for(const [year,wk,absolute] of [[1979,1,1],[1980,1,40]]) {
  const per=period(year,wk,absolute),fid='fixture:'+year+':1';
  const received=proof(club,fid,per);
  const gate=settleHomeAttendance(received.club,coach,p,{fixture:received.fixture,period:per});
  assert.equal(gate.accepted,true);club=gate.club;coach=gate.coach;
  const settled=settleWeek(club,{...per,away:false});assert.equal(settled.accepted,true);
  club=JSON.parse(JSON.stringify(settled.club));coach=JSON.parse(JSON.stringify(coach));
  assert.equal(settleWeek(club,{...per}).reason,'week_already_settled');
  assert.equal(settleHomeAttendance(club,coach,p,{fixture:received.fixture,period:per}).reason,'already_settled');
 }
 assert.equal(club.management.stadiumSettlements.length,2);
 assert.equal(club.finance.settledWeeks.length,2);
 assert.ok(club.finance.settledWeeks.includes('a:40'));
 assert.equal(club.players[0].contract.weeklyWage,10000);
 assert.ok(club.finance.cash>=0&&club.finance.arrears>=0);
});
test('legacy week ledgers cannot be silently mixed into absolute-week money',()=>{
 const a=setup();a.club.finance.transactions.push({type:'income',week:1,amount:10,paid:10,unpaid:0});
 assert.throws(()=>setTicketPrice(a.club,a.p,{eventId:'x',priceITL:1500,period:period()}),/period_migration_required/);
});
const shout=(id,delta=2)=>({id,type:'coach_shout',teamId:'club-1',playerId:'p1',detail:{
 accepted:true,temporaryOwner:'match-engine-06',persistentOwner:'coach-club-09',
 temporaryEffect:{modifier:.07,startedAt:0,expiresAt:150},
 persistentSuggestion:{playerTrustDelta:delta,coachMoraleDelta:0}}});
test('PR56 shout consumer updates player trust once, with no temporary duplicate',()=>{
 const a=setup(),e=shout(7),key='fixture:1979:1:7';
 const x=persistShout({key,event:e,coach:a.coach,club:a.club});
 assert.equal(x.accepted,true);assert.equal(x.club.players[0].relationships.coachTrust,52);
 assert.equal(x.coach.relationships.playerTrustById.p1,52);
 assert.equal(x.club.players[0].temporaryEffects,undefined);
 assert.equal(x.club.management.shouts[key].temporaryAppliedHere,false);
 const saved=JSON.parse(JSON.stringify(x));
 const retry=persistShout({key,event:e,coach:saved.coach,club:saved.club});
 assert.equal(retry.accepted,true);assert.equal(retry.duplicate,true);
 assert.equal(retry.club.players[0].relationships.coachTrust,52);
 assert.equal(retry.coach.moraleEvents.length,1);
 assert.throws(()=>persistShout({key,event:shout(7,-2),coach:saved.coach,club:saved.club}),/conflicting_shout_replay/);
});
test('shout fails closed for forged temporary owner and unknown player',()=>{
 const a=setup(),bad=shout(1);bad.detail.temporaryOwner='club-09';
 assert.throws(()=>persistShout({key:'match:1',event:bad,club:a.club,coach:a.coach}),/untrusted_shout_event/);
 const unknown=shout(2);unknown.playerId='unknown';
 assert.throws(()=>persistShout({key:'match:2',event:unknown,club:a.club,coach:a.coach}),/shout_unknown_player/);
});
import {requestTransferInWindow,reviewTransferInWindow,negotiateTransferInWindow,finalizeTransferInWindow,
 requestSaleInWindow,decideSaleInWindow,finalizeSaleInWindow} from './market-r10.js';
const activeWindow={source:'career-07',id:'C07:1979:W01',open:true,seasonYear:1979};
const candidate={id:'new1',name:'Pippo Prova',positions:['MF'],teamId:'seller',contract:{weeklyWage:9000}};
function approvedMarket(){
 const a=setup(),per=period();
 const p=submitPresidentRequest(a.club,a.coach,a.p,{requestId:'mandate',kind:'market_mandate',amountITL:50000,period:per});
 const d=decidePresidentRequest(p.club,a.coach,a.p,{requestId:'mandate',period:per});
 assert.equal(d.approved,true);return {...a,club:d.club,coach:d.coach,per};
}
test('market strictly rejects absent, closed, wrong season and unmandated bids',()=>{
 const a=approvedMarket(),r={id:'bid',player:candidate,askingFee:20000,weeklyWage:9000};
 assert.equal(requestTransferInWindow(a.club,a.coach,a.p,{request:r,mandateId:'mandate',period:a.per}).reason,'career07_market_window_required');
 assert.equal(requestTransferInWindow(a.club,a.coach,a.p,{request:r,mandateId:'mandate',period:a.per,window:{...activeWindow,open:false}}).reason,'market_window_closed');
 assert.equal(requestTransferInWindow(a.club,a.coach,a.p,{request:r,mandateId:'mandate',period:a.per,window:{...activeWindow,seasonYear:1980}}).reason,'market_window_season_mismatch');
 assert.equal(requestTransferInWindow(a.club,a.coach,a.p,{request:r,mandateId:'fake',period:a.per,window:activeWindow}).reason,'approved_market_mandate_required');
 assert.equal(requestTransferInWindow(a.club,a.coach,a.p,{request:{...r,askingFee:999999},mandateId:'mandate',period:a.per,window:activeWindow}).reason,'fee_exceeds_president_mandate');
 assert.equal(a.club.market.requests.length,0);
});
test('market real request -> director/president -> agreement -> fee/debit -> contract, once',()=>{
 const a=approvedMarket(),r={id:'bid',player:candidate,askingFee:20000,weeklyWage:9000};
 const proposed=requestTransferInWindow(a.club,a.coach,a.p,{request:r,mandateId:'mandate',window:activeWindow,period:a.per});
 assert.equal(proposed.accepted,true);
 let reviewed;
 for(let seed=0;seed<200;seed++){
  const answer=reviewTransferInWindow(proposed.club,a.p,{requestId:'bid',window:activeWindow,period:a.per,seed});
  if(answer.accepted){reviewed=answer;break}
 }
 assert.ok(reviewed);
 const negotiated=negotiateTransferInWindow(reviewed.club,{requestId:'bid',window:activeWindow,period:a.per,
  terms:{sellerAccepts:true,sellerFee:19000,agreedWage:8000}});
 assert.equal(negotiated.accepted,true);
 assert.equal(finalizeTransferInWindow(negotiated.club,{requestId:'bid',window:{...activeWindow,open:false},period:a.per}).reason,'market_window_closed');
 const missing=finalizeTransferInWindow(negotiated.club,{requestId:'bid',window:activeWindow,period:a.per});
 assert.equal(missing.reason,'career07_seller_release_required');
 const release={source:'career-07',confirmed:true,playerId:'new1',sellerClubId:'seller'};
 const purchased=finalizeTransferInWindow(negotiated.club,{requestId:'bid',window:activeWindow,period:a.per,sellerRelease:release});
 assert.equal(purchased.accepted,true);
 assert.equal(purchased.club.finance.cash,a.club.finance.cash-19000);
 assert.equal(purchased.club.players.at(-1).contract.weeklyWage,8000);
 assert.equal(purchased.club.finance.transactions.at(-1).periodKey,'a:1');
 assert.equal(purchased.club.management.requests.find(x=>x.id==='mandate').status,'spent');
 const saved=JSON.parse(JSON.stringify(purchased.club));
 assert.equal(finalizeTransferInWindow(saved,{requestId:'bid',window:activeWindow,period:a.per}).reason,'approved_market_mandate_required');
 assert.equal(saved.players.length,purchased.club.players.length);
 assert.equal(weeklyPayroll(saved),18000);
});
test('market sale is window guarded and income only after real buyer acceptance',()=>{
 const a=setup(),r=period(),w=activeWindow;
 const proposal=requestSaleInWindow(a.club,a.coach,{request:{id:'sale1',playerId:'p1',minimumFee:1000},window:w,period:r});
 assert.equal(proposal.accepted,true);
 let reviewed;
 for(let seed=0;seed<200;seed++){
  const x=decideSaleInWindow(proposal.club,a.p,{requestId:'sale1',window:w,period:r,seed});
  if(x.accepted){reviewed=x;break;}
 }
 assert.ok(reviewed);
 assert.equal(finalizeSaleInWindow(reviewed.club,{requestId:'sale1',window:w,period:r,buyerAccepts:false,fee:4000}).reason,'no_acceptable_offer');
 const finished=finalizeSaleInWindow(reviewed.club,{requestId:'sale1',window:w,period:r,buyerAccepts:true,fee:4000});
 assert.equal(finished.accepted,true);
 assert.equal(finished.club.players.length,0);
 assert.equal(finished.club.finance.cash,a.club.finance.cash+4000);
 assert.equal(finished.club.finance.transactions.at(-1).periodKey,'a:1');
});

test('greedy president can refuse suspiciously low prices despite fan wishes',()=>{
 const a=setup();const greedy=structuredClone(a.club);greedy.boardTraits.papponeria=100;
 assert.ok(presidentTicketFloor(greedy,a.p)>presidentTicketFloor(a.club,a.p));
 const blocked=setTicketPrice(greedy,a.p,{eventId:'free',priceITL:100,period:period()});
 assert.equal(blocked.accepted,false);assert.equal(blocked.reason,'president_refuses_low_price');
 assert.equal(blocked.club.finance.cash,a.club.finance.cash);
});
test('coach game over prevents management and market side effects',()=>{
 const a=setup();const dead=createCoach({...a.coach,morale:0,gameOver:{eventId:'loss',reason:'morale_zero'}});
 assert.throws(()=>submitPresidentRequest(a.club,dead,a.p,{requestId:'dead',kind:'stadium_repair',amountITL:10000,period:period()}),/game_over/);
 const m=requestTransferInWindow(a.club,dead,a.p,{request:{id:'x',player:candidate,askingFee:1,weeklyWage:1},mandateId:'fake',window:activeWindow,period:period()});
 assert.equal(m.reason,'game_over');
 const real=proof(a.club,'f',period());
 assert.throws(()=>settleHomeAttendance(real.club,dead,a.p,{fixture:real.fixture,period:period()}),/game_over/);
});
