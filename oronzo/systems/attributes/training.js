import { clamp, createRng } from './rng.js';
import { normalizePlayer } from './player-model.js';
import { trainingInjuryProbability } from './personality.js';

export const TRAINING_PLANS = Object.freeze({
  technical: { load: 51, skills: ['control','passing','dribbling','shooting','goalkeeping'] },
  athletic: { load: 78, skills: ['pace','stamina','strength','acceleration'] },
  tactical: { load: 42, skills: ['positioning','decisions','vision','teamwork','discipline'] },
  balanced: { load: 46, skills: ['control','passing','stamina','positioning'] },
  rest: { load: 0, skills: [] },
});
const clone = p => normalizePlayer(p);
function increase(player, skill, amount) {
  const group = skill in player.technical ? 'technical' : skill in player.physical ? 'physical' : 'mental';
  const current = player[group][skill];
  const cap = Math.max(current, clamp(player.development?.potential ?? 65));
  player[group][skill] = Math.round(clamp(current + amount, 0, cap) * 100) / 100;
}
function withRecovery(p, days = 7) {
  p.status.injuryDays = Math.max(0, Math.ceil(p.status.injuryDays - days));
  p.status.health = Math.round(clamp(p.status.health + (p.status.injuryDays ? 2 : 4), 0, 100) * 100) / 100;
}
export function applyTrainingWeek(players, plan = 'balanced', options = {}) {
  if (!Array.isArray(players)) throw new TypeError('players must be array');
  const definition = typeof plan === 'string' ? TRAINING_PLANS[plan] : plan;
  if (!definition || !Number.isFinite(definition.load) || !Array.isArray(definition.skills) || definition.load < 0 || definition.load > 100)
    throw new RangeError('Invalid training plan');
  const rng = createRng(`${options.seed ?? 1}|week:${options.week ?? 1}|${plan && typeof plan === 'string' ? plan : 'custom'}`);
  const coachQuality = clamp(options.coachQuality ?? 50);
  const intensity = clamp(options.intensity ?? 50);
  const incidents = [];
  const updated = players.map(raw => {
    const p = clone(raw);
    const injuredAtStart = p.status.injuryDays > 0;
    const load = injuredAtStart ? 0 : definition.load * (.75 + intensity / 200) * (1 + (p.mental.spericolatezza - 50) * .0012);
    const recovery = 21 + p.physical.stamina * .09 + (definition.load === 0 ? 17 : 0);
    p.status.fatigue = Math.round(clamp(p.status.fatigue - recovery + load * (.48 + (100 - p.physical.stamina) / 750)) * 100) / 100;
    const overloaded = p.status.fatigue > 74;
    if (injuredAtStart) {
      p.status.fitness = clamp(p.status.fitness - 2);
      withRecovery(p);
    } else {
      const progressMultiplier = (p.age <= 23 ? 1.2 : p.age <= 29 ? 1 : p.age <= 33 ? .68 : .38) *
        (.6 + coachQuality / 125) * (overloaded ? .43 : 1) * (p.status.health / 100) * (.75 + p.mental.ambition / 200) * (.91 + p.mental.discipline * .0018);
      for (const skill of definition.skills) {
        if (!(skill in p.technical) && !(skill in p.physical) && !(skill in p.mental)) throw new RangeError(`Unknown training skill: ${skill}`);
        increase(p, skill, (.07 + rng() * .18) * progressMultiplier);
      }
      p.status.fitness = clamp(p.status.fitness + (definition.load === 0 ? -1 : load / 28) - (overloaded ? 6 : 0));
      if (definition.load === 0) p.mental.morale = clamp(p.mental.morale + 1.5);
      else if (overloaded) p.mental.morale = clamp(p.mental.morale - 1);
      const probability = load === 0 ? 0 : trainingInjuryProbability(p, load);
      if (rng() < probability) {
        const days = Math.round(3 + rng() * 9 + (overloaded ? rng() * 12 : 0));
        p.status.injuryDays = days;
        p.status.health = clamp(p.status.health - 5 - days * .55);
        incidents.push({ type: 'trainingInjury', playerId: p.id, days, probability });
      } else withRecovery(p);
    }
    p.status.fatigue = Math.round(p.status.fatigue * 100) / 100;
    p.status.fitness = Math.round(p.status.fitness * 100) / 100;
    return p;
  });
  return { players: updated, incidents, report: { plan: typeof plan === 'string' ? plan : 'custom', week: options.week ?? 1,
    averageFatigue: updated.length ? updated.reduce((a,p) => a + p.status.fatigue, 0) / updated.length : 0 } };
}
export function applyMatchLoad(players, minutesById = {}, { intensity = 50 } = {}) {
  return players.map(raw => {
    const p = clone(raw);
    const minutes = clamp(minutesById[p.id] ?? 0, 0, 130);
    if (minutes > 0) {
      const load = minutes / 90 * (8 + clamp(intensity) * .14) * (1.18 - p.physical.stamina * .003);
      p.status.fatigue = Math.round(clamp(p.status.fatigue + load) * 100) / 100;
      p.status.fitness = Math.round(clamp(p.status.fitness - minutes / 90 * 2) * 100) / 100;
    }
    return p;
  });
}
export function applyObservedInjury(player, days) {
  const p = clone(player);
  if (!Number.isFinite(days) || days < 0) throw new RangeError('invalid days');
  p.status.injuryDays = Math.max(p.status.injuryDays, Math.min(365, Math.round(days)));
  p.status.health = clamp(p.status.health - Math.min(35, days * .75));
  return p;
}
export function advanceSeason(players, { seed = 1, season = '1985-86' } = {}) {
  const rng = createRng(`${seed}|${season}|season-end`);
  return players.map(raw => {
    const p = clone(raw);
    p.age = Math.min(50, p.age + 1);
    const peak = clamp(p.development?.peakAge ?? 29, 23, 40);
    if (p.age > peak) {
      const drop = .35 + (p.age - peak) * .35;
      for (const stat of ['pace','acceleration','stamina','strength']) p.physical[stat] = Math.round(clamp(p.physical[stat] - drop * (.6 + rng() * .8)) * 100) / 100;
    } else if (p.age <= 24) {
      for (const stat of ['decisions','positioning','composure']) increase(p, stat, .2 + rng() * .65);
    }
    p.status.fatigue = Math.round(clamp(p.status.fatigue - 30) * 100) / 100;
    p.status.injuryDays = Math.max(0, p.status.injuryDays - 30);
    p.status.fitness = Math.round(clamp(p.status.fitness + 4) * 100) / 100;
    return p;
  });
}

