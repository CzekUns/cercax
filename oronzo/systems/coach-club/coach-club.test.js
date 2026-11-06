import test from 'node:test';
import assert from 'node:assert/strict';
import {
 createClub,createCoach,book,settleWeek,endClubWeek,weeklyPayroll,
 presidentRoster,FALLBACK_PRESIDENTS,presidentBehavior,loadPresidents,
 prepareMatchday,coachCommand,chooseTrainingPlan,
 requestTransfer,reviewTransfer,negotiateWithSeller,finalizeTransfer,
 requestSale,decideSale,finalizeSale,conveneBoard,answerBoardRequest,
 reviewMatch,applyClubEvent,resolvePromises
} from './index.js';

const player=(id,position='CM',wage=1000)=>({
 id,name:'Player '+id,teamId:'club',age:23,positions:[position],
 technical:{passing:55,shooting:55,control:55,tackling:55,positioning:55,decisions:55,goalkeeping:position==='GK'?60:10},
 physical:{pace:55,stamina:55,strength:55,durability:55},
 mental:{composure:55,discipline:55,teamwork:55,confidence:55,morale:55,luck:55,character:55},
 status:{fatigue:0,fitness:100,health:100,injuryDays:0,suspensionMatches:0},
 contract:{weeklyWage:wage}
});
const fixture=(presidentId='fixture-patron',cash=150000,wageBudget=20000)=>{
 const players=Array.from({length:15},(_,i)=>player('p'+i,i===0||i===11?'GK':'CM'));
 const club=createClub({id:'club',name:'Campanile',divisionId:'promotion',budget:cash,wageBudget,
  boardTrust:65,seasonObjective:'safety',presidentId,players,
  staff:{sportingDirector:{competence:99,loyalty:55}}},{sponsorPerWeek:25000,travelCost:8000});
 return {club,coach:createCoach({id:'coach',name:'Coach',clubId:'club'}),
  president:FALLBACK_PRESIDENTS.find(p=>p.id===presidentId)};
};
const finished=(h,a)=>({phase:'fulltime',t:5400,score:{home:h,away:a},events:[]});
const buy=player('incoming','ST',1800);
function getApproved(proposed,profile,id){
 for(let seed=0;seed<250;seed++){
   const x=reviewTransfer(proposed,profile,id,seed);
   if(x.accepted)return x.club;
 }
 throw Error('no approved seed found in 250 trials');
}

test('eight distinct and validated synthetic presidents have reproducible behavior',async()=>{
 const all=presidentRoster();
 assert.equal(all.length,8);
 assert.equal(new Set(all.map(p=>p.archetype)).size,8);
 const state={boardTrust:21,lossStreak:3,cash:130000,requestedFee:90000};
 assert.deepEqual(presidentBehavior(all[0],state,123),presidentBehavior(all[0],state,123));
 assert.ok(presidentBehavior(all[3],state,1).chances.marketApproval<
  presidentBehavior(all[7],state,1).chances.marketApproval);
 const loaded=await loadPresidents(async()=>{throw Error('not found')});
 assert.equal(loaded.source,'synthetic_fallback');
});

test('cash cannot be overspent and every expense has a ledger',()=>{
 const {club}=fixture();
 assert.equal(weeklyPayroll(club),15000);
 assert.equal(book(club,{type:'expense',amount:150001}).reason,'insufficient_cash');
 assert.equal(club.budget,150000);
 const x=book(club,{type:'expense',amount:5000,week:1,note:'kits'});
 assert.equal(x.club.budget,145000);
 assert.equal(x.club.finance.transactions.at(-1).paid,5000);
 assert.throws(()=>book(club,{type:'expense',amount:-1}));
});

test('weekly bill: sponsor, wages, travel, bonus and arrears; idempotence',()=>{
 const {club}=fixture('fixture-miser',1000);
 const one=settleWeek(club,{week:1,away:true,bonus:12000});
 assert.equal(one.club.budget,0);
 assert.equal(one.club.finance.arrears,9000);
 assert.equal(settleWeek(one.club,{week:1}).reason,'week_already_settled');
 const two=endClubWeek(one.club,{week:2,away:false});
 assert.equal(two.club.finance.arrears,0);
 assert.equal(two.club.budget,1000);
});

