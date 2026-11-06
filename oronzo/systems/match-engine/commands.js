import { clamp } from './rng.js';
import { FORMATIONS } from './movement.js';

export const DEFAULT_TACTICS=Object.freeze({
  formation:'4-4-2',mentality:50,pressing:50,tempo:50,width:50,marking:'zonal',
});
export function validateTactics(raw={},base=DEFAULT_TACTICS) {
  if(!raw || typeof raw!=='object' || Array.isArray(raw))throw Error('invalid tactics');
  const out={...base};
  for(const [key,value] of Object.entries(raw)) {
    if(!(key in DEFAULT_TACTICS))throw Error('unknown tactic: '+key);
    if(key==='formation') {
      if(!FORMATIONS[value])throw Error('unsupported formation');
    } else if(key==='marking') {
      if(!['zonal','man'].includes(value))throw Error('invalid marking');
    } else {
      if(!Number.isFinite(value) || value<0 || value>100)throw Error('invalid '+key);
    }
    out[key]=value;
  }
  return out;
}
export function executeCommand(state, command, emit) {
  const reject=reason=>({accepted:false,reason});
  if(!command || typeof command!=='object')return reject('invalid command');
  const team=state.teams.find(x=>x.id===command.teamId);
  if(!team)return reject('unknown team');
  if(state.phase==='fulltime')return reject('match finished');
  if(command.t!==undefined && Math.abs(command.t-state.t)>1e-8)return reject('command timestamp must equal current simulated time');
  const payload=command.payload || {};
  if(command.type==='tacticChange') {
    let tactics;
    try{tactics=validateTactics(payload,team.tactics)}catch(e){return reject(e.message);}
    team.tactics=tactics;
    emit('tacticChange',team.id,null,{tactics:{...tactics}});
    return {accepted:true,effects:{tactics:{...tactics}}};
  }
  if(command.type==='shout') {
    const tone=payload.tone;
    if(!['encourage','focus','calm','push'].includes(tone))return reject('unsupported shout');
    if(team.lastShout!==undefined && state.t-team.lastShout<120)return reject('shout cooldown (120 simulated seconds)');
    team.lastShout=state.t;team.shout={tone,expires:state.t+180};
    emit('shout',team.id,null,{tone,expires:state.t+180});
    return {accepted:true,effects:{expires:team.shout.expires}};
  }
  if(command.type==='substitution') {
    const outId=payload.outId, inId=payload.inId;
    if(typeof outId!=='string'||typeof inId!=='string'||outId===inId)return reject('provide distinct outId/inId');
    if(!team.lineup.includes(outId))return reject('outId not on pitch');
    if(!team.bench.includes(inId))return reject('inId not available on bench');
    if(team.subsUsed>=state.rules.maxSubstitutions)return reject('substitution limit reached');
    const out=state.byId.get(outId), incoming=state.byId.get(inId);
    if(!incoming || incoming.injured || incoming.suspended || incoming.status?.injuryDays>0)return reject('incoming player unavailable');
    if(out.isKeeper!==incoming.positions.includes('GK') && out.isKeeper) return reject('goalkeeper must be replaced by goalkeeper');
    const slot=team.lineup.indexOf(outId);
    team.lineup[slot]=inId;team.bench=team.bench.filter(id=>id!==inId);team.subsUsed++;
    out.active=false;out.hasBall=false;incoming.active=true;incoming.isKeeper=out.isKeeper;
    incoming.x=out.x;incoming.y=out.y;incoming.vx=0;incoming.vy=0;incoming.energy=clamp(100-incoming.fatigue,0,100);
    if(state.ball.ownerId===outId) {state.ball.ownerId=inId;incoming.hasBall=true;}
    emit('substitution',team.id,inId,{outId,inId,used:team.subsUsed,limit:state.rules.maxSubstitutions});
    return {accepted:true,effects:{outId,inId,remaining:state.rules.maxSubstitutions-team.subsUsed}};
  }
  return reject('unsupported command');
}
