import test from 'node:test';
import assert from 'node:assert/strict';
import {createCoach,chooseTrainingPlan} from './coach-model.js';
import {previewOfferMorale,applyOfferEffect,applyPressEffect,applyCoachMoraleEvent} from './morale.js';

const origin={municipalityId:'000001',regionId:'campania',macroRegion:'south'};
const mkCoach=(overrides={})=>createCoach({id:'c1',name:'Mister',origin,traits:{luck:50,leadership:50,selfEsteem:50,patience:50},morale:50,employmentHistory:[{clubId:'A',start:1979}],hiredSeason:1980,contract:{until:1982},...overrides});
const club=(regionId='campania',macroRegion='south')=>({id:'club-1',regionId,macroRegion});
const offer={id:'initial:1979:club-1',clubId:'club-1',coachWageITL:5000,advertisedPrestige:50,generatedSeed:123};

test('avatar fields and historical career/contract survive save and createCoach',()=>{
 const c=mkCoach(),loaded=createCoach(JSON.parse(JSON.stringify(c)));
 assert.deepEqual(loaded.origin,origin);
 assert.equal(loaded.hiredSeason,1980);
 assert.equal(loaded.contract.until,1982);
 assert.equal(loaded.employmentHistory.length,1);
 assert.equal(loaded.morale,50);
 assert.equal(createCoach({id:'old',name:'1985 legacy',hiredSeason:1985}).morale,50);
 assert.deepEqual(chooseTrainingPlan(c,{week:1,focus:'fitness'}).coach.traits,c.traits);
});
test('preview is pure, seed-stable, alternative regional distances, and economic bonus',()=>{
 const coach=mkCoach();const before=JSON.stringify([coach,offer,club()]);
 assert.deepEqual(previewOfferMorale(coach,offer,club()),previewOfferMorale(coach,offer,club()));
 assert.equal(JSON.stringify([coach,offer,club()]),before);
 assert.equal(previewOfferMorale(coach,offer,club()).baseDistanceCost,0);
 assert.equal(previewOfferMorale(coach,offer,club('basilicata','south')).baseDistanceCost,1);
 assert.equal(previewOfferMorale(coach,offer,club('piemonte','north')).baseDistanceCost,3);
 assert.equal(previewOfferMorale(coach,{...offer,coachWageITL:90000},club()).finalMoraleDelta,2);
});
test('high self-esteem with weak wage increases cost, settings configurable',()=>{
 const low=mkCoach({traits:{luck:50,leadership:50,selfEsteem:20,patience:50}});
 const high=mkCoach({traits:{luck:50,leadership:50,selfEsteem:100,patience:50}});
 const a=previewOfferMorale(low,offer,club('piemonte','north'));
 const b=previewOfferMorale(high,offer,club('piemonte','north'));
 assert.ok(b.selfEsteemMultiplier>a.selfEsteemMultiplier);
 assert.ok(b.finalMoraleDelta<a.finalMoraleDelta);
 assert.equal(previewOfferMorale(low,offer,club('piemonte','north'),{otherMacroRegionCost:5}).baseDistanceCost,5);
});
test('missing geography, mismatched club and missing coach wage fail explicitly',()=>{
 assert.throws(()=>previewOfferMorale(mkCoach({origin:null}),offer,club()),/coach_origin/);
 assert.throws(()=>previewOfferMorale(mkCoach(),offer,{id:'wrong',regionId:'x',macroRegion:'south'}),/offer_club_mismatch/);
 assert.throws(()=>previewOfferMorale(mkCoach(),{...offer,coachWageITL:undefined},club()),/coach_wage_required/);
 assert.throws(()=>previewOfferMorale(mkCoach(),offer,{id:'club-1',regionId:null,macroRegion:'south'}),/club_region/);
});
test('accepted offer debited once after save/load and with alternate eventId',()=>{
 const c=mkCoach(),arg={eventId:'offer-morale:'+offer.id,kind:'initial_offer',coach:c,club:club('piemonte','north'),offer};
 const one=applyOfferEffect(arg);
 assert.equal(one.accepted,true);
 assert.ok(one.coach.morale<c.morale);
 const saved=JSON.parse(JSON.stringify(one.coach));
 const two=applyOfferEffect({...arg,coach:saved});
 assert.equal(two.accepted,false);assert.equal(two.reason,'already_applied');
 const third=applyOfferEffect({...arg,coach:saved,eventId:'another-event-id'});
 assert.equal(third.accepted,false);assert.equal(third.reason,'source_already_applied');
 assert.equal(third.coach.morale,one.coach.morale);
});
test('game over is terminal and cannot be bypassed by reload or a recovery event',()=>{
 const start=mkCoach({morale:1});
 const done=applyCoachMoraleEvent(start,{eventId:'press:final',moraleDelta:-3,reason:'press',date:'1979-08-01'});
 assert.equal(done.coach.morale,0);assert.deepEqual(done.coach.gameOver,{eventId:'press:final',reason:'morale_zero',date:'1979-08-01'});
 const saved=JSON.parse(JSON.stringify(done.coach));
 assert.equal(applyCoachMoraleEvent(saved,{eventId:'press:final',moraleDelta:-3}).reason,'already_applied');
 assert.equal(applyCoachMoraleEvent(saved,{eventId:'rescue',moraleDelta:50}).reason,'game_over');
 assert.equal(createCoach(saved).morale,0);
});
test('real Copy04 semantic keys map to relations and press repeats are idempotent',()=>{
 const c=mkCoach({traits:{luck:90,leadership:85,selfEsteem:75,patience:85}});
 const input={eventId:'press:123:opening:offer-1|q-1',kind:'press',coach:c,
  semanticEffects:{coachMorale:-2,supportersTrust:2,mediaReputation:-2,presidentTrust:-1}};
 const x=applyPressEffect(input);
 assert.equal(x.accepted,true);
 assert.equal(x.coach.morale,49); // patience mitigates morale -2 => -1
 assert.equal(x.coach.relationships.fans,52);
 assert.equal(x.coach.relationships.squad,51); // leadership effect
 assert.equal(x.coach.relationships.media,49); // luck mitigates media -2 => -1
 assert.equal(x.coach.relationships.board,49);
 const retry=applyPressEffect({...input,coach:JSON.parse(JSON.stringify(x.coach))});
 assert.equal(retry.reason,'already_applied');
 assert.equal(retry.coach.relationships.fans,52);
});
test('repeated generic decision does not duplicate relationships and clamps all values',()=>{
 const c=mkCoach({morale:99,relationships:{board:99,squad:1,fans:50,media:50}});
 const x=applyCoachMoraleEvent(c,{eventId:'board:1',reason:'board_decision',moraleDelta:20,relationships:{board:10,squad:-10}});
 assert.equal(x.coach.morale,100);assert.equal(x.coach.relationships.board,100);assert.equal(x.coach.relationships.squad,0);
 assert.equal(x.event.appliedMoraleDelta,1);
 const y=applyCoachMoraleEvent(x.coach,{eventId:'board:1',moraleDelta:20});
 assert.equal(y.reason,'already_applied');
 assert.equal(y.coach.morale,100);
});
test('press invalid goal or unsupported effect is rejected atomically',()=>{
 const c=mkCoach(),before=JSON.stringify(c);
 assert.throws(()=>applyPressEffect({eventId:'p',coach:c,semanticEffects:{goal:1}}),/unsupported_press_effect/);
 assert.throws(()=>applyPressEffect({eventId:'p',coach:c,semanticEffects:{coachMorale:5}}),/0?[-]3\.\.3/);
 assert.equal(JSON.stringify(c),before);
});