test('matchday validation, captain, injuries and bench limits',()=>{
 const {club,coach}=fixture();
 const xi=club.players.slice(0,11).map(p=>p.id);
 const x=prepareMatchday(club,coach,{xi,bench:['p11'],captainId:'p4'});
 assert.equal(x.accepted,true);
 assert.equal(x.selection.xi.length,11);
 assert.equal(prepareMatchday(club,coach,{xi:[...xi.slice(1),'p12'],captainId:'p4'}).reason,'no_goalkeeper');
 assert.equal(prepareMatchday(club,coach,{xi,bench:['p4'],captainId:'p4'}).reason,'duplicate_or_invalid_ids');
 const injured=structuredClone(club);injured.players[0].status.injuryDays=2;
 assert.equal(prepareMatchday(injured,coach,{xi,captainId:'p4'}).reason,'player_unavailable');
 assert.equal(prepareMatchday(club,coach,{xi,bench:['p11','p12'],captainId:'p4',rules:{maxBench:1}}).reason,'bench_limit');
});

test('coach proposes explicit commands, training only schedules action',()=>{
 const {coach}=fixture();
 const shout=coachCommand(coach,{type:'shout',teamId:'club',payload:{message:'encourage'}});
 assert.deepEqual(shout.command,{type:'shout',teamId:'club',payload:{message:'encourage'}});
 assert.equal(coachCommand(coach,{type:'substitution',teamId:'club',payload:{outId:'a',inId:'a'}}).accepted,false);
 assert.equal(coachCommand(coach,{type:'tacticChange',teamId:'club',payload:{pressing:101}}).reason,'tactic_out_of_range');
 const t=chooseTrainingPlan(coach,{week:1,focus:'tactics'});
 assert.equal(t.accepted,true);
 assert.equal(t.coach.trainingPlan.week,1);
 assert.equal(chooseTrainingPlan(t.coach,{week:1,focus:'fitness'}).reason,'already_planned');
});

test('coach request cannot acquire player until approval, sale agreement and payment',()=>{
 const {club,coach,president}=fixture();
 const req=requestTransfer(club,coach,{id:'t1',player:buy,askingFee:20000,weeklyWage:1800,week:1});
 assert.equal(req.accepted,true);assert.equal(req.club.players.length,15);
 assert.equal(finalizeTransfer(req.club,'t1').accepted,false);
 const approved=getApproved(req.club,president,'t1');
 assert.equal(approved.players.length,15);
 assert.equal(negotiateWithSeller(approved,'t1',{sellerAccepts:false,sellerFee:18000,agreedWage:1700}).accepted,false);
 const deal=negotiateWithSeller(approved,'t1',{sellerAccepts:true,sellerFee:18000,agreedWage:1700});
 assert.equal(deal.accepted,true);
 const signed=finalizeTransfer(deal.club,'t1',{week:1});
 assert.equal(signed.accepted,true);
 assert.equal(signed.club.players.length,16);
 assert.equal(signed.club.budget,132000);
 assert.equal(signed.club.players.at(-1).contract.weeklyWage,1700);
 assert.equal(signed.club.market.requests[0].status,'completed');
 assert.equal(finalizeTransfer(signed.club,'t1').accepted,false);
});

test('affordability checks at board decision and again at final signature',()=>{
 const {club,coach,president}=fixture('fixture-miser',10000);
 const req=requestTransfer(club,coach,{id:'t1',player:buy,askingFee:20000,weeklyWage:1800});
 assert.equal(reviewTransfer(req.club,president,'t1',1).reason,'insufficient_cash');
 assert.equal(club.players.length,15);
 const f=fixture();
 const proposed=requestTransfer(f.club,f.coach,{id:'t2',player:buy,askingFee:20000,weeklyWage:1800});
 const approved=getApproved(proposed.club,f.president,'t2');
 const agreed=negotiateWithSeller(approved,'t2',{sellerAccepts:true,sellerFee:18000,agreedWage:1700});
 const afterBills=book(agreed.club,{type:'expense',amount:agreed.club.budget-5000}).club;
 assert.equal(finalizeTransfer(afterBills,'t2').reason,'insufficient_cash');
 assert.equal(afterBills.players.length,15);
});

test('sales require club approval and buyer offer',()=>{
 const f=fixture('fixture-miser');
 const req=requestSale(f.club,f.coach,{id:'sale',playerId:'p6',minimumFee:5000});
 let review;
 for(let seed=0;seed<250;seed++){
   const x=decideSale(req.club,f.president,'sale',seed);
   if(x.accepted){review=x;break;}
 }
 assert.ok(review);
 assert.equal(finalizeSale(review.club,'sale',{buyerAccepts:false,fee:10000}).accepted,false);
 const sold=finalizeSale(review.club,'sale',{buyerAccepts:true,fee:10000});
 assert.equal(sold.accepted,true);
 assert.equal(sold.club.players.length,14);
 assert.equal(sold.club.budget,160000);
});

