import {integer} from './core.js';

// Career 07 owns calendar migration. A club must use exactly ONE period-key
// domain. Legacy week numbers cannot be silently compared with absolute weeks.
export function periodOf({week,absoluteWeek,seasonYear}={}) {
  if(week===undefined && absoluteWeek===undefined)
    throw new RangeError('week or absoluteWeek required');
  if(week!==undefined) integer(week,'week');
  if(absoluteWeek!==undefined) integer(absoluteWeek,'absoluteWeek');
  if(seasonYear!==undefined) integer(seasonYear,'seasonYear');
  return {
    week:week??absoluteWeek,
    ...(absoluteWeek===undefined?{}:{absoluteWeek}),
    ...(seasonYear===undefined?{}:{seasonYear}),
    key:absoluteWeek!==undefined?'a:'+absoluteWeek:
      seasonYear!==undefined?'s:'+seasonYear+':w:'+week:week
  };
}

export function periodDomain(key) {
  if(Number.isSafeInteger(key)&&key>=0)return 'legacy';
  if(typeof key==='string' && /^a:(0|[1-9][0-9]*)$/.test(key) &&
     Number.isSafeInteger(Number(key.slice(2))))return 'absolute';
  if(typeof key==='string' && /^s:(0|[1-9][0-9]*):w:(0|[1-9][0-9]*)$/.test(key)) {
    const [,year,week]=/^s:([0-9]+):w:([0-9]+)$/.exec(key);
    if(Number.isSafeInteger(Number(year))&&Number.isSafeInteger(Number(week)))
      return 'season';
  }
  return null;
}

export function samePeriod(record,period) {
  if(record?.periodKey!==undefined)return record.periodKey===period.key;
  return typeof period.key==='number' && record?.week===period.week;
}
export function ledgerEntry(period) {
  return {week:period.week,periodKey:period.key,
    ...(period.absoluteWeek===undefined?{}:{absoluteWeek:period.absoluteWeek}),
    ...(period.seasonYear===undefined?{}:{seasonYear:period.seasonYear})};
}

function recordKey(value,legacyField='week') {
  if(!value || typeof value!=='object')return null;
  if(value.periodKey!==undefined)return value.periodKey;
  if(value[legacyField]!==undefined)return value[legacyField];
  return null;
}

// Reject unmigrated ledgers BEFORE financial or governance side effects.
// A domain mismatch is not a retry: the calendar owner must migrate the
// original records with traceable dates and then save them atomically.
export function periodLedgerError(club,period) {
  const domain=periodDomain(period?.key);
  if(!domain)return 'invalid_period_key';
  const f=club?.finance,board=club?.board;
  const keys=[];
  if(f) {
    if(!Array.isArray(f.settledWeeks) || !Array.isArray(f.transactions))
      return 'invalid_period_ledger';
    keys.push(...f.settledWeeks);
    for(const entry of f.transactions) keys.push(recordKey(entry));
  }
  if(board) {
    for(const result of board.results??[])keys.push(recordKey(result));
    for(const notice of board.notices??[]) {
      // Trust/staff notices are audit comments, not period dedupe records.
      if(notice?.periodKey!==undefined ||
         ['meeting','media','narrative_event','dismissal'].includes(notice?.kind))
        keys.push(recordKey(notice));
    }
    for(const promise of board.promises??[])keys.push(recordKey(promise));
    for(const use of Object.values(board.eventsUsed??{}))
      keys.push(recordKey(use,'lastWeek'));
  }
  // null means a malformed or undated record; never infer its old season.
  if(keys.some(key=>periodDomain(key)!==domain))
    return 'period_migration_required';
  return null;
}
