import { clamp } from './rng.js';
const technicalSkills = new Set(['passing','shooting','control','tackling','positioning','decisions','goalkeeping','vision','dribbling']);
const physicalSkills = new Set(['pace','stamina','strength','durability','acceleration']);
const mentalSkills = new Set(['composure','discipline','teamwork','confidence','morale','luck','character','ambition','pazzia','spericolatezza','coraggio','suscettibilita','impulsivita']);
export function effectiveAbility(player, context = {}) {
  const skill = context.skill || 'passing';
  const group = technicalSkills.has(skill) ? 'technical' : physicalSkills.has(skill) ? 'physical' : mentalSkills.has(skill) ? 'mental' : null;
  if (!group) throw new RangeError(`Unknown skill: ${skill}`);
  const n = (g, key, fallback = 50) => clamp(player?.[g]?.[key] ?? fallback);
  const base = n(group, skill);
  const fatigue = clamp(context.fatigue ?? n('status', 'fatigue', 0));
  const fitness = n('status', 'fitness', 80);
  const health = n('status', 'health', 90);
  const pressure = clamp(context.pressure ?? 35) / 100;
  const tactical = clamp(context.tacticalDemand ?? 50);
  const morale = n('mental', 'morale', 60);
  const confidence = n('mental', 'confidence', 55);
  const composure = n('mental', 'composure');
  const discipline = n('mental', 'discipline');
  const teamwork = n('mental', 'teamwork');
  const character = n('mental', 'character');
  const leadership = clamp(context.leaderAura ?? 50);
  const relationship = context.allyId == null ? 0 : clamp(player.relationships?.[String(context.allyId)] ?? 0, -100, 100);
  const injuryPenalty = n('status', 'injuryDays', 0) > 0 ? -20 : 0;
  const modifiers = {
    fatigue: -fatigue * .23,
    fitness: (fitness - 75) * .11,
    health: (health - 85) * .11,
    pressure: -pressure * Math.max(-3, (60 - composure) * .21 + (55 - confidence) * .08),
    confidence: (confidence - 50) * .075,
    morale: (morale - 50) * .065,
    teamwork: (teamwork - 50) * (context.teamAction ? .07 : .02),
    leadership: (leadership - 50) * .025 * (context.teamAction ? 1 : 0),
    relationship: relationship * (context.teamAction ? .035 : 0),
    injury: injuryPenalty,
    riskyExecution: context.riskyAction ? (n('mental','coraggio')-50)*.025 - (n('mental','spericolatezza')-50)*.065 - (n('mental','impulsivita')-50)*.032 : 0,
    temporary: 0, // Engine 06 alone owns 150s personalShout. Ignore stale 08 180s saves.
  };
  const adherence = clamp(45 + discipline * .3 + teamwork * .15 + character * .1 - tactical * .18 - pressure * 12 - (n('mental','impulsivita')-50)*.075 - (n('mental','pazzia')-50)*.045, 5, 98) / 100;
  modifiers.instructions = context.requiresInstruction ? -(1 - adherence) * 12 : 0;
  const effective = clamp(base + Object.values(modifiers).reduce((a,b) => a + b, 0));
  const luckDelta = ((n('mental', 'luck') - 50) / 50) * .025;
  const executionProbability = clamp(effective / 100 + luckDelta, .01, .99);
  return { skill, base, effective: Math.round(effective * 100) / 100, executionProbability,
    adherence: Math.round(adherence * 1000) / 1000, luckDelta, modifiers };
}
export function resolveAction(player, context, rng) {
  if (typeof rng !== 'function') throw new TypeError('A seeded/injected rng function is required');
  const rating = effectiveAbility(player, context);
  return { ...rating, roll: null, success: null, ...sample(rating, rng) };
}
function sample(rating, rng) {
  const roll = rng();
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) throw new RangeError('rng must return [0, 1)');
  return { roll, success: roll < rating.executionProbability };
}
export function trainingInjuryProbability(player, load = 50) {
  const durability = clamp(player.physical?.durability ?? 60);
  const fatigue = clamp(player.status?.fatigue ?? 0);
  const health = clamp(player.status?.health ?? 90);
  const overload = Math.max(0, load - 55) / 45;
  const risk = Math.max(0, load - 30) / 70 * ((clamp(player.mental?.spericolatezza ?? 50)-50)*.000065 + (clamp(player.mental?.pazzia ?? 50)-50)*.000035);
  return clamp(.001 + overload * .012 + (100 - durability) * .00013 + Math.max(0, fatigue - 60) * .00035 + (100 - health) * .00006 + risk, 0, .09);
}

