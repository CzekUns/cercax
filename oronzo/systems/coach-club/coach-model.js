import {clamp,copy} from './core.js';

export function createCoach(data) {
  if(!data?.id || !data?.name) throw new Error('coach needs id and name');
  return {
    id:data.id,name:data.name,clubId:data.clubId ?? null,
    reputation:Math.round(clamp(data.reputation ?? 15)),
    appearance:copy(data.appearance ?? {portraitId:'default',jacket:'navy'}),
    contract:copy(data.contract ?? {weeklyWage:0,expiresSeason:'1985-86'}),
    tactics:copy(data.tactics ?? {formation:'4-4-2',mentality:50,pressing:50,tempo:50,width:50,marking:'zonal'}),
    relationships:copy(data.relationships ?? {}),
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
