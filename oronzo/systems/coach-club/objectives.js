// Never silently treat an unknown career objective as "safety".
// These are the persisted Career 07 spellings and our older ClubV1 spellings.
export const OBJECTIVES=Object.freeze({
  promotion:'promotion',title:'promotion',
  topHalf:'top_half',top_half:'top_half',
  avoidRelegation:'avoid_last',avoid_last:'avoid_last',
  safety:'safety',survival:'safety',
  development:'development'
});
export function normalizeSeasonObjective(value) {
  if(typeof value!=='string' || !Object.prototype.hasOwnProperty.call(OBJECTIVES,value))
    throw new RangeError('unsupported seasonObjective: '+String(value));
  return OBJECTIVES[value];
}
