/** R02 bridge: persistent club identity, objective semantics, wage contracts and time. */
import { seededRandom } from './league.js';

// IDs ONLY from oronzo/content/presidents.json (the canonical *profiles* stay owned by Agent 4).
// Reusing a profile for multiple clubs is intentional: office identity is the club ID,
// while presidentId is the shared narrative/behavior archetype. No invented presidents.
export const PRESIDENT_PROFILE_IDS = Object.freeze([
  'gaetano_venturi', 'leandro_berti', 'vittorio_sella', 'arturo_milani',
  'rinaldo_pavesi', 'silvano_righi', 'ernesto_valcavi', 'beatrice_orlandi'
]);

export const BOARD_OBJECTIVES = Object.freeze(['promotion', 'top_half', 'safety', 'avoid_last', 'development']);
const LEGACY_OBJECTIVES = Object.freeze({
  title: 'promotion', topHalf: 'top_half', survival: 'safety', avoidRelegation: 'avoid_last'
});

/** Canonical durable objective for club and board; do not treat unknown inputs as safety. */
export function canonicalObjective(value) {
  const normalized = LEGACY_OBJECTIVES[value] ?? value;
  if (!BOARD_OBJECTIVES.includes(normalized)) throw new Error('Unknown season objective: ' + String(value));
  return normalized;
}

// These figures are explicitly a game economy in nominal ITL, not verified historical wages.
// Source of wage budget is also our initial world: finance.Agent9 owns actual accounting.
export const WEEKLY_WAGE_BASE_ITL = Object.freeze({ PROM: 32000, INTER: 65000, C2: 100000,
  C1: 180000, B: 320000, A: 600000 });

export function wageForPlayer(seed, club, player) {
  const base = WEEKLY_WAGE_BASE_ITL[club.divisionId];
  if (!base) throw new Error('Unknown division for wages: ' + club.divisionId);
  const rng = seededRandom('contract:' + seed + ':' + player.id);
  // 70–119% of base, rounded to the nearest 1000 lire. Stable per ID/seed.
  return Math.max(1000, Math.round(base * (0.70 + rng() * 0.49) / 1000) * 1000);
}

/** Populate only missing contracts. Preserve signed deals; enforce wage ceiling for migrated demo worlds. */
export function ensureClubContracts(club, seed) {
  if (!Array.isArray(club.players)) throw new Error('Invalid roster');
  let migrated = false;
  for (const player of club.players) {
    if (player.contract == null || player.contract.weeklyWage == null) {
      if (player.contract !== undefined && player.contract !== null && (typeof player.contract !== 'object' || Array.isArray(player.contract))) {
        throw new Error('Invalid player contract');
      }
      player.contract = { ...(player.contract || {}), weeklyWage: wageForPlayer(seed, club, player) };
      migrated = true;
    }
    if (!Number.isSafeInteger(player.contract.weeklyWage) || player.contract.weeklyWage < 0) {
      throw new Error('Invalid weekly wage');
    }
  }
  const payroll = club.players.reduce((sum, p) => {
    const n = sum + p.contract.weeklyWage;
    if (!Number.isSafeInteger(n)) throw new Error('Payroll overflow');
    return n;
  }, 0);
  if (migrated) {
    // Existing cap can only increase on FIRST legacy migration; never rewrite agreed wages.
    const proposed = Math.ceil(payroll * 1.20 / 1000) * 1000;
    club.wageBudget = Math.max(club.wageBudget ?? 0, proposed);
  }
  if (!Number.isSafeInteger(club.wageBudget) || club.wageBudget < 0) throw new Error('Invalid wageBudget');
  return { payroll, withinCap: payroll <= club.wageBudget, migrated };
}

export function canonicalPresidentIds(ids = PRESIDENT_PROFILE_IDS) {
  if (!Array.isArray(ids) || !ids.length || ids.some(s => typeof s !== 'string' || !s)) {
    throw new Error('Nonempty president profile IDs required');
  }
  if (new Set(ids).size !== ids.length) throw new Error('Duplicated president profile ID');
  return [...ids];
}

/** Change only legacy synthetic IDs/missing IDs; never shuffle valid assignments on load. */
export function ensureClubPresident(club, seed, profileIds) {
  const assigned = club.presidentId;
  if (typeof assigned === 'string' && profileIds.includes(assigned)) return false;
  if (assigned != null && assigned !== '' && !String(assigned).startsWith('president:')) {
    throw new Error('Unknown persisted presidentId ' + assigned + ' for club ' + club.id);
  }
  const rng = seededRandom('president:' + seed + ':' + club.id);
  club.presidentId = profileIds[Math.floor(rng() * profileIds.length)];
  return true;
}

export function normalizeCareerCoach(coach, seasonYear) {
  if (!coach || typeof coach !== 'object') throw new Error('Coach required');
  if (!Array.isArray(coach.employmentHistory)) coach.employmentHistory = [];
  if (!Number.isInteger(coach.hiredSeason)) coach.hiredSeason = seasonYear;
  if (coach.contract && typeof coach.contract === 'object' && !Number.isInteger(coach.contract.until)) {
    const seasonLabel = coach.contract.expiresSeason;
    const m = typeof seasonLabel === 'string' && /^(\d{4})-(\d{2}|\d{4})$/.exec(seasonLabel);
    if (m) {
      const start = Number(m[1]);
      coach.contract.until = m[2].length === 2 ? Math.floor(start / 100) * 100 + Number(m[2]) : Number(m[2]);
    } else {
      // Legacy Agent9 factory may produce 1985-86 by default. A missing expiry is
      // a *single* season contract, not an infinite silent renewal.
      coach.contract.until = seasonYear + 1;
    }
  }
  return coach;
}

/** In-place migration, suitable after CHECKSUM validation and before state schema validation. */
export function normalizeCareerCompatibility(state) {
  if (!state || !Array.isArray(state.clubs)) throw new Error('Invalid career');
  const ids = canonicalPresidentIds(state.presidentCatalogIds ?? PRESIDENT_PROFILE_IDS);
  state.presidentCatalogIds = ids;
  for (const club of state.clubs) {
    ensureClubPresident(club, state.seed, ids);
    club.seasonObjective = canonicalObjective(club.seasonObjective);
    ensureClubContracts(club, state.seed);
  }
  if (!Number.isSafeInteger(state.absoluteWeek) || state.absoluteWeek < 1) {
    if (!Number.isSafeInteger(state.seasonIndex) || state.seasonIndex < 0 || !Number.isSafeInteger(state.week)) {
      throw new Error('Cannot migrate absolute week');
    }
    // A division has at most 24 teams -> 46 rounds; reserve a 60-week
    // per-season band only when migrating a legacy save with no absolute ledger.
    state.absoluteWeek = state.seasonIndex * 60 + state.week;
  }
  normalizeCareerCoach(state.coach, state.seasonYear);
  return state;
}
