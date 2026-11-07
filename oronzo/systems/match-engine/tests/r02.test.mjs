import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch} from '../match-engine.js';
import {makeFixture} from '../fixtures.js';
import {createRng} from '../rng.js';
import {regionalAffinity,calculateIndividualShout,individualPerformanceFactor} from '../orders.js';
import {collectCoachEffects} from '../coach-effects.js';
import {runQa100} from '../qa-100-seeds.mjs';

const shout=(id,tone,extra={})=>({
  type:'shout',teamId:'montevento',payload:{targetPlayerId:id,tone,...extra}
});
const origin={regionId:'campania',macroRegion:'south'};

test('R02 individual shout emits seeded temporary event; team shout still works',()=>{
  const m=createMatch(makeFixture(33));m.step(300);
  const cursor=m.getEventsSince().at(-1).id;
  const r=m.command(shout('montevento-9','encourage',{
    utteranceId:'original-01',coachOrigin:origin,playerOrigin:origin
  }));
  assert.equal(r.accepted,true);
  assert.equal(r.effects.affinity,'region');
  assert.ok(r.effects.temporaryEffect.modifier>0);
  assert.equal(r.effects.temporaryEffect.expiresAt,450);
  const once=m.getEventsSince(cursor).filter(e=>e.type==='coach_shout');
  assert.equal(once.length,1);
  assert.equal(once[0].playerId,'montevento-9');
  assert.deepEqual(m.step(1).events.filter(e=>e.type==='coach_shout'),once);
  assert.equal(m.step(1).events.filter(e=>e.type==='coach_shout').length,0);
  assert.equal(m.command({type:'shout',teamId:'montevento',payload:{tone:'focus'}}).accepted,true);
});

test('R02 reject off-team, bench, invalid tone and cooldown without new event',()=>{
  const m=createMatch(makeFixture('invalid'));
  for(const c of [
    shout('portoselva-9','encourage'),shout('montevento-11','encourage'),
    shout('montevento-9','calm'),shout('', 'harsh'),
    shout('montevento-9','harsh',{utteranceId:4})
  ]){
    const r=m.command(c);assert.equal(r.accepted,false);assert.ok(r.reason);
  }
  assert.equal(m.getEventsSince().filter(e=>e.type==='coach_shout').length,0);
  assert.equal(m.command(shout('montevento-9','harsh')).accepted,true);
  assert.match(m.command(shout('montevento-9','encourage')).reason,/cooldown/);
  m.step(120);
  assert.equal(m.command(shout('montevento-9','encourage')).accepted,true);
  assert.equal(m.getEventsSince().filter(e=>e.type==='coach_shout').length,2);
});

test('R02 region > macro > other effects for same seed',()=>{
  const effect=playerOrigin=>{
    const m=createMatch(makeFixture('regional'));m.step(400);
    return m.command(shout('montevento-9','encourage',{coachOrigin:origin,playerOrigin})).effects;
  };
  const same=effect(origin);
  const macro=effect({regionId:'puglia',macroRegion:'south'});
  const other=effect({regionId:'veneto',macroRegion:'north'});
  assert.equal(same.affinity,'region');assert.equal(macro.affinity,'macro');
  assert.equal(other.affinity,'other');
  assert.ok(same.temporaryEffect.modifier>macro.temporaryEffect.modifier);
  assert.ok(macro.temporaryEffect.modifier>other.temporaryEffect.modifier);
  assert.deepEqual(regionalAffinity(null,null),{kind:'unknown',score:0});
});

test('R02 harsh is character-dependent and expires without permanent player mutation',()=>{
  const p=makeFixture('profile').homeClub.players[9];
  const low={...p,relationshipWithCoach:0,mental:{...p.mental,character:0,composure:0,discipline:0}};
  const high={...p,relationshipWithCoach:100,mental:{...p.mental,character:100,composure:100,discipline:100}};
  const a=calculateIndividualShout(low,{tone:'harsh'},createRng('same'),150);
  const b=calculateIndividualShout(high,{tone:'harsh'},createRng('same'),150);
  assert.ok(a.modifier<0);assert.ok(b.modifier>0);
  assert.equal(individualPerformanceFactor({personalShout:a},149),1);
  assert.equal(individualPerformanceFactor({personalShout:a},151),1+a.modifier);
  assert.equal(individualPerformanceFactor({personalShout:a},300),1);
});

test('R02 shout changes player movement while never awarding a direct goal',()=>{
  const baseline=createMatch(makeFixture('motion'));
  const boosted=createMatch(makeFixture('motion'));
  baseline.step(120);boosted.step(120);
  assert.deepEqual(baseline.snapshot().players,boosted.snapshot().players);
  const score=boosted.snapshot().score;
  assert.equal(boosted.command(shout('montevento-9','encourage')).accepted,true);
  assert.deepEqual(boosted.snapshot().score,score);
  baseline.step(1);boosted.step(1);
  const a=baseline.snapshot().players.find(p=>p.id==='montevento-9');
  const b=boosted.snapshot().players.find(p=>p.id==='montevento-9');
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>1e-8);
});

test('R02 idempotent relations bridge with match-specific event IDs',()=>{
  const m=createMatch(makeFixture('bridge'));
  assert.equal(m.command(shout('montevento-9','encourage',{utteranceId:'copy-9'})).accepted,true);
  const events=m.getEventsSince().filter(e=>e.type==='coach_shout');
  const before=JSON.stringify(events);
  assert.throws(()=>collectCoachEffects(events),/matchId/);
  const first=collectCoachEffects([...events,...events],[],{matchId:'1979-match-7'});
  assert.equal(first.effects.length,1);
  assert.equal(first.effects[0].eventId,'1979-match-7:'+events[0].id);
  const again=collectCoachEffects(events,first.appliedEventIds,{matchId:'1979-match-7'});
  assert.equal(again.effects.length,0);
  assert.equal(collectCoachEffects(events,again.appliedEventIds,{matchId:'1979-match-8'}).effects.length,1);
  assert.equal(JSON.stringify(events),before);
});

test('R02 repeated orders + formation changes reproduce all events',()=>{
  const a=createMatch(makeFixture('replay-individual'));
  const b=createMatch(makeFixture('replay-individual'));
  for(const m of [a,b]){
    m.step(320);
    assert.equal(m.command(shout('montevento-9','harsh',{coachOrigin:origin,playerOrigin:origin})).accepted,true);
    m.step(2000);
    assert.equal(m.command({type:'tacticChange',teamId:'montevento',payload:{formation:'3-5-2'}}).accepted,true);
    m.step(3080);
  }
  assert.deepEqual(a.snapshot(),b.snapshot());
  assert.deepEqual(a.getEventsSince(),b.getEventsSince());
});

test('R02 full QA: 100 seeds, tactical regroup, shouts and substitutions',()=>{
  const qa=runQa100(100);
  assert.equal(qa.seeds,100);
  assert.equal(qa.deterministicReplays,10);
  assert.equal(qa.acceptedIndividualShouts,100);
  assert.equal(qa.acceptedSubstitutions,100);
  assert.equal(qa.anchorsChecked,qa.anchorsRecovered);
  assert.ok(qa.anchorsChecked>=95);
  assert.ok(qa.maxNonRestartStepMeters<9.5);
  assert.ok(qa.meanGoals>0&&qa.meanShots>0);
});
