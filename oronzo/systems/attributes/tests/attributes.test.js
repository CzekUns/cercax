import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../rng.js';
import { normalizePlayer, validatePlayer, importLegacyPlayers, ATTRIBUTE_KEYS } from '../player-model.js';
import { generatePlayer, generatePlayers, generateSquad, generateLeague } from '../generator.js';
import { effectiveAbility, resolveAction, trainingInjuryProbability } from '../personality.js';
import { applyTrainingWeek, applyMatchLoad, applyObservedInjury, advanceSeason } from '../training.js';
import { createCareerRecord, recordMatch, recordSeasonSnapshot } from '../career-stats.js';

const base = () => generatePlayer({ seed: 8, teamId: 's', role: 'FW', archetype: 'finalizzatore-fragile' });
const assertBounds = p => {
  assert.equal(validatePlayer(p).valid, true, JSON.stringify(validatePlayer(p).errors));
  for (const [group, keys] of Object.entries(ATTRIBUTE_KEYS)) for (const key of keys) {
    assert.ok(Number.isFinite(p[group][key]), `${group}.${key}`);
    assert.ok(p[group][key] >= 0 && p[group][key] <= (key === 'injuryDays' ? 365 : key === 'suspensionMatches' ? 30 : 100));
  }
};
test('seeds are reproducible, diverge and accept string seeds', () => {
  assert.deepEqual(generateSquad({ seed: '1985' }), generateSquad({ seed: '1985' }));
  assert.notDeepEqual(generateSquad({ seed: '1985' }), generateSquad({ seed: '1986' }));
  assert.deepEqual([createRng('a')(),createRng('a')()], [createRng('a')(),createRng('a')()]);
});
test('120 players have unique stable IDs and all rating bounds', () => {
  const ps = generatePlayers(120, {seed:99});
  assert.equal(ps.length,120);
  assert.equal(new Set(ps.map(p => p.id)).size,120);
  ps.forEach(assertBounds);
  const signatures = new Set(ps.map(p => [p.technical.shooting,p.physical.pace,p.mental.discipline].join('-')));
  assert.ok(signatures.size > 105);
});
test('league is persistent shape with 22 plausible starters and reserves', () => {
  const league = generateLeague({seed:1985,teams:8});
  assert.equal(league.flatMap(t=>t.players).length,176);
  assert.equal(new Set(league.flatMap(t=>t.players).map(p=>p.id)).size,176);
  for (const t of league) {
    assert.equal(t.players.filter(p=>p.starter).length,11);
    assert.ok(t.players.filter(p=>p.positions[0] === 'GK').length >= 2);
    assert.equal(t.players.filter(p=>p.starter && p.positions[0] === 'GK').length,1);
    assert.ok(t.players.filter(p=>p.positions[0] === 'GK').every(p=>p.technical.goalkeeping > 25));
    assert.ok(t.players.filter(p=>p.positions[0] !== 'GK').every(p=>p.technical.goalkeeping < 19));
  }
});
test('archetypes create meaningful differences without absolute bad outcomes', () => {
  const fragile = generatePlayer({seed:1,archetype:'finalizzatore-fragile',role:'FW'});
  const steady = generatePlayer({seed:1,archetype:'equilibrato',role:'FW'});
  const hasty = generatePlayer({seed:1,archetype:'fulmine-impulsivo',role:'FW'});
  assert.ok(fragile.technical.shooting > steady.technical.shooting);
  assert.ok(fragile.physical.durability < steady.physical.durability);
  assert.ok(hasty.physical.pace > steady.physical.pace);
  assert.ok(hasty.mental.composure < steady.mental.composure);
});
test('legacy importer keeps legacy data and maps roles; bad numbers clamp', () => {
  const legacy = [{id:8,name:'Nino Caputo',role:'POR',tech:79,speed:44,stamina:20,luck:66,character:77,
    confidence:58,morale:41,health:90,fatigue:105,starter:true}];
  const p = importLegacyPlayers(legacy, 'campanile')[0];
  assert.equal(p.id,'8'); assert.equal(p.teamId,'campanile'); assert.equal(p.positions[0],'GK');
  assert.equal(p.technical.control,79); assert.equal(p.physical.pace,44);
  assert.equal(p.mental.luck,66); assert.equal(p.status.fatigue,100);
  assert.equal(p.starter,true); assert.equal(p.tech,79);
  assertBounds(p);
  assert.deepEqual(legacy[0].fatigue,105);
  const malformed = normalizePlayer({name:'A',technical:{shooting:-35},physical:{stamina:1000},status:{injuryDays:999}});
  assertBounds(malformed);
  assert.equal(malformed.technical.shooting,0); assert.equal(malformed.physical.stamina,100);
});
test('effectiveAbility fatigue, fitness, health, pressure and morale have real effects', () => {
  const p = base();
  const first = effectiveAbility(p,{skill:'shooting'});
  const exhausted = structuredClone(p); exhausted.status.fatigue=95;
  assert.ok(effectiveAbility(exhausted,{skill:'shooting'}).effective < first.effective - 10);
  const confidence = structuredClone(p); confidence.mental.confidence=98; confidence.mental.morale=98;
  assert.ok(effectiveAbility(confidence,{skill:'shooting',pressure:90}).effective >
    effectiveAbility(p,{skill:'shooting',pressure:90}).effective);
  const injured = structuredClone(p); injured.status.injuryDays=8;
  assert.ok(effectiveAbility(injured,{skill:'shooting'}).effective < first.effective);
});
test('luck slightly adjusts the probability, never fixes the outcome', () => {
  const unlucky=base(); unlucky.mental.luck=0;
  const lucky=structuredClone(unlucky); lucky.mental.luck=100;
  const a=effectiveAbility(unlucky,{skill:'shooting'}), b=effectiveAbility(lucky,{skill:'shooting'});
  assert.ok(Math.abs((b.executionProbability-a.executionProbability)-.05) < 1e-10);
  assert.ok(a.executionProbability>0 && b.executionProbability<1);
  assert.throws(()=>resolveAction(lucky,{},()=>1),RangeError);
  assert.deepEqual(resolveAction(lucky,{skill:'shooting'},createRng(19)),resolveAction(lucky,{skill:'shooting'},createRng(19)));
});
test('discipline and teamwork drive adherence on tactical orders', () => {
  const rebel=base(); rebel.mental.discipline=4; rebel.mental.teamwork=15;
  const captain=structuredClone(rebel); captain.mental.discipline=95; captain.mental.teamwork=98;
  assert.ok(effectiveAbility(captain,{requiresInstruction:true}).adherence > effectiveAbility(rebel,{requiresInstruction:true}).adherence);
});
test('rapport quality changes collaboration without changing personal actions', () => {
  const p=base();p.relationships['mate']=-100;
  const low=effectiveAbility(p,{skill:'passing',teamAction:true,allyId:'mate'}).effective;
  p.relationships['mate']=100;
  const high=effectiveAbility(p,{skill:'passing',teamAction:true,allyId:'mate'}).effective;
  assert.ok(high>low+6);
});
test('training is deterministic, bounded, immutable, and individual', () => {
  const roster=generateSquad({seed:1});
  const before=structuredClone(roster);
  const a=applyTrainingWeek(roster,'technical',{seed:9,week:7});
  const b=applyTrainingWeek(roster,'technical',{seed:9,week:7});
  assert.deepEqual(a,b);
  assert.deepEqual(roster,before);
  a.players.forEach(assertBounds);
  assert.ok(a.players.some((p,i)=>p.technical.control>roster[i].technical.control));
  assert.ok(a.players.some((p,i)=>p.status.fatigue>roster[i].status.fatigue));
});
test('rest recovers fatigue, injury days, and zero load never directly adds training injuries', () => {
  const p=base();p.status.fatigue=94;p.status.injuryDays=14;p.status.health=45;
  const result=applyTrainingWeek([p],'rest',{seed:1});
  assert.ok(result.players[0].status.fatigue<p.status.fatigue);
  assert.equal(result.players[0].status.injuryDays,7);
  assert.ok(result.players[0].status.health>p.status.health);
  assert.equal(result.incidents.length,0);
});
test('overload and fragile durability raise injury likelihood, never force incidents', () => {
  const p=base(); const good=structuredClone(p);
  p.physical.durability=10;p.status.fatigue=90; good.physical.durability=100;good.status.fatigue=2;
  assert.ok(trainingInjuryProbability(p,85) > trainingInjuryProbability(good,85));
  assert.ok(trainingInjuryProbability(p,100)<1);
  const values = Array.from({length:52},(_,i)=>applyTrainingWeek([p],'athletic',{seed:i,week:i}).incidents.length);
  assert.ok(values.includes(0));
});
test('match fatigue uses actual minutes, with no made-up goals or injuries', () => {
  const a=base(),b=generatePlayer({seed:10,index:1});
  const r=applyMatchLoad([a,b],{[a.id]:90});
  assert.ok(r[0].status.fatigue>a.status.fatigue);
  assert.equal(r[1].status.fatigue,b.status.fatigue);
  assert.equal(r[0].status.injuryDays,a.status.injuryDays);
  assert.equal(applyObservedInjury(a,11).status.injuryDays,11);
});
test('ageing preserves IDs and gives declining pace after peak age', () => {
  const p=base(); p.age=34; p.development.peakAge=29;
  const [next]=advanceSeason([p],{seed:1986});
  assert.equal(next.id,p.id); assert.equal(next.age,35);
  assert.ok(next.physical.pace<p.physical.pace);
  assertBounds(next);
});
test('career events originate with engine and duplicate match is idempotent', () => {
  const p=base(), other=generatePlayer({seed:12,index:1});
  const events=[
    {id:'e1',type:'goal',playerId:p.id,detail:{assistId:other.id}},
    {id:'e2',type:'goal',playerId:other.id,detail:{assistId:p.id}},
    {id:'e3',type:'card',playerId:p.id,detail:{color:'yellow'}},
    {id:'e4',type:'injury',playerId:p.id},
    {id:'e5',type:'goal',playerId:'stranger'},
  ];
  let rec=createCareerRecord(p);
  const match={id:'match-1',seasonId:'1985-86',playerId:p.id,minutes:78,started:true,events};
  let result=recordMatch(rec,match); rec=result.record;
  assert.equal(result.applied,true);
  assert.deepEqual([rec.total.appearances,rec.total.minutes,rec.total.goals,rec.total.assists,rec.total.yellowCards,rec.total.injuries],[1,78,1,1,1,1]);
  assert.equal(recordMatch(rec,match).applied,false);
  assert.equal(recordMatch(createCareerRecord(p),{...match,id:'duplicate-assist',events:[...events,{id:'a1',type:'assist',playerId:p.id}]}).record.total.assists,1);
  assert.equal(rec.total.goals,1);
  rec=recordSeasonSnapshot(rec,'1985-86',p);
  assert.equal(rec.seasons['1985-86'].development.age,p.age);
  assert.throws(()=>recordMatch(rec,{...match,minutes:200,id:'bad'}),RangeError);
});

