/** Versioned, checksummed, two-slot browser save with import/export and recovery. */
import { normalizeCareerCompatibility, canonicalObjective } from './compat.js';
import { migratePeriodLedgers, PERIOD_LEDGER_SCHEMA, PERIOD_AMBIGUOUS } from './period-migration.js';
export const SAVE_VERSION = 2;
export const SAVE_KIND = 'ORONZO_CAREER';
function digest(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
export function validateCareer(state) {
  if (!state || state.schemaVersion !== SAVE_VERSION || !Number.isInteger(state.seasonYear) ||
    !Number.isInteger(state.week) || !['inSeason', 'seasonComplete'].includes(state.phase) ||
    !Array.isArray(state.clubs) || !state.clubs.length || !state.coach ||
    !state.leagues || !Array.isArray(state.history) || !Array.isArray(state.offers) || !Array.isArray(state.vacancies)) {
    throw new Error('Invalid or unsupported career data');
  }
  if (!Number.isSafeInteger(state.absoluteWeek) || state.absoluteWeek < 1) throw new Error('Invalid absoluteWeek');
  if (state.periodLedgerSchemaVersion !== PERIOD_LEDGER_SCHEMA) throw new Error('Unmigrated period ledger');
  const ids = new Set(state.clubs.map(c => c.id));
  if (ids.size !== state.clubs.length || (state.coach.clubId && !ids.has(state.coach.clubId))) {
    throw new Error('Corrupted clubs or coach reference');
  }
  const players = new Set(), fixtureIds = new Set();
  for (const club of state.clubs) {
    if (!Array.isArray(club.players) || !state.presidentCatalogIds?.includes(club.presidentId)) throw new Error('Invalid club roster or president');
    canonicalObjective(club.seasonObjective);
    let payroll = 0;
    for (const p of club.players) {
      if (players.has(p.id) || p.teamId !== club.id) throw new Error('Duplicate or misassigned footballer');
      players.add(p.id);
      if (!Number.isSafeInteger(p.contract?.weeklyWage) || p.contract.weeklyWage < 0) throw new Error('Invalid wage');
      payroll += p.contract.weeklyWage;
      if (!Number.isSafeInteger(payroll)) throw new Error('Invalid payroll');
    }
    if (payroll > club.wageBudget) throw new Error('Payroll exceeds wageBudget');
  }
  if (!Array.isArray(state.coach.employmentHistory) || !Number.isInteger(state.coach.hiredSeason)) throw new Error('Invalid coach employment');
  for (const league of Object.values(state.leagues)) {
    if (!Array.isArray(league.clubIds) || !Array.isArray(league.fixtures) ||
      league.clubIds.some(id => !ids.has(id))) throw new Error('Invalid league');
    for (const f of league.fixtures) {
      if (fixtureIds.has(f.id) || !league.clubIds.includes(f.homeId) ||
        !league.clubIds.includes(f.awayId) || f.homeId === f.awayId) throw new Error('Invalid fixture');
      fixtureIds.add(f.id);
    }
  }
  return state;
}
export function migrateState(state) {
  if (state?.schemaVersion === 1) {
    // Only a known V1 career shape can migrate; the unrelated oronzo_v01 demo is NOT this schema.
    state = { ...state, schemaVersion: 2, history: state.history || [],
      offers: state.offers || [], vacancies: state.vacancies || [], log: state.log || [] };
  }
  return validateCareer(normalizeCareerCompatibility(state));
}
export function serialize(state, { sequence = 0 } = {}) {
  // Canonicalize any newly supplied legacy week records before writing.
  // If their season cannot be proven, fail WITHOUT overwriting old storage.
  migratePeriodLedgers(state);
  validateCareer(state);
  const data = JSON.stringify(state);
  if (!Number.isSafeInteger(sequence) || sequence < 0) throw new Error('Invalid save sequence');
  return JSON.stringify({ kind: SAVE_KIND, version: SAVE_VERSION, sequence,
    checksum: digest(data), data: state });
}
export function deserialize(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
  if (!parsed || parsed.kind !== SAVE_KIND || ![1, 2].includes(parsed.version)) throw new Error('Unknown save format');
  if (!parsed.data || typeof parsed.data !== 'object') throw new Error('No career in save');
  if (digest(JSON.stringify(parsed.data)) !== parsed.checksum) throw new Error('Save checksum mismatch');
  if (parsed.version !== parsed.data.schemaVersion) throw new Error('Version mismatch');
  // Detached result: mutating a loaded career cannot modify the imported object.
  return migrateState(JSON.parse(JSON.stringify(parsed.data)));
}

/** Storage API: getItem, setItem, removeItem. Never overwrite both slots in one save. */
export function createSaveManager(storage, key = 'oronzo.career.v2') {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    throw new Error('Storage provider required');
  }
  const activeKey = `${key}:active`, slots = [`${key}:A`, `${key}:B`];
  const read = (index) => {
    try {
      const raw = storage.getItem(slots[index]);
      if (!raw) return null;
      const envelope = JSON.parse(raw);
      return { state: deserialize(envelope), sequence: envelope.sequence ?? 0, slot: index };
    } catch (error) {
      if (error?.code === PERIOD_AMBIGUOUS) return { blocked: error, slot: index };
      return null;
    }
  };
  return {
    save(state) {
      const copies = [read(0), read(1)];
      const blocked = copies.find(copy => copy?.blocked);
      if (blocked) throw blocked.blocked; // Preserve raw legacy bytes for explicit recovery.
      const existing = copies.filter(Boolean);
      const active = storage.getItem(activeKey);
      // Never overwrite the sole recoverable copy, even if :active points to
      // a corrupt slot. Without a reliable active pointer, replace the older copy.
      const target = !copies[0] ? 0 : !copies[1] ? 1 :
        active === 'A' ? 1 : active === 'B' ? 0 :
        copies[0].sequence <= copies[1].sequence ? 0 : 1;
      const sequence = Math.max(0, ...existing.map(x => x.sequence)) + 1;
      const contents = serialize(state, { sequence });
      storage.setItem(slots[target], contents); // If quota throws, active pointer is still intact.
      if (!read(target) || read(target).sequence !== sequence) throw new Error('Save verification failed');
      storage.setItem(activeKey, target === 0 ? 'A' : 'B');
      return { sequence, slot: target === 0 ? 'A' : 'B' };
    },
    load() {
      const active = storage.getItem(activeKey);
      const preferred = active === 'A' ? 0 : active === 'B' ? 1 : -1;
      const both = [read(0), read(1)];
      const valid = both.filter(copy => copy?.state);
      const good = preferred >= 0 && both[preferred]?.state ? both[preferred] :
        valid.sort((a, b) => b.sequence - a.sequence)[0];
      if (!good) {
        const blocked = both.find(copy => copy?.blocked);
        if (blocked) throw blocked.blocked;
      }
      return good ? { state: good.state, recovered: good.slot !== preferred,
        sequence: good.sequence } : null;
    },
    export(state) { return serialize(state); },
    import(json) { return deserialize(json); }
  };
}
