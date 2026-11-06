import {copy,clamp} from './core.js';

export function prepareMatchday(club, coach, {xi,bench=[],captainId,rules={}}) {
  if(coach.clubId!==club.id) return {accepted:false,reason:'wrong_club'};
  if(!Array.isArray(xi) || xi.length!==11) return {accepted:false,reason:'exactly_11_starters'};
  const chosen=[...xi,...bench];
  if(new Set(chosen).size!==chosen.length || chosen.some(id=>typeof id!=='string' && typeof id!=='number'))
    return {accepted:false,reason:'duplicate_or_invalid_ids'};
  if(bench.length>(rules.maxBench ?? 5)) return {accepted:false,reason:'bench_limit'};
  const roster=new Map(club.players.map(p=>[p.id,p]));
  if(chosen.some(id=>!roster.has(id))) return {accepted:false,reason:'player_not_owned'};
  if(chosen.some(id=>{
    const s=roster.get(id).status||{};
    return s.injuryDays>0 || s.suspensionMatches>0 || s.health===0;
  })) return {accepted:false,reason:'player_unavailable'};
  if(!xi.some(id=>(roster.get(id).positions||[]).some(p=>['GK','POR','goalkeeper'].includes(p))))
    return {accepted:false,reason:'no_goalkeeper'};
  if(!xi.includes(captainId)) return {accepted:false,reason:'captain_not_starting'};
  return {accepted:true,selection:{
    clubId:club.id,coachId:coach.id,xi:[...xi],bench:[...bench],captainId,
    formation:coach.tactics.formation,tactics:copy(coach.tactics)
  }};
}
export function coachCommand(coach,{type,teamId,t,payload={}}) {
  if(teamId!==coach.clubId) return {accepted:false,reason:'team_not_coached'};
  if(!['tacticChange','substitution','shout'].includes(type)) return {accepted:false,reason:'unknown_command'};
  if(t!==undefined && (!Number.isFinite(t)||t<0||t>5400)) return {accepted:false,reason:'invalid_match_time'};
  if(type==='substitution' && (payload.outId==null || payload.inId==null || payload.outId===payload.inId))
    return {accepted:false,reason:'invalid_substitution'};
  if(type==='tacticChange') {
    if(!Object.keys(payload).length || Object.keys(payload).some(k=>!['formation','mentality','pressing','tempo','width','marking'].includes(k)))
      return {accepted:false,reason:'invalid_tactics'};
    for(const k of ['mentality','pressing','tempo','width'])
      if(k in payload && (!Number.isFinite(payload[k]) || payload[k]<0 || payload[k]>100))
        return {accepted:false,reason:'tactic_out_of_range'};
  }
  if(type==='shout' && !['encourage','calm','press','hold_shape','attack','protect_lead'].includes(payload.message))
    return {accepted:false,reason:'unknown_shout'};
  return {accepted:true,command:{type,teamId,...(t===undefined?{}:{t}),payload:copy(payload)}};
  // The match engine must separately accept/reject this command; no direct score edits.
}
export function changeCoachTactics(coach, updates) {
  const request=coachCommand(coach,{type:'tacticChange',teamId:coach.clubId,payload:updates});
  if(!request.accepted) return {accepted:false,reason:request.reason,coach};
  const c=copy(coach);c.tactics={...c.tactics,...updates};
  return {accepted:true,coach:c,command:request.command};
}
