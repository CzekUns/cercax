import { clamp, seedNumber } from './rng.js';

export const ATTRIBUTE_KEYS = Object.freeze({
  technical: ['passing', 'shooting', 'control', 'tackling', 'positioning', 'decisions', 'goalkeeping', 'vision', 'dribbling'],
  physical: ['pace', 'stamina', 'strength', 'durability', 'acceleration'],
  mental: ['composure', 'discipline', 'teamwork', 'confidence', 'morale', 'luck', 'character', 'ambition'],
  status: ['fatigue', 'fitness', 'health', 'injuryDays', 'suspensionMatches'],
});
export const POSITIONS = Object.freeze(['GK', 'DF', 'MF', 'FW']);
export const LEGACY_POSITIONS = Object.freeze({ POR: 'GK', DIF: 'DF', CEN: 'MF', ATT: 'FW' });
const defaults = {
  technical: { passing: 50, shooting: 50, control: 50, tackling: 50, positioning: 50, decisions: 50, goalkeeping: 8, vision: 50, dribbling: 50 },
  physical: { pace: 50, stamina: 50, strength: 50, durability: 60, acceleration: 50 },
  mental: { composure: 50, discipline: 50, teamwork: 50, confidence: 55, morale: 60, luck: 50, character: 50, ambition: 50 },
  status: { fatigue: 0, fitness: 80, health: 90, injuryDays: 0, suspensionMatches: 0 },
};
const fallback = (value, other) => value == null ? other : value;
function stableId(name, teamId, index = '') {
  return `p-${seedNumber(`${teamId}|${name}|${index}`).toString(36)}`;
}
export function normalizePlayer(input, options = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('player must be an object');
  const teamId = String(fallback(input.teamId, options.teamId ?? 'unassigned'));
  const name = String(fallback(input.name, 'Senza nome'));
  const role = LEGACY_POSITIONS[input.role] || input.role;
  const positions = (Array.isArray(input.positions) ? input.positions : [role || 'MF'])
    .map(p => LEGACY_POSITIONS[p] || p).filter(p => POSITIONS.includes(p));
  const mapped = {
    technical: { passing: input.tech, control: input.tech, shooting: input.tech, tackling: input.tech },
    physical: { pace: input.speed, stamina: input.stamina },
    mental: { luck: input.luck, character: input.character, confidence: input.confidence, morale: input.morale },
    status: { health: input.health, fatigue: input.fatigue },
  };
  const out = { ...input, id: String(fallback(input.id, stableId(name, teamId, options.index))), name, teamId,
    age: Math.round(clamp(fallback(input.age, 24), 15, 50)), positions: [...new Set(positions.length ? positions : ['MF'])],
    foot: ['L', 'R', 'B'].includes(input.foot) ? input.foot : 'R',
    personality: typeof input.personality === 'string' ? input.personality : 'equilibrato',
    relationships: { ...(input.relationships && typeof input.relationships === 'object' && !Array.isArray(input.relationships) ? input.relationships : {}) },
  };
  for (const group of Object.keys(ATTRIBUTE_KEYS)) {
    out[group] = { ...defaults[group], ...Object.fromEntries(Object.entries(mapped[group]).filter(([,v]) => v != null)),
      ...(input[group] && typeof input[group] === 'object' ? input[group] : {}) };
    for (const key of ATTRIBUTE_KEYS[group]) out[group][key] = Math.round(clamp(out[group][key], 0,
      key === 'injuryDays' ? 365 : key === 'suspensionMatches' ? 30 : 100) * 100) / 100;
  }
  out.development = { potential: 65, ...(input.development || {}) };
  out.development.potential = clamp(out.development.potential);
  return out;
}
export const createPlayer = normalizePlayer;
export function validatePlayer(player) {
  const errors = [];
  if (!player || typeof player !== 'object') return { valid: false, errors: ['not an object'] };
  if (typeof player.id !== 'string' || !player.id) errors.push('id');
  if (typeof player.name !== 'string' || !player.name) errors.push('name');
  if (typeof player.teamId !== 'string' || !player.teamId) errors.push('teamId');
  if (!Number.isInteger(player.age) || player.age < 15 || player.age > 50) errors.push('age');
  if (!Array.isArray(player.positions) || !player.positions.length || player.positions.some(p => !POSITIONS.includes(p))) errors.push('positions');
  for (const [group, keys] of Object.entries(ATTRIBUTE_KEYS)) for (const key of keys)
    if (!Number.isFinite(player[group]?.[key]) || player[group][key] < 0 || player[group][key] > (key === 'injuryDays' ? 365 : key === 'suspensionMatches' ? 30 : 100)) errors.push(`${group}.${key}`);
  return { valid: errors.length === 0, errors };
}
export function importLegacyPlayers(legacyPlayers, teamId = 'campanile') {
  if (!Array.isArray(legacyPlayers)) throw new TypeError('expected players array');
  return legacyPlayers.map((player, index) => normalizePlayer(player, { teamId, index }));
}

