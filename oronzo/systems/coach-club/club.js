import {copy,clamp,integer,uniqueIds} from './core.js';
import {initializeFinances,weeklyPayroll} from './finance.js';

export function createClub(data, finances={}) {
  if(!data?.id || !data?.name || !data?.presidentId) throw new Error('club requires id, name and presidentId');
  const club={
    id:data.id,name:data.name,divisionId:data.divisionId ?? 'promotion',
    budget:integer(data.budget ?? 0,'budget'),wageBudget:integer(data.wageBudget ?? 0,'wageBudget'),
    boardTrust:Math.round(clamp(data.boardTrust ?? 65)),seasonObjective:data.seasonObjective ?? 'safety',
    presidentId:data.presidentId,players:copy(data.players ?? []),
    staff:copy(data.staff ?? {sportingDirector:{competence:55,loyalty:55}}),
    reputation:Math.round(clamp(data.reputation ?? 30)),
    board:copy(data.board ?? {status:'employed',winStreak:0,lossStreak:0,results:[],lastMatchIds:[],weeksUnderPressure:0,notices:[],promises:[],eventsUsed:{}}),
    market:copy(data.market ?? {requests:[]})
  };
  uniqueIds(club.players,'roster');
  if(weeklyPayroll(club)>club.wageBudget) throw new Error('initial payroll exceeds wage ceiling');
  return initializeFinances({...club,finance:data.finance},finances);
}
export function cloneClub(club) { return copy(club); }
export function setObjective(club, objective) {
  if(!['promotion','top_half','safety','avoid_last','development'].includes(objective)) throw new Error('unknown objective');
  const c=copy(club);c.seasonObjective=objective;return c;
}
export function applyTrust(club, change, reason, week=0) {
  const c=copy(club);
  c.boardTrust=Math.round(clamp(c.boardTrust + change));
  c.board.notices.push({week,kind:'trust',change,reason,boardTrust:c.boardTrust});
  return c;
}
export function registerStaffDecision(club, {memberId,decision,week=0}) {
  const c=copy(club); const staff=c.staff?.[memberId];
  if(!staff) return {accepted:false,reason:'unknown_staff',club};
  if(!['support','challenge','consult'].includes(decision)) return {accepted:false,reason:'invalid_decision',club};
  staff.loyalty=Math.round(clamp((staff.loyalty ?? 50)+(decision==='support'?3:decision==='challenge'?-4:1)));
  c.board.notices.push({week,kind:'staff',memberId,decision});
  return {accepted:true,club:c};
}