test('president meeting creates requests and coach can decline once',()=>{
 const f=fixture('fixture-grandiose');
 let meeting;
 for(let seed=0;seed<250;seed++){
  const x=conveneBoard(f.club,f.president,{week:1,seed,marketNeed:50000});
  if(x.requests.length){meeting=x;break;}
 }
 assert.ok(meeting);
 assert.equal(conveneBoard(meeting.club,f.president,{week:1}).reason,'already_met_this_week');
 const x=answerBoardRequest(meeting.club,f.coach,{week:1,requestId:meeting.requests[0].id,response:'decline'});
 assert.equal(x.accepted,true);
 assert.equal(x.club.boardTrust,62);
 assert.equal(answerBoardRequest(x.club,f.coach,{week:1,requestId:meeting.requests[0].id,response:'accept'}).reason,'already_answered');
});

test('board trust only changes for authenticated completed match, once per ID',()=>{
 const f=fixture();
 const playing=reviewMatch(f.club,f.president,{matchId:'m1',week:1,homeClubId:'club',awayClubId:'away',snapshot:{phase:'playing',t:12,score:{home:8,away:0}}});
 assert.equal(playing.accepted,false);
 const x=reviewMatch(f.club,f.president,{matchId:'m1',week:1,homeClubId:'club',awayClubId:'away',snapshot:finished(1,0)},42);
 assert.equal(x.accepted,true);assert.equal(x.club.boardTrust,68);
 assert.equal(x.club.board.results[0].gf,1);
 assert.equal(reviewMatch(x.club,f.president,{matchId:'m1',week:1,homeClubId:'club',awayClubId:'away',snapshot:finished(1,0)},42).reason,'already_recorded');
});

test('low trust, negative streak and patience can produce dismissal with no score edits',()=>{
 const f=fixture('fixture-improviser');const c=structuredClone(f.club);
 c.boardTrust=20;c.board.weeksUnderPressure=2;c.board.lossStreak=3;
 const x=reviewMatch(c,f.president,{matchId:'m2',week:2,homeClubId:'club',awayClubId:'away',snapshot:finished(0,2)},12);
 assert.equal(x.accepted,true);
 assert.ok(x.club.boardTrust<20);
 assert.equal(x.club.board.results[0].ga,2);
 assert.ok(['employed','sacked'].includes(x.club.board.status));
});

test('narrative events respect money, bounds, cooldown, no invented goals',()=>{
 const f=fixture();const event={id:'ev',clubId:'club',seasonWeek:1,trigger:'board',cooldownWeeks:3,
  options:[{id:'a',label:'Act',effects:{boardTrust:2,morale:1,expense:2000}}]};
 const x=applyClubEvent(f.club,event,'a',{week:1});
 assert.equal(x.accepted,true);assert.equal(x.club.boardTrust,67);
 assert.equal(x.club.players[0].mental.morale,56);
 assert.equal(x.club.budget,148000);
 assert.equal(applyClubEvent(x.club,event,'a',{week:2}).reason,'cooldown');
 assert.equal(applyClubEvent(f.club,{...event,options:[{id:'a',effects:{goal:1}}]},'a',{week:1}).reason,'unsupported_effect');
});

test('unfunded presidential promises expire; confirmed contribution can be credited',()=>{
 const f=fixture('fixture-grandiose'); const c=structuredClone(f.club);
 c.board.promises.push({week:1,amount:50000,dueWeek:2,status:'pledged'});
 const pending=resolvePromises(c,{week:2});
 assert.equal(pending.budget,150000);assert.equal(pending.board.promises[0].status,'pledged');
 const failed=resolvePromises(pending,{week:3});
 assert.equal(failed.budget,150000);assert.equal(failed.board.promises[0].status,'broken');
 assert.equal(failed.boardTrust,62);
 const funded=resolvePromises(c,{week:2,confirmedContributions:{1:50000}});
 assert.equal(funded.budget,200000);assert.equal(funded.board.promises[0].status,'honored');
 assert.equal(resolvePromises(funded,{week:3}).budget,200000);
});

test('finance and board data persist in a serialized career save',()=>{
 const f=fixture();const x=endClubWeek(f.club,{week:1,away:true});
 const loaded=JSON.parse(JSON.stringify(x.club));
 assert.equal(loaded.budget,x.club.budget);
 assert.equal(loaded.finance.settledWeeks[0],1);
 assert.equal(loaded.boardTrust,x.club.boardTrust);
});
