/**
 * R04: one-way, auditable migration of Agent09 V1 numeric/season period ledgers
 * to canonical `a:<absoluteWeek>` keys. No clock guessing, no money effects.
 * Input is a JSON-compatible Career state; caller verifies the save checksum first.
 */
export const PERIOD_LEDGER_SCHEMA = 2;
export const PERIOD_AMBIGUOUS = 'PERIOD_MIGRATION_AMBIGUOUS';
const own = (o, key) => Object.prototype.hasOwnProperty.call(o ?? {}, key);
const validInt = n => Number.isSafeInteger(n) && n >= 0;
const absoluteKey = n => `a:${n}`;

export class PeriodMigrationError extends Error {
  constructor(clubId, path, detail) {
    super(`${PERIOD_AMBIGUOUS} ${clubId}.${path}: ${detail}`);
    this.name = 'PeriodMigrationError';
    this.code = PERIOD_AMBIGUOUS;
    this.clubId = clubId;
    this.recordPath = path;
  }
}
const fail = (club, path, reason) => { throw new PeriodMigrationError(club.id, path, reason); };
const yearFromKey = key => {
  if (typeof key !== 'string') return null;
  const match = /^s:(\d{4}):w:(\d+)$/.exec(key);
  return match ? {year:Number(match[1]), week:Number(match[2])} : null;
};
const absFromKey = key => {
  if (typeof key !== 'string') return null;
  const match = /^a:(\d+)$/.exec(key);
  return match ? Number(match[1]) : null;
};

// Rebuild exact offsets from completed league tables, not from an invented
// 60-weeks-per-season band. If the current absoluteWeek contradicts this
// chronology, preserve it but REFUSE ambiguous conversions of old years.
function chronology(state) {
  const index = state.seasonIndex;
  if (!validInt(index) || !validInt(state.week) || state.week < 1 || !validInt(state.seasonYear)) {
    throw new PeriodMigrationError('career','clock','invalid season/index/week provenance');
  }
  const initialYear = state.seasonYear - index;
  let cursor = 1;
  const starts = new Map();
  let exact = Array.isArray(state.history) && state.history.length >= index;
  if (exact) for (let i=0; i<index; i++) {
    const snap = state.history[i];
    if (snap?.season !== initialYear + i || !snap.tables || typeof snap.tables !== 'object') { exact=false; break; }
    const played = Object.values(snap.tables).flatMap(rows => Array.isArray(rows) ? rows.map(r=>r.played) : []);
    const rounds = played.length ? Math.max(...played) : NaN;
    if (!Number.isSafeInteger(rounds) || rounds < 1) { exact=false; break; }
    starts.set(initialYear+i,cursor);
    cursor += rounds + 1; // final advanceWeek and one finishSeason transition.
    if (!Number.isSafeInteger(cursor)) { exact=false; break; }
  }
  const currentStart = validInt(state.absoluteWeek) && state.absoluteWeek >= state.week
    ? state.absoluteWeek - state.week + 1 : null;
  if (index === 0) {
    starts.clear(); starts.set(state.seasonYear,1);
    exact = currentStart === null || currentStart === 1;
  } else if (exact && currentStart !== null && currentStart !== cursor) {
    exact = false;
  }
  if (exact) starts.set(state.seasonYear,cursor);
  else { starts.clear(); if (currentStart !== null) starts.set(state.seasonYear,currentStart); }
  return {starts,exact,currentStart,derivedAbsoluteWeek:exact ? cursor + state.week - 1 : null};
}

function scopedYear(record, scope, fallbackYear, week, club, path) {
  const fromRecord = record && typeof record === 'object' ? record.seasonYear : undefined;
  const fromKey = record && typeof record === 'object' ? yearFromKey(record.periodKey) : null;
  if (fromKey && fromRecord != null && fromKey.year !== fromRecord) fail(club,path,'conflicting seasonYear and periodKey');
  if (fromKey && fromKey.week !== week) fail(club,path,'conflicting week and periodKey');
  const year = fromRecord ?? fromKey?.year ?? scope?.legacySeasonYear ?? fallbackYear;
  if (!validInt(year) || year < 1900 || year > 2200) fail(club,path,'legacy week lacks documented origin season');
  return year;
}

