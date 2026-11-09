import { createRng, clamp, range, pick, triangular } from './rng.js';
import { normalizePlayer } from './player-model.js';
import { DEMO_ORIGINS, normalizeOrigin } from './geography.js';
import { chooseSurname, BUILTIN_SURNAME_CATALOG } from './surnames.js';

const FIRST = ['Aldo','Antonio','Bruno','Carlo','Ciro','Dario','Domenico','Elio','Ennio','Ettore','Fabio','Franco','Gino','Gianni','Guido','Ivano','Lello','Luigi','Marco','Mauro','Nino','Oreste','Paolo','Piero','Raffaele','Renato','Rino','Sandro','Sergio','Tino','Ugo','Vito'];
const LAST = ['Amato','Baldini','Barone','Basile','Bellini','Caruso','Coppola','Costa','De Luca','De Rosa','Esposito','Fabbri','Ferraro','Fusco','Gallo','Gentile','Greco','Leone','Lombardi','Mancini','Marino','Monti','Moretti','Orlando','Palmieri','Pellegrini','Pisani','Ricci','Romano','Rossi','Ruggiero','Russo','Santoro','Serra','Vitale'];
const ARCHETYPES = ['equilibrato','finalizzatore-fragile','fulmine-impulsivo','talento-indisciplinato','sfortunato','capitano-carismatico','operaio-instancabile','portiere-affidabile'];
const roleBias = {
  GK: { goalkeeping: 30, positioning: 12, decisions: 8, shooting: -35, tackling: -15, dribbling: -22, pace: -12, composure: 8 },
  DF: { tackling: 15, positioning: 12, strength: 9, shooting: -16, goalkeeping: -35, discipline: 5 },
  MF: { passing: 13, vision: 13, stamina: 8, control: 8, goalkeeping: -35, shooting: -4 },
  FW: { shooting: 19, dribbling: 10, acceleration: 9, tackling: -17, goalkeeping: -35, composure: 4 },
};
const traits = {
  'finalizzatore-fragile': { shooting: 22, control: 9, durability: -27, strength: -8 },
  'fulmine-impulsivo': { pace: 22, acceleration: 20, composure: -25, discipline: -17, impulsivita: 28, spericolatezza: 22, pazzia: 12 },
  'talento-indisciplinato': { control: 19, dribbling: 23, vision: 9, discipline: -29, ambition: 12, pazzia: 15, impulsivita: 15 },
  'sfortunato': { luck: -32, control: 7, confidence: -7 },
  'capitano-carismatico': { character: 28, teamwork: 17, discipline: 10, passing: -9, shooting: -8, tackling: -6, coraggio: 13, suscettibilita: -12 },
  'operaio-instancabile': { stamina: 24, durability: 15, teamwork: 12, dribbling: -12 },
  'portiere-affidabile': { goalkeeping: 20, composure: 13, discipline: 15, dribbling: -15 },
};
export function generatePlayer({ seed = 1, teamId = 'club', index = 0, role = 'MF', teamLevel = 48, archetype, surnameCatalog = BUILTIN_SURNAME_CATALOG, origins = DEMO_ORIGINS } = {}) {
  const rng = createRng(`${seed}|${teamId}|${index}`);
  const a = archetype || pick(rng, role === 'GK' ? ['equilibrato','sfortunato','capitano-carismatico','portiere-affidabile'] : ARCHETYPES.slice(0, 7));
  const base = clamp(teamLevel + range(rng, -9, 9), 22, 88);
  const technical = {}, physical = {}, mental = {};
  const spec = roleBias[role] || roleBias.MF;
  const arch = traits[a] || {};
  for (const [group, keys] of Object.entries({
    technical: ['passing','shooting','control','tackling','positioning','decisions','goalkeeping','vision','dribbling'],
    physical: ['pace','stamina','strength','durability','acceleration'],
    mental: ['composure','discipline','teamwork','confidence','morale','luck','character','ambition','pazzia','spericolatezza','coraggio','suscettibilita','impulsivita'],
  })) {
    for (const key of keys) {
      const anchor = ['durability','luck','morale','confidence','character','discipline','ambition'].includes(key) ? 54 : base;
      const bias = (spec[key] || 0) + (arch[key] || 0);
      const noise = (triangular(rng) - .5) * 34;
      ({ technical, physical, mental })[group][key] = Math.round(clamp(anchor + bias + noise, key === 'goalkeeping' && role !== 'GK' ? 1 : 8, 98));
    }
  }
  if (role !== 'GK') technical.goalkeeping = Math.round(range(rng, 2, 18));
  else technical.goalkeeping = Math.round(clamp(base + 19 + (arch.goalkeeping || 0) + range(rng, -7, 9), 25, 98));
  const age = Math.round(range(rng, 17, role === 'GK' ? 39 : 36));
  const first = FIRST[Math.floor(rng() * FIRST.length)];
  const chosen = surnameCatalog ? chooseSurname(surnameCatalog,rng) : { name: LAST[Math.floor(rng() * LAST.length)], sourceId:'legacy-fallback-unverified' };
  const last = chosen.name;
  if (!Array.isArray(origins)) throw new TypeError('origins must be an array');
  const origin = origins.length ? normalizeOrigin(pick(rng,origins)) : null;
  const potential = clamp(base + range(rng, 7, 26) + (age < 22 ? 5 : 0), base, 99);
  return normalizePlayer({ id: `${teamId}-${String(index + 1).padStart(3, '0')}`, name: `${first} ${last}`,
    teamId, age, surname:last, surnameId:chosen.id ?? null, surnameSourceId:chosen.sourceId, origin, positions: [role], foot: rng() < .17 ? 'L' : rng() < .04 ? 'B' : 'R',
    personality: a, technical, physical, mental, status: { fatigue: 0, fitness: 74 + Math.round(rng() * 20), health: 85 + Math.round(rng() * 15) },
    development: { potential: Math.round(potential), peakAge: Math.round(range(rng, role === 'GK' ? 29 : 25, role === 'GK' ? 37 : 32)) },
    relationships: {} });
}
export function generateSquad({ seed = 1, teamId = 'club', size = 22, teamLevel = 48, surnameCatalog = BUILTIN_SURNAME_CATALOG, origins = DEMO_ORIGINS } = {}) {
  if (!Number.isInteger(size) || size < 11 || size > 100) throw new RangeError('size must be 11..100');
  const template = ['GK','DF','DF','DF','DF','MF','MF','MF','MF','FW','FW',
    'GK','DF','DF','DF','MF','MF','MF','MF','FW','FW','FW'];
  const result = Array.from({ length: size }, (_, i) => generatePlayer({ seed, teamId, index: i, teamLevel, role: template[i] || ['DF','MF','FW'][i % 3], surnameCatalog, origins }));
  return result.map((p, i) => ({ ...p, starter: i < 11 }));
}
export function generatePlayers(count = 120, { seed = 1, teamLevel = 48, teamId = 'free', surnameCatalog = BUILTIN_SURNAME_CATALOG, origins = DEMO_ORIGINS } = {}) {
  if (!Number.isInteger(count) || count < 0 || count > 10000) throw new RangeError('count must be 0..10000');
  return Array.from({ length: count }, (_, i) => generatePlayer({ seed, teamLevel, teamId, index: i, role: ['GK','DF','DF','MF','MF','FW'][i % 6], surnameCatalog, origins }));
}
export function generateLeague({ seed = 1, teams = 8, squadSize = 22, teamLevel = 48, surnameCatalog = BUILTIN_SURNAME_CATALOG, origins = DEMO_ORIGINS } = {}) {
  if (!Number.isInteger(teams) || teams < 1 || teams > 100) throw new RangeError('teams must be 1..100');
  return Array.from({ length: teams }, (_, i) => ({ id: `club-${i+1}`, players: generateSquad({ seed, teamId: `club-${i+1}`, size: squadSize, teamLevel: teamLevel + (i % 5 - 2) * 2, surnameCatalog, origins }) }));
}

