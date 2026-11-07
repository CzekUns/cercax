import {clamp,copy} from './core.js';

const TRAIT_KEYS = ['luck','leadership','selfEsteem','patience'];
const RELATIONSHIP_KEYS = ['board','squad','fans','media'];
function score(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > 100)
    throw new RangeError(label + ' must be an integer 0..100');
  return value;
}

export function createCoach(data) {
  if(!data?.id || !data?.name) throw new Error('coach needs id and name');
  const saved=copy(data); // Keep career-owned fields and any future schema additions.
  if(saved.employmentHistory !== undefined && !Array.isArray(saved.employmentHistory))
    throw new TypeError('employmentHistory must be an array');
  if(saved.hiredSeason !== undefined && saved.hiredSeason !== null &&
     !Number.isSafeInteger(saved.hiredSeason)) throw new RangeError('invalid hiredSeason');
  if (saved.origin !== undefined && saved.origin !== null &&
      (typeof saved.origin !== 'object' || Array.isArray(saved.origin)))
    throw new TypeError('origin must be an object or null');
  if (saved.traits !== undefined && (!saved.traits || typeof saved.traits !== 'object' || Array.isArray(saved.traits)))
    throw new TypeError('traits must be an object');
  const traits = {...(saved.traits ?? {})};
  for (const key of TRAIT_KEYS) traits[key] = score(traits[key] ?? 50, 'traits.'+key);
  if (saved.relationships !== undefined && (!saved.relationships || typeof saved.relationships !== 'object' || Array.isArray(saved.relationships)))
    throw new TypeError('relationships must be an object');
  const relationships={...(saved.relationships ?? {})};
  for (const key of RELATIONSHIP_KEYS) relationships[key]=score(relationships[key] ?? 50,'relationships.'+key);
  if (relationships.playerTrustById !== undefined) {
    if (!relationships.playerTrustById || typeof relationships.playerTrustById !== 'object' || Array.isArray(relationships.playerTrustById))
      throw new TypeError('relationships.playerTrustById must be an object');
    for (const [id,value] of Object.entries(relationships.playerTrustById))
      score(value,'relationships.playerTrustById.'+id);
  } else relationships.playerTrustById={};
  const morale=score(saved.morale ?? 50,'morale');
  if (saved.moraleEvents !== undefined && (!Array.isArray(saved.moraleEvents) ||
      saved.moraleEvents.some(x=>!x || typeof x.eventId!=='string' || !x.eventId)))
    throw new TypeError('moraleEvents must contain eventId entries');
  const gameOver=saved.gameOver ?? (morale === 0 ? {eventId:'legacy:morale_zero',reason:'morale_zero',date:null} : null);
  if(gameOver !== null && (typeof gameOver !== 'object' || typeof gameOver.eventId !== 'string' || !gameOver.eventId))
    throw new TypeError('gameOver requires eventId');
  return {
    ...saved,
    id:data.id,name:data.name,clubId:data.clubId ?? null,
    hiredSeason:data.hiredSeason ?? null,
    employmentHistory:copy(data.employmentHistory ?? []),
    reputation:Math.round(clamp(data.reputation ?? 15)),
    appearance:copy(data.appearance ?? {portraitId:'default',jacket:'navy'}),
    // Preserve contract.until from Career 07. No phantom expiresSeason field.
    contract:copy(data.contract ?? null),
    tactics:copy(data.tactics ?? {formation:'4-4-2',mentality:50,pressing:50,tempo:50,width:50,marking:'zonal'}),
    origin:copy(saved.origin ?? null),
    traits, morale:gameOver ? 0 : morale, gameOver:copy(gameOver),
    moraleEvents:copy(saved.moraleEvents ?? []),
    relationships,
    trainingPlan:copy(data.trainingPlan ?? null)
  };
}
export function updateRelationship(coach, contactId, delta, reason='conversation') {
  if(!contactId) throw new Error('contactId required');
  const c=copy(coach);
  const old=c.relationships[contactId] ?? 50;
  c.relationships[contactId]=Math.round(clamp(old+delta));
  return {coach:c,reason,was:old,now:c.relationships[contactId]};
}
export function recordCoachReputation(coach, delta) {
  const c=copy(coach); c.reputation=Math.round(clamp(c.reputation+delta));return c;
}
export function chooseTrainingPlan(coach,{week,focus,intensity=50}) {
  if(!Number.isSafeInteger(week)||week<0) throw new Error('valid week required');
  if(!['fitness','technique','tactics','recovery','teamwork'].includes(focus)) throw new Error('unknown focus');
  const c=copy(coach);
  if(c.trainingPlan?.week===week) return {accepted:false,reason:'already_planned',coach};
  c.trainingPlan={week,focus,intensity:Math.round(clamp(intensity))};
  // Attributes agent owns the actual training effects.
  return {accepted:true,coach:c,plan:c.trainingPlan};
}