function toAbsolute(record, scope, fallbackYear, clock, club, path) {
  const primitive = typeof record === 'number' || typeof record === 'string';
  const key = primitive ? record : record?.periodKey;
  const absolute = primitive ? absFromKey(key) : (record?.absoluteWeek ?? absFromKey(key));
  if (absolute !== null && absolute !== undefined) {
    if (!validInt(absolute)) fail(club,path,'invalid absoluteWeek');
    if (key != null && typeof key === 'string' && absFromKey(key) !== null && absFromKey(key) !== absolute)
      fail(club,path,'conflicting absoluteWeek and periodKey');
    if (record?.seasonYear !== undefined && record?.week !== undefined && clock.exact) {
      const start=clock.starts.get(record.seasonYear);
      if (start !== undefined && start+record.week-1 !== absolute)
        fail(club,path,'absoluteWeek disagrees with documented seasonYear/week');
    }
    return {key:absoluteKey(absolute),absoluteWeek:absolute,seasonYear:record?.seasonYear};
  }
  const fromKey = yearFromKey(key);
  let week = typeof record === 'number' ? record : fromKey?.week ?? record?.week;
  if (!validInt(week)) fail(club,path,'invalid or missing legacy week');
  // A bare string other than a canonical or season period key is corrupt.
  if (typeof key === 'string' && !fromKey) fail(club,path,'unrecognized period key');
  const year = scopedYear(primitive ? null : record,scope,fallbackYear,week,club,path);
  const start = clock.starts.get(year);
  if (!validInt(start)) fail(club,path,'origin year is documented but no verified absolute-year offset exists');
  const result = start + week - 1;
  if (!Number.isSafeInteger(result) || result < 0) fail(club,path,'invalid absolute conversion');
  return {key:absoluteKey(result),absoluteWeek:result,seasonYear:year};
}
function convertedRecord(record, scope, fallbackYear, clock, club, path, referenceWeek) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) fail(club,path,'invalid ledger entry');
  if (record.periodKey != null && typeof record.periodKey === 'string' && absFromKey(record.periodKey) != null) return record;
  const forPeriod = record.week !== undefined ? record : referenceWeek !== undefined ? {...record,week:referenceWeek} : record;
  const p = toAbsolute(forPeriod,scope,fallbackYear,clock,club,path);
  return {...record,legacyPeriod:record.legacyPeriod ?? {
      ...(record.week === undefined ? {} : {week:record.week}),
      ...(record.lastWeek === undefined ? {} : {lastWeek:record.lastWeek}),
      periodKey:record.periodKey ?? null
    },periodKey:p.key,absoluteWeek:p.absoluteWeek,seasonYear:p.seasonYear};
}

