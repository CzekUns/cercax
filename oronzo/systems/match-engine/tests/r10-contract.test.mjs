import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch} from '../match-engine.js';
import {makeFixture} from '../fixtures.js';
import {regionalAffinity,normalizeMatchOrigin,normalizePlayerMatchContext,
  normalizeIndividualTone,toAttributesTone,createIndividualShoutCommand} from '../orders.js';
import {collectCoachEffects} from '../coach-effects.js';

const coach={origin:{comune:'Salerno',regione:'Campania',macroregione:'Sud'},
  traits:{leadership:75}};
const shout=(p,tone='gentle')=>createIndividualShoutCommand({
  teamId:'montevento',player:p,coach,tone,utteranceId:'original-r10'
});
function testInput({origin=null,trust=50,temporaryEffects=[]}={}){
  const input=makeFixture('r10-contract');
  input.homeClub.players[9]={
    ...input.homeClub.players[9],origin,
    relationships:{coachTrust:trust},temporaryEffects
  };
  return input;
}
function response(origin,trust,tone='gentle',otherPayload={}){
  const input=testInput({origin,trust});
  const player=input.homeClub.players[9],match=createMatch(input);
  match.step(300);
  const c=shout(player,tone);
  Object.assign(c.payload,otherPayload);
  const response=match.command(c);
  assert.equal(response.accepted,true);
  const event=match.getEventsSince().at(-1);
  return {response,event,match};
}
const origins={
  region:{comune:'Napoli',regione:'Campania',macroregione:'Sud'},
  macro:{comune:'Bari',regione:'Puglia',macroregione:'Sud'},
  other:{comune:'Roma',regione:'Lazio',macroregione:'Centro'},
};

test('R10 PlayerV2 keys and CoachV2 aliases normalize; missing origins stay unknown',()=>{
  assert.deepEqual(normalizeMatchOrigin(origins.region),
    {regionId:'campania',macroRegion:'south'});
  assert.deepEqual(normalizeMatchOrigin({regionId:'Campania',macroRegion:'south'}),
    {regionId:'campania',macroRegion:'south'});
  assert.deepEqual(normalizeMatchOrigin(null),{regionId:null,macroRegion:null});
  assert.deepEqual(regionalAffinity(coach.origin,origins.region),{kind:'region',score:2});
  assert.deepEqual(regionalAffinity(coach.origin,origins.macro),{kind:'macro',score:1});
  assert.deepEqual(regionalAffinity(coach.origin,origins.other),{kind:'other',score:0});
  assert.equal(regionalAffinity(coach.origin,null).kind,'unknown');
  const coachOnlyRegion={comune:'Salerno',regione:'Campania'};
  assert.equal(regionalAffinity(coachOnlyRegion,origins.macro).kind,'macro');
  assert.equal(regionalAffinity(coachOnlyRegion,origins.other).kind,'other');
  assert.equal(normalizeMatchOrigin(coachOnlyRegion).macroRegion,'south');
  assert.equal(normalizePlayerMatchContext({origin:null}).origin,null);
  assert.equal(normalizePlayerMatchContext({relationships:{coachTrust:0}}).coachTrust,0);
});

test('R10 real canonical origin beats contradictory playerOrigin payload',()=>{
  const r=response(origins.region,50,'gentle',{playerOrigin:origins.other});
  assert.equal(r.response.effects.affinity,'region');
  assert.equal(r.event.detail.affinity,'region');
  assert.deepEqual(r.response.effects.temporaryEffect,r.event.detail.temporaryEffect);
});

test('R10 0/100 coachTrust beats contradictory payload fallback and affects modifier',()=>{
  const low=response(origins.region,0,'gentle',{playerTrust:100});
  const high=response(origins.region,100,'gentle',{playerTrust:0});
  assert.equal(low.event.detail.coachTrustAtCommand,0);
  assert.equal(high.event.detail.coachTrustAtCommand,100);
  assert.ok(high.response.effects.temporaryEffect.modifier>
    low.response.effects.temporaryEffect.modifier);
});

test('R10 same region > same macro > other macro under identical seed/trust',()=>{
  const [a,b,c]=[origins.region,origins.macro,origins.other]
    .map(o=>response(o,50,'encourage').response.effects.temporaryEffect.modifier);
  assert.ok(a>b && b>c);
});

