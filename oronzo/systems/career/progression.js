/** Coach reputation and employment: board trust and financial decisions belong to Agent 9. */
import { canonicalObjective, normalizeCareerCoach } from './compat.js';
export const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const ACCESS = { PROM: 0, INTER: 22, C2: 35, C1: 48, B: 62, A: 78 };

export function updateReputation(coach, resultForCoach) {
  if (!coach || !resultForCoach) return;
  const change = resultForCoach === 'win' ? 0.75 : resultForCoach === 'draw' ? 0.10 : -0.30;
  coach.reputation = Math.round(clamp(coach.reputation + change) * 100) / 100;
}
export function seasonAssessment(coach, table, clubId, objective = 'safety') {
  const canonical = canonicalObjective(objective);
  const row = table.find(r => r.clubId === clubId);
  if (!row) return null;
  const size = table.length;
  // Same original thresholds after mapping: top half = ceil(size/2),
  // safety/avoid-last = avoid final place; promotional goal = first place.
  const thresholds = { promotion: 1, top_half: Math.ceil(size / 2),
    safety: Math.max(1, size - 1), avoid_last: Math.max(1, size - 1) };
  const fulfilled = canonical === 'development' ? null : row.position <= thresholds[canonical];
  if (coach && fulfilled !== null) coach.reputation = Math.round(clamp(coach.reputation + (fulfilled ? 2 : -1)) * 100) / 100;
  return { objective: canonical, position: row.position, fulfilled };
}

export function createJobOffers(state) {
  const clubIndex = new Map(state.clubs.map(c => [c.id, c]));
  const existing = new Set(state.offers.filter(o => o.status === 'open').map(o => o.clubId));
  const candidates = [...state.vacancies].filter(id => id !== state.coach.clubId && !existing.has(id))
    .map(id => clubIndex.get(id)).filter(Boolean).filter(c => state.coach.reputation >= (ACCESS[c.divisionId] ?? 100));
  // Stable ordering; no randomness/phantom clubs and no artificial job vacancies.
  candidates.sort((a, b) => ACCESS[b.divisionId] - ACCESS[a.divisionId] || a.id.localeCompare(b.id));
  for (const club of candidates.slice(0, 4)) state.offers.push({
    id: `offer:${state.absoluteWeek}:${club.id}`, clubId: club.id,
    createdWeek: state.week, expiresWeek: state.week + 6,
    createdAbsoluteWeek: state.absoluteWeek, expiresAbsoluteWeek: state.absoluteWeek + 6, status: 'open',
    proposedContract: { until: state.seasonYear + 1 }
  });
  return state.offers.filter(o => o.status === 'open');
}

/** Input from Agent 9. This module never derives a dismissal from points or boardTrust. */
export function applyBoardDecision(state, decision) {
  if (!decision) return state;
  normalizeCareerCoach(state.coach, state.seasonYear);
  const { type, clubId } = decision;
  if (clubId !== state.coach.clubId || !clubId) throw new Error('Board decision club does not employ coach');
  if (type === 'dismiss') {
    state.coach.employmentHistory.push({ clubId, start: state.coach.hiredSeason, end: state.seasonYear,
      endWeek: state.week, reason: 'dismissed' });
    state.coach.clubId = null; state.coach.contract = null;
    state.vacancies = [...new Set([...state.vacancies, clubId])];
    state.log.push({ type: 'dismissal', season: state.seasonYear, week: state.week, clubId });
  } else if (type === 'renew') {
    if (!Number.isInteger(decision.until) || decision.until <= state.seasonYear) throw new Error('Invalid renewal year');
    state.coach.contract = { until: decision.until };
    state.log.push({ type: 'renewal', season: state.seasonYear, week: state.week, clubId, until: decision.until });
  } else if (type !== 'retain') throw new Error('Unknown board decision');
  return state;
}

export function takeJobOffer(state, offerId) {
  const offer = state.offers.find(o => o.id === offerId);
  if (!offer || offer.status !== 'open' ||
      (offer.expiresAbsoluteWeek ?? (state.absoluteWeek + offer.expiresWeek - state.week)) < state.absoluteWeek)
    throw new Error('Offer missing or expired');
  normalizeCareerCoach(state.coach, state.seasonYear);
  const club = state.clubs.find(c => c.id === offer.clubId);
  if (!club || !state.vacancies.includes(club.id)) throw new Error('Position is no longer vacant');
  const previous = state.coach.clubId;
  if (previous) {
    state.coach.employmentHistory.push({ clubId: previous, start: state.coach.hiredSeason,
      end: state.seasonYear, endWeek: state.week, reason: 'resigned' });
    state.vacancies.push(previous);
  }
  state.coach.clubId = club.id;
  state.coach.hiredSeason = state.seasonYear;
  state.coach.contract = { ...offer.proposedContract };
  state.vacancies = [...new Set(state.vacancies.filter(id => id !== club.id))];
  for (const o of state.offers) if (o.status === 'open') o.status = o.id === offerId ? 'accepted' : 'declined';
  state.log.push({ type: 'appointment', season: state.seasonYear, week: state.week,
    clubId: club.id, previousClubId: previous });
  return state;
}
