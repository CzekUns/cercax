import {integer} from './core.js';

// The caller (Career 07) owns the calendar. Supply absoluteWeek across seasons;
// seasonYear + week is supported for uniqueness, while legacy week alone is
// retained for V1 saves. Never reset a financial ledger during rollover.
export function periodOf({week,absoluteWeek,seasonYear}={}) {
  if(week === undefined && absoluteWeek === undefined) throw new RangeError('week or absoluteWeek required');
  if(week !== undefined) integer(week,'week');
  if(absoluteWeek !== undefined) integer(absoluteWeek,'absoluteWeek');
  if(seasonYear !== undefined) integer(seasonYear,'seasonYear');
  return {
    week: week ?? absoluteWeek,
    ...(absoluteWeek === undefined ? {} : {absoluteWeek}),
    ...(seasonYear === undefined ? {} : {seasonYear}),
    key: absoluteWeek !== undefined ? 'a:'+absoluteWeek :
      seasonYear !== undefined ? 's:'+seasonYear+':w:'+week : week
  };
}
export function samePeriod(record,period) {
  if(record?.periodKey !== undefined) return record.periodKey === period.key;
  // Legacy V1 notices used a bare week and are only comparable to legacy calls.
  return typeof period.key === 'number' && record?.week === period.week;
}
export function ledgerEntry(period) {
  return {week:period.week,periodKey:period.key,
    ...(period.absoluteWeek===undefined?{}:{absoluteWeek:period.absoluteWeek}),
    ...(period.seasonYear===undefined?{}:{seasonYear:period.seasonYear})};
}