test('R10 gentle/hard aliases match encourage/harsh exactly at seed',()=>{
  for(const [a,b,legacy] of [['gentle','encourage','gentle'],['hard','harsh','hard']]){
    const x=response(origins.region,50,a),y=response(origins.region,50,b);
    assert.deepEqual(x.event,y.event);
    assert.equal(x.event.detail.tone,b);
    assert.equal(x.event.detail.attributesTone,legacy);
    assert.equal(toAttributesTone(a),legacy);
    assert.equal(normalizeIndividualTone(a),b);
  }
  assert.equal(normalizeIndividualTone('calm'),null);
  assert.throws(()=>shout({id:'montevento-9',teamId:'montevento'},'calm'),/tone/);
});

test('R10 only one temporary modifier: ignores 08 persisted effects and replaces overlap',()=>{
  const polluted=testInput({origin:origins.region,trust:65,
    temporaryEffects:[{id:'old',kind:'coach-shout',bonus:8,expiresAt:500}]});
  const clean=testInput({origin:origins.region,trust:65});
  const a=createMatch(clean),b=createMatch(polluted);
  a.step(120);b.step(120);
  assert.deepEqual(a.snapshot(),b.snapshot(),
    'Attributes08 temporaryEffects must not also apply to match physics');
  const first=b.command(shout(polluted.homeClub.players[9],'gentle'));
  assert.equal(first.accepted,true);
  const started=b.snapshot().players.find(p=>p.id==='montevento-9');
  assert.equal(started.individualInstruction.modifier,
    first.effects.temporaryEffect.modifier);
  assert.equal(started.individualInstruction.expiresAt,270);
  assert.equal(started.individualInstruction.tone,'encourage');
  b.step(120);
  const second=b.command(shout(polluted.homeClub.players[9],'hard'));
  assert.equal(second.accepted,true);
  const active=b.snapshot().players.find(p=>p.id==='montevento-9');
  assert.equal(active.individualInstruction.modifier,
    second.effects.temporaryEffect.modifier,'must replace, never sum');
  assert.equal(active.individualInstruction.expiresAt,390);
  b.step(150);
  assert.equal(b.snapshot().players.find(p=>p.id==='montevento-9').individualInstruction,
    undefined,'expires after 150 simulated seconds');
  assert.equal(b.getEventsSince().filter(e=>e.type==='coach_shout').length,2);
});

test('R10 retry + JSON save/load produce one persistent proposal, no engine mutation',()=>{
  const source=testInput({origin:origins.region,trust:50});
  const roundTrip=JSON.parse(JSON.stringify(source));
  const match=createMatch(roundTrip);
  const cursor=match.getEventsSince().at(-1).id;
  assert.equal(match.command(shout(roundTrip.homeClub.players[9])).accepted,true);
  const e=match.getEventsSince(cursor);
  const events=JSON.parse(JSON.stringify([...e,...e]));
  const first=collectCoachEffects(events,[],{matchId:'1979-G07'});
  assert.equal(first.effects.length,1);
  assert.equal(first.effects[0].eventId,'1979-G07:'+e[0].id);
  assert.equal(first.effects[0].attributesTone,'gentle');
  assert.equal(first.effects[0].temporaryOwner,'match-engine-06');
  assert.equal(first.effects[0].persistentOwner,'coach-club-09');
  const restoredLedger=JSON.parse(JSON.stringify(first.appliedEventIds));
  const again=collectCoachEffects(events,restoredLedger,{matchId:'1979-G07'});
  assert.equal(again.effects.length,0);
  assert.deepEqual(again.appliedEventIds,restoredLedger);
  assert.equal(collectCoachEffects(events,restoredLedger,{matchId:'1979-G08'}).effects.length,1);
  assert.deepEqual(source.homeClub.players[9].relationships,{coachTrust:50});
});

test('R10 individual shout never directly scores; all tactical and substitution APIs survive',()=>{
  const input=testInput({origin:origins.region,trust:50});
  const m=createMatch(input);
  m.step(300);
  const previous=m.snapshot();
  assert.equal(m.command(shout(input.homeClub.players[9])).accepted,true);
  assert.deepEqual(m.snapshot().score,previous.score);
  assert.equal(m.command({type:'tacticChange',teamId:'montevento',
    payload:{formation:'3-5-2'}}).accepted,true);
  assert.equal(m.command({type:'substitution',teamId:'montevento',
    payload:{outId:'montevento-10',inId:'montevento-11'}}).accepted,true);
  m.step(5100);
  const goals=m.getEventsSince().filter(e=>e.type==='goal');
  assert.equal(m.snapshot().score.home+m.snapshot().score.away,goals.length);
  assert.equal(m.snapshot().t,5400);
});