function financeYearsByWeek(finance) {
  const byWeek = new Map();
  for (const transaction of finance?.transactions ?? []) {
    // Salary entries corroborate which season a numeric settledWeeks entry represents.
    if (transaction?.note !== 'wages' || !validInt(transaction.week)) continue;
    const year=transaction.seasonYear ?? yearFromKey(transaction.periodKey)?.year;
    if (validInt(year)) byWeek.set(transaction.week,
      new Set([...(byWeek.get(transaction.week)??[]),year]));
  }
  return byWeek;
}
function financeMigrate(finance,club,clock,state) {
  if (!finance) return finance;
  if (!Array.isArray(finance.settledWeeks) || !Array.isArray(finance.transactions)) fail(club,'finance','invalid financial ledger');
  const scope = finance.periodMigration ?? {};
  const salaryYears = financeYearsByWeek(finance);
  const originalWeeks = finance.settledWeeks;
  let touched=false;
  const settledWeeks=originalWeeks.map((value,i)=>{
    if (absFromKey(value) != null) return value;
    const candidate=salaryYears.get(value);
    const documentedYear = candidate?.size===1 ? [...candidate][0] : undefined;
    if (candidate?.size>1) fail(club,`finance.settledWeeks[${i}]`,'multiple possible salary seasons');
    const from=scope.legacySeasonYear ?? (state.seasonIndex===0?state.seasonYear:documentedYear);
    const p=toAbsolute(value,scope,from,clock,club,`finance.settledWeeks[${i}]`);
    touched=true; return p.key;
  });
  const transactions=finance.transactions.map((t,i)=>{
    if (typeof t?.periodKey === 'string' && absFromKey(t.periodKey)!==null) return t;
    touched=true;
    // Match undated transaction rows to a SINGLE documented wage settlement
    // for that week, if available. Mixed years are deliberately non-migrable.
    const witness=salaryYears.get(t?.week);
    if (witness?.size>1 && t?.seasonYear===undefined)
      fail(club,`finance.transactions[${i}]`,'conflicting recorded salary seasons');
    const year=scope.legacySeasonYear ?? (state.seasonIndex===0?state.seasonYear:
      witness?.size===1?[...witness][0]:undefined);
    return convertedRecord(t,scope,year,clock,club,`finance.transactions[${i}]`);
  });
  return touched ? {...finance,settledWeeks,transactions,
    periodMigration:{...scope,schemaVersion:PERIOD_LEDGER_SCHEMA,originalSettledWeeks:scope.originalSettledWeeks??[...originalWeeks],
      conversion:'explicit_calendar_year_or_unambiguous_first_season'}} : finance;
}
function boardMigrate(board,club,clock,state) {
  if (!board) return board;
  if (typeof board!=='object' || Array.isArray(board)) fail(club,'board','invalid board ledger');
  const scope=board.periodMigration??{};
  const fallback=scope.legacySeasonYear ?? (state.seasonIndex===0?state.seasonYear:undefined);
  let touched=false;
  const mapArray=(items,path)=> {
    if (items===undefined) return items;
    if (!Array.isArray(items)) fail(club,`board.${path}`,'invalid event list');
    return items.map((record,i)=>{
      if (typeof record?.periodKey === 'string' && absFromKey(record.periodKey)!==null) return record;
      touched=true;return convertedRecord(record,scope,fallback,clock,club,`board.${path}[${i}]`);
    });
  };
  const results=mapArray(board.results,'results');
  // Agent09's periodLedgerError deliberately excludes legacy trust/staff audit
  // annotations: they do not gate per-week effects, and old rows may lack a
  // provable season. Do not invent one for these non-deduplication comments.
  if (board.notices!==undefined && !Array.isArray(board.notices))
    fail(club,'board.notices','invalid event list');
  const notices=board.notices?.map((record,i)=>{
    if (record?.periodKey === undefined && ['trust','staff'].includes(record?.kind)) return record;
    if (typeof record?.periodKey === 'string' && absFromKey(record.periodKey)!==null) return record;
    touched=true;return convertedRecord(record,scope,fallback,clock,club,`board.notices[${i}]`);
  });
  const promises=mapArray(board.promises,'promises');
  // Past cooldowns contain `lastWeek` instead of `week`.
  let eventsUsed=board.eventsUsed;
  if(eventsUsed!==undefined){
    if (!eventsUsed || typeof eventsUsed!=='object' || Array.isArray(eventsUsed)) fail(club,'board.eventsUsed','invalid event ledger');
    eventsUsed=Object.fromEntries(Object.entries(eventsUsed).map(([id,event])=>{
      if (typeof event?.periodKey === 'string' && absFromKey(event.periodKey)!==null) return [id,event];
      touched=true;
      return [id,convertedRecord(event,scope,fallback,clock,club,`board.eventsUsed.${id}`,event?.lastWeek)];
    }));
  }
  const mappedPromises=promises?.map((p,i)=>{
    let converted=p;
    if (p.dueAbsoluteWeek===undefined && p.dueWeek!==undefined) {
      if (!validInt(p.dueWeek) || p.dueWeek<1 || !validInt(p.week) || p.week<1 || p.dueWeek<p.week)
        fail(club,`board.promises[${i}]`,'legacy promise has ambiguous deadline');
      touched=true;
      converted={...converted,dueAbsoluteWeek:p.absoluteWeek+(p.dueWeek-p.week)};
    }
    if (p.resolvedWeek!==undefined && p.resolvedPeriodKey===undefined) {
      const resolvedYear=p.resolvedSeasonYear ?? (p.resolvedWeek>=p.week?p.seasonYear:undefined);
      if (!validInt(resolvedYear)) fail(club,`board.promises[${i}]`,'resolved promise year unproven');
      const resolved=toAbsolute({week:p.resolvedWeek,seasonYear:resolvedYear},scope,undefined,
        clock,club,`board.promises[${i}].resolvedPeriodKey`);
      converted={...converted,resolvedPeriodKey:resolved.key,
        resolvedAbsoluteWeek:resolved.absoluteWeek,resolvedSeasonYear:resolvedYear};
      touched=true;
    }
    return converted;
  });
  return touched ? {...board,results,notices,promises:mappedPromises,eventsUsed,
    periodMigration:{...scope,schemaVersion:PERIOD_LEDGER_SCHEMA,
      conversion:'explicit_calendar_year_or_unambiguous_first_season'}} : board;
}

/** Safe to call on every load: only legacy entries are migrated; all changes commit atomically. */
export function migratePeriodLedgers(state) {
  if (!state || !Array.isArray(state.clubs)) throw new Error('Invalid career state');
  const clock=chronology(state);
  // A missing clock is reconstructible only when the entire completed history proves it.
  if (!validInt(state.absoluteWeek)) {
    if (!validInt(clock.derivedAbsoluteWeek)) throw new PeriodMigrationError('career','absoluteWeek','unverifiable legacy clock');
  }
  const migrated=state.clubs.map(club=>({
    finance:financeMigrate(club.finance,club,clock,state),
    board:boardMigrate(club.board,club,clock,state)
  }));
  // Apply only after every record in every club passed, preserving original data on failure.
  migrated.forEach((p,i)=>{
    if (p.finance!==undefined) state.clubs[i].finance=p.finance;
    if (p.board!==undefined) state.clubs[i].board=p.board;
  });
  if (!validInt(state.absoluteWeek)) state.absoluteWeek=clock.derivedAbsoluteWeek;
  state.periodLedgerSchemaVersion=PERIOD_LEDGER_SCHEMA;
  return state;
}
