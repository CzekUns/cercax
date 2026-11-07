/** Oronzo career coordinator. Only Agent 6 match summaries are recorded as results. */
import { DIVISIONS, DEFAULT_RULES, seededRandom, generateSchedule, standings,
  promotionRelegation } from './league.js';
import { clamp, updateReputation, seasonAssessment, createJobOffers,
  applyBoardDecision, takeJobOffer } from './progression.js';
import { PRESIDENT_PROFILE_IDS, canonicalPresidentIds, ensureClubPresident,
  ensureClubContracts, normalizeCareerCoach } from './compat.js';
import { PERIOD_LEDGER_SCHEMA } from './period-migration.js';

const FIRST = ['Aldo', 'Renzo', 'Italo', 'Bruno', 'Nino', 'Silvano', 'Ruggero', 'Dario', 'Osvaldo', 'Lino', 'Tito', 'Piero'];
const LAST = ['Rocchi', 'Valli', 'Ferretti', 'Morelli', 'Monti', 'Pagani', 'Bassi', 'Leoni', 'Rinaldi', 'Sala', 'Conti', 'Fabbri'];
const PLACES = ['Borgo', 'Valle', 'Forte', 'Porto', 'Monte', 'Piana', 'Poggio', 'Riva', 'Colle', 'Torre', 'Ponte', 'Villa', 'Campo', 'Costa', 'Castello', 'Selva', 'Lago', 'Pietra', 'Rocca', 'Fonte'];
const SUFFIX = ['Azzurra', 'Marina', 'Nuova', 'Serena', 'Alta', 'Bassa', 'Rossa', 'Bianca', 'Verde', 'Antica', 'Sportiva', 'Futura'];
const POSITIONS = ['GK', 'GK', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW'];
const SKILLS = { technical: ['passing', 'shooting', 'control', 'tackling', 'positioning', 'decisions', 'goalkeeping'],
  physical: ['pace', 'stamina', 'strength', 'durability'], mental: ['composure', 'discipline', 'teamwork', 'confidence', 'morale', 'luck', 'character'] };
const numberIn = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const owned = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function newPlayer(id, teamId, index, rng, rating) {
  const role = POSITIONS[index];
  const player = { id, teamId, name: `${FIRST[numberIn(rng, 0, FIRST.length - 1)]} ${LAST[numberIn(rng, 0, LAST.length - 1)]}`,
    age: numberIn(rng, 18, 32), positions: [role], technical: {}, physical: {}, mental: {},
    status: { fatigue: 0, fitness: 85, health: 100, injuryDays: 0, suspensionMatches: 0 },
    stats: { seasonGoals: 0, careerGoals: 0 } };
  for (const [type, fields] of Object.entries(SKILLS)) for (const key of fields) {
    let value = clamp(numberIn(rng, rating - 16, rating + 16));
    if (key === 'goalkeeping') value = role === 'GK' ? clamp(rating + numberIn(rng, -8, 14)) : numberIn(rng, 0, 12);
    if (key === 'shooting' && role === 'FW') value = clamp(rating + numberIn(rng, -4, 13));
    player[type][key] = value;
  }
  return player;
}
function createClubs(config, seed) {
  const clubs = [], rng = seededRandom(`clubs:${seed}`);
  const spec = DIVISIONS.map(d => ({ ...d, clubs: config.leagueSizes?.[d.id] ?? d.clubs }));
  if (spec.some(d => !Number.isInteger(d.clubs) || d.clubs < 2 || d.clubs > 24 || d.clubs % 2)) {
    throw new Error('League sizes must be even integers from 2 to 24');
  }
  const presidentIds = canonicalPresidentIds(config.presidentIds ?? PRESIDENT_PROFILE_IDS);
  for (const [tier, division] of spec.entries()) for (let i = 0; i < division.clubs; i++) {
    const id = `${division.id}-${String(i + 1).padStart(2, '0')}`;
    const name = i === 0 && division.id === 'PROM' ? 'Atletico Campanile' :
      `${PLACES[(i + tier * 3) % PLACES.length]} ${SUFFIX[(i * 7 + tier) % SUFFIX.length]} ${tier + 1}${String(i + 1).padStart(2, '0')}`;
    const rating = clamp(83 - tier * 9 + numberIn(rng, -5, 5), 20, 90);
    const club = { id, name, divisionId: division.id, budget: 0, wageBudget: 0,
      boardTrust: tier === 5 && i === 0 ? 28 : 55,
      seasonObjective: tier === 5 && i === 0 ? 'avoid_last' : 'top_half',
      presidentId: null, reputation: rating,
      players: POSITIONS.map((_, j) => newPlayer(`${id}:P${String(j + 1).padStart(2, '0')}`, id, j, rng, rating)) };
    ensureClubPresident(club, seed, presidentIds);
    const { payroll } = ensureClubContracts(club, seed);
    // A deterministic starting reserve covers ~20 weeks; sponsor/expenses are Agent9 inputs.
    club.budget = payroll * 20;
    clubs.push(club);
  }
  return clubs;
}
function buildLeagues(state) {
  const next = {};
  for (const division of DIVISIONS) {
    const clubIds = state.clubs.filter(c => c.divisionId === division.id).map(c => c.id);
    const rules = { ...DEFAULT_RULES, ...(state.rulesByDivision?.[division.id] || {}) };
    next[division.id] = { id: division.id, name: division.name, clubIds, rules,
      fixtures: generateSchedule(clubIds, { divisionId: division.id, season: state.seasonYear,
        seed: state.seed }) };
  }
  state.leagues = next;
  state.maxWeek = Math.max(...Object.values(next).flatMap(l => l.fixtures.map(f => f.round)));
}

export function newCareer(config = {}, seed = 1985) {
  if (!Number.isSafeInteger(seed)) throw new Error('Seed must be a safe integer');
  const clubs = createClubs(config, seed);
  const startClub = config.startClubId ?? 'PROM-01';
  if (!clubs.find(c => c.id === startClub && c.divisionId === 'PROM')) throw new Error('Starting club must be in Promozione');
  const coach = { id: 'coach:player', name: config.coachName || 'Il Mister', clubId: startClub,
    hiredSeason: 1985, reputation: 18, contract: { until: 1986 },
    tactics: { formation: '4-4-2', mentality: 50, pressing: 50, tempo: 50, width: 50, marking: 'zonal' },
    relationships: {}, employmentHistory: [] };
  const state = { schemaVersion: 2, periodLedgerSchemaVersion: PERIOD_LEDGER_SCHEMA,
    seed, seasonYear: 1985, seasonIndex: 0,
    week: 1, absoluteWeek: 1, phase: 'inSeason', clubs, coach,
    presidentCatalogIds: canonicalPresidentIds(config.presidentIds ?? PRESIDENT_PROFILE_IDS),
    leagues: {}, rulesByDivision: config.rulesByDivision || {},
    exchangeCount: config.exchangeCount ?? 1, maxWeek: 0, vacancies: [], offers: [], history: [], log: [] };
  if (!Number.isInteger(state.exchangeCount) || state.exchangeCount < 0) throw new Error('Invalid exchange count');
  buildLeagues(state);
  return state;
}
export function fixturesForWeek(state, week = state.week) {
  return Object.values(state.leagues).flatMap(l => l.fixtures.filter(f => f.round === week));
}
export function getUpcomingFixture(state) {
  if (state.phase !== 'inSeason' || !state.coach.clubId) return null;
  return fixturesForWeek(state).find(f => !f.result && (f.homeId === state.coach.clubId || f.awayId === state.coach.clubId)) || null;
}
function normalizeMatchResult(fixture, supplied) {
  if (!supplied || typeof supplied !== 'object') throw new Error('Match summary required');
  if (supplied.fixtureId !== fixture.id) throw new Error('Fixture ID mismatch');
  if (supplied.homeId && supplied.homeId !== fixture.homeId) throw new Error('Wrong home club');
  if (supplied.awayId && supplied.awayId !== fixture.awayId) throw new Error('Wrong away club');
  const score = supplied.score;
  if (!score || !Number.isSafeInteger(score.home) || !Number.isSafeInteger(score.away) ||
    score.home < 0 || score.away < 0 || score.home > 99 || score.away > 99) throw new Error('Invalid score');
  if (!Array.isArray(supplied.events)) throw new Error('Goal event history required; do not invent a score');
  const goals = { [fixture.homeId]: 0, [fixture.awayId]: 0 };
  const ids = new Set();
  const events = supplied.events.map((event, i) => {
    if (!event || typeof event.type !== 'string') throw new Error('Malformed match event');
    const id = String(event.id ?? `event:${i}`);
    if (ids.has(id)) throw new Error('Repeated event ID');
    ids.add(id);
    if (event.type === 'goal') {
      if (!owned(goals, event.teamId)) throw new Error('Goal for unknown club');
      goals[event.teamId]++;
    }
    return { id, type: event.type, teamId: event.teamId || null,
      playerId: event.playerId || null, t: Number.isFinite(event.t) ? event.t : null,
      detail: event.detail && typeof event.detail === 'object' ? { ...event.detail } : null };
  });
  if (goals[fixture.homeId] !== score.home || goals[fixture.awayId] !== score.away) {
    throw new Error('Score does not match engine goal events');
  }
  // Keep the persistent history compact: per-tick movement/passes belong to Agent 6,
  // while the career needs only authenticated scoring events.
  return { score: { home: score.home, away: score.away }, events: events.filter(e => e.type === 'goal') };
}

export function registerResult(state, matchResult) {
  if (state.phase !== 'inSeason') throw new Error('Season is not accepting results');
  const f = fixturesForWeek(state).find(x => x.id === matchResult?.fixtureId);
  if (!f) throw new Error('Fixture does not belong to current week');
  if (f.result) throw new Error('This fixture was already played');
  const result = normalizeMatchResult(f, matchResult);
  // Validate player references before mutating state.
  const clubIndex = new Map(state.clubs.map(c => [c.id, c]));
  const playerIndex = new Map([f.homeId, f.awayId].flatMap(id => clubIndex.get(id).players.map(p => [p.id, p])));
  for (const e of result.events) if (e.type === 'goal' && e.playerId && !e.detail?.ownGoal) {
    const p = playerIndex.get(e.playerId);
    if (!p || p.teamId !== e.teamId) throw new Error('Invalid goalscorer');
  }
  f.result = result;
  for (const e of result.events) if (e.type === 'goal' && e.playerId && !e.detail?.ownGoal) {
    const p = playerIndex.get(e.playerId); p.stats.seasonGoals++; p.stats.careerGoals++;
  }
  return state;
}

export function addVacancy(state, clubId) {
  if (!state.clubs.some(c => c.id === clubId)) throw new Error('Unknown club');
  if (clubId === state.coach.clubId) throw new Error('Current coach already employed there');
  state.vacancies = [...new Set([...state.vacancies, clubId])];
  createJobOffers(state);
  return state;
}
export function getStandings(state, divisionId) {
  const league = state.leagues[divisionId];
  if (!league) throw new Error('Unknown division');
  return standings(league).map(row => ({ ...row, clubName: state.clubs.find(c => c.id === row.clubId)?.name || row.clubId }));
}
export function advanceWeek(state, options = {}) {
  if (state.phase !== 'inSeason') throw new Error('No active week');
  const fixtures = fixturesForWeek(state);
  if (fixtures.some(f => !f.result)) throw new Error('Complete EVERY fixture before advancing the league week');
  const coachMatch = fixtures.find(f => f.homeId === state.coach.clubId || f.awayId === state.coach.clubId);
  if (coachMatch) {
    const us = coachMatch.homeId === state.coach.clubId ? coachMatch.result.score.home : coachMatch.result.score.away;
    const them = coachMatch.homeId === state.coach.clubId ? coachMatch.result.score.away : coachMatch.result.score.home;
    updateReputation(state.coach, us > them ? 'win' : us === them ? 'draw' : 'loss');
  }
  if (options.boardDecision) applyBoardDecision(state, options.boardDecision);
  if (!Number.isSafeInteger(state.absoluteWeek + 1)) throw new Error('absoluteWeek overflow');
  state.absoluteWeek++;
  state.week++;
  if (state.week > state.maxWeek) state.phase = 'seasonComplete';
  for (const offer of state.offers) if (offer.status === 'open' && offer.expiresWeek < state.week) offer.status = 'expired';
  if (options.vacancyClubIds) for (const id of options.vacancyClubIds) addVacancy(state, id);
  createJobOffers(state);
  return state;
}
export function applyJobOffer(state, offerId) { return takeJobOffer(state, offerId); }
export { applyBoardDecision };

/** Moves one club per representative-tier boundary by default (NOT historical quotas). */
export function finishSeason(state, options = {}) {
  if (state.phase !== 'seasonComplete' || Object.values(state.leagues).some(l => l.fixtures.some(f => !f.result))) {
    throw new Error('All league fixtures must be completed before season rollover');
  }
  normalizeCareerCoach(state.coach, state.seasonYear);
  const tables = Object.fromEntries(DIVISIONS.map(d => [d.id, getStandings(state, d.id)]));
  let assessment = null;
  if (state.coach.clubId) {
    const club = state.clubs.find(c => c.id === state.coach.clubId);
    assessment = seasonAssessment(state.coach, tables[club.divisionId], club.id, club.seasonObjective);
  }
  const movement = promotionRelegation(state.leagues, DIVISIONS.map(d => d.id), state.exchangeCount);
  const snapshot = { season: state.seasonYear, coachClubId: state.coach.clubId,
    coachReputation: state.coach.reputation, assessment, movement,
    tables: Object.fromEntries(Object.entries(tables).map(([id, rows]) => [id, rows.map(r => ({ ...r }))])) };
  state.history.push(snapshot);
  for (const move of movement) state.clubs.find(c => c.id === move.clubId).divisionId = move.to;
  const departingYear = state.seasonYear;
  if (state.coach.clubId && state.coach.contract?.until <= departingYear + 1) {
    const leaving = state.coach.clubId;
    state.coach.employmentHistory.push({ clubId: leaving, start: state.coach.hiredSeason,
      end: departingYear, endWeek: state.week, reason: 'contractExpired' });
    state.coach.clubId = null; state.coach.contract = null;
    state.vacancies = [...new Set([...state.vacancies, leaving])];
  }
  for (const club of state.clubs) for (const player of club.players) {
    player.age++; player.stats.seasonGoals = 0;
  }
  if (options.onRollover) options.onRollover(state.clubs, snapshot);
  if (!Number.isSafeInteger(state.absoluteWeek + 1)) throw new Error('absoluteWeek overflow');
  state.absoluteWeek++; // Off-season transition is a distinct period in the ledger.
  state.seasonYear++; state.seasonIndex++; state.week = 1; state.phase = 'inSeason';
  state.offers = []; state.vacancies = [...new Set(state.vacancies)];
  buildLeagues(state);
  createJobOffers(state);
  return state;
}
