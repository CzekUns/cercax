import { clamp, meters, stat, conditionFactor } from './rng.js';
import { direction, resetPositions } from './movement.js';
import { individualPerformanceFactor } from './orders.js';

const opponent=(state,teamId)=>state.teams.find(t=>t.id!==teamId);
const pick=(state,team)=>team.lineup.map(id=>state.byId.get(id)).filter(p=>p?.active);
const keeper=(state,team)=>pick(state,team).find(p=>p.isKeeper) || pick(state,team)[0];
const nearest=(players,point,filter=()=>true)=>players.filter(filter).sort((a,b)=>meters(a,point)-meters(b,point))[0];
const skill=(p,g,k)=>stat(p,g,k);
const d100=(state)=>state.rng.next()*100;
function owns(state,p) {
  // An assist candidate survives only if the intended receiver keeps possession.
  if(!p || (state.lastAssist &&
      (p.id!==state.lastAssist.receiverId || p.teamId!==state.lastAssist.teamId)))
    state.lastAssist=null;
  for(const other of state.byId.values())other.hasBall=false;
  state.ball.ownerId=p?.id ?? null;
  if(p) {
    p.hasBall=true;state.possessingTeamId=p.teamId;
    state.ball.x=p.x;state.ball.y=p.y;state.ball.height=0;
    state.ball.vx=0;state.ball.vy=0;
  } else state.possessingTeamId=null;
}
function startFlight(state,kind,from,to,duration,extra={}) {
  // A fresh pass begins a new potential assist chain.
  if(kind==='pass')state.lastAssist=null;
  state.ball.flight={kind,from:{x:from.x,y:from.y},to:{x:clamp(to.x,.01,.99),y:clamp(to.y,.025,.975)},
    elapsed:0,duration:Math.max(.5,duration),...extra};
  state.ball.ownerId=null;
  from.hasBall=false;
  state.ball.vx=(to.x-from.x)/duration;
  state.ball.vy=(to.y-from.y)/duration;
  state.possessingTeamId=from.teamId;
  state.ball.height=0;
}
function clearFlight(state) {state.ball.flight=null;state.ball.vx=0;state.ball.vy=0;state.ball.height=0;}
function restart(state, teamId, point, emit, type=null, detail={}) {
  state.lastAssist=null;
  const team=state.teams.find(t=>t.id===teamId);
  const candidates=pick(state,team);
  const receiver=nearest(candidates,point,p=>!p.injured) || candidates[0];
  clearFlight(state);
  if(receiver) {
    receiver.x=clamp(point.x,.015,.985);receiver.y=clamp(point.y,.035,.965);
    owns(state,receiver);
    state.actionCooldown=2;
  }
  if(type)emit(type,teamId,receiver?.id??null,detail);
}
export function kickoff(state,teamId,emit) {
  state.lastAssist=null;
  clearFlight(state);
  resetPositions(state);
  const team=state.teams.find(t=>t.id===teamId);
  const forward=pick(state,team).filter(p=>!p.isKeeper).sort((a,b)=>
    direction(state,teamId)*(b.x-a.x))[0];
  // place ball legally at centre, not at the striker's previous location.
  if(forward){forward.x=.5;forward.y=.5;owns(state,forward);}
  state.ball.x=.5;state.ball.y=.5;state.actionCooldown=3;
  emit('kickoff',teamId,forward?.id??null,{period:state.t<2700?1:2});
}
function secondLastLine(state,defenders,dir) {
  const xs=defenders.map(p=>p.x).sort((a,b)=>dir===1?b-a:a-b);
  return xs[1] ?? (dir===1?1:0);
}
function isOffside(state,passer,receiver) {
  const dir=direction(state,passer.teamId);
  if(dir*(receiver.x-.5)<=0)return false;
  if(dir*(receiver.x-passer.x)<=.003)return false;
  const line=secondLastLine(state,pick(state,opponent(state,passer.teamId)),dir);
  return dir*(receiver.x-line)>.004;
}
function scoreReceiver(state,p,receiver,team) {
  const dir=direction(state,team.id);
  const defenders=pick(state,opponent(state,team.id));
  const nearestDef=nearest(defenders,receiver);
  const space=nearestDef?Math.min(16,meters(nearestDef,receiver)):12;
  const forward=dir*(receiver.x-p.x)*105;
  const gap=meters(p,receiver);
  const tempo=team.tactics.tempo/100;
  return forward*(.22+tempo*.24)+space*.6-gap*.12+
    skill(receiver,'technical','control')*.11+skill(receiver,'mental','teamwork')*.06+
    (state.rng.next()-.5)*11;
}
function pass(state,p,emit) {
  const team=state.teams.find(t=>t.id===p.teamId), dir=direction(state,p.teamId);
  const options=pick(state,team).filter(q=>q.id!==p.id && meters(p,q)>3 && meters(p,q)<48);
  if(!options.length){dribble(state,p,emit);return;}
  const onside=options.filter(q=>!isOffside(state,p,q));
  if(!onside.length){dribble(state,p,emit);return;}
  const choices=state.rng.next()>.012?onside:options;
  const ordered=choices.map(q=>({p:q,s:scoreReceiver(state,p,q,team)}))
    .sort((a,b)=>b.s-a.s);
  const receiver=ordered[0].p;
  // Occasional over-eager forward run, determined before the pass is released.
  // A pacey runner may move beyond the second-last defender too soon.
  if(direction(state,p.teamId)*(receiver.x-.5)>0 &&
      state.rng.next()<clamp(.014+(team.tactics.tempo-50)*.00038,.006,.045)) {
    receiver.x=clamp(receiver.x+direction(state,p.teamId)*.024,.02,.98);
  }
  if(isOffside(state,p,receiver)) {
    emit('offside',p.teamId,receiver.id,{passerId:p.id});
    const defending=opponent(state,p.teamId);
    restart(state,defending.id,{x:receiver.x,y:receiver.y},emit);
    return;
  }
  const gap=meters(p,receiver), accuracy=.68+skill(p,'technical','passing')*.002+
    skill(p,'technical','decisions')*.00125-p.fatigue*.0016+
    (skill(p,'mental','morale')-50)*.0007+
    (skill(p,'mental','confidence')-50)*.0009+
    (team.shout?.tone==='focus'?.06:0);
  const isAccurate=state.rng.next()<clamp(accuracy*conditionFactor(p)*
    individualPerformanceFactor(p,state.t),.27,.97);
  const lead=dir*clamp(gap/105*.12,0,.026);
  let target={x:clamp(receiver.x+lead,.015,.985),y:receiver.y};
  if(!isAccurate) {
    target.x=clamp(target.x+dir*(state.rng.next()-.5)*.15,.015,.985);
    target.y=clamp(target.y+(state.rng.next()-.5)*.22,.035,.965);
  }
  const duration=clamp(gap/(14+team.tactics.tempo*.12),.9,3.6);
  startFlight(state,'pass',p,target,duration,{receiverId:receiver.id,teamId:p.teamId,accuracy:isAccurate,passerId:p.id});
  p.action='pass';p.actionUntil=state.t+2;state.actionCooldown=2;
  emit('pass',p.teamId,p.id,{toId:receiver.id,from:{x:p.x,y:p.y},to:target,duration});
}
function dribble(state,p,emit) {
  const dir=direction(state,p.teamId);
  const opposing=pick(state,opponent(state,p.teamId));
  const closest=nearest(opposing,p), dist=closest?meters(p,closest):20;
  const control=skill(p,'technical','control')+skill(p,'mental','composure')*.2;
  const risk=dist<4?.17:dist<8?.075:.018;
  const morale=skill(p,'mental','morale');
  if(state.rng.next()<risk*(1.5-control/180)*(1.1-morale*.002)/
      individualPerformanceFactor(p,state.t) && closest) {
    owns(state,closest);closest.action='tackle';closest.actionUntil=state.t+2;p.action='dribble';p.actionUntil=state.t+2;
    emit('tackle',closest.teamId,closest.id,{won:true,byDribble:true},p.id);
    state.actionCooldown=2;return;
  }
  const boost=(.015+skill(p,'physical','pace')*.00016)*(1-p.fatigue/200);
  p.x=clamp(p.x+dir*boost,.018,.982);
  p.y=clamp(p.y+(state.rng.next()-.5)*.018,.035,.965);
  owns(state,p);p.action='dribble';p.actionUntil=state.t+2;state.actionCooldown=2;
  emit('dribble',p.teamId,p.id,{x:p.x,y:p.y});
}
function challenge(state,p,emit) {
  const defender=nearest(pick(state,opponent(state,p.teamId)),p,q=>!q.isKeeper);
  if(!defender || meters(defender,p)>3.4)return false;
  const press=opponent(state,p.teamId).tactics.pressing;
  if(state.rng.next() > (.048+press*.0012))return false;
  const attack=(skill(p,'technical','control')*.62+skill(p,'physical','strength')*.19+
    skill(p,'mental','composure')*.19)*conditionFactor(p)*
    individualPerformanceFactor(p,state.t)-p.fatigue*.20;
  const defend=(skill(defender,'technical','tackling')*.63+
    skill(defender,'physical','strength')*.22+
    skill(defender,'technical','positioning')*.15)*conditionFactor(defender)*
    individualPerformanceFactor(defender,state.t)-defender.fatigue*.24;
  const defenderTeam=opponent(state,p.teamId);
  const foulChance=clamp((.052 + (55-skill(defender,'mental','discipline'))*.0006)*
    (defenderTeam.shout?.tone==='calm'?.52:1),.012,.095);
  if(state.rng.next()<foulChance) {
    const fouling=state.teams.find(t=>t.id===defender.teamId);
    state.stats[fouling.side].fouls++;
    emit('foul',defender.teamId,defender.id,{against:p.id,at:{x:p.x,y:p.y}},p.id);
    const injuryRisk=clamp(.008+p.fatigue*.00018-skill(p,'physical','durability')*.00006,.002,.05);
    if(state.rng.next()<injuryRisk){
      p.injured=true;p.action='injury';
      emit('injury',p.teamId,p.id,{severity:'minor',requiresSubstitution:true},defender.id);
    }
    const yellowChance=.12+(100-skill(defender,'mental','discipline'))*.0018;
    if(state.rng.next()<yellowChance) {
      const count=(state.cards.get(defender.id)||0)+1;state.cards.set(defender.id,count);
      const red=count>=2 || state.rng.next()<.018;
      emit('card',defender.teamId,defender.id,{color:red?'red':'yellow',yellows:count});
      if(red) {
        defender.active=false;defender.hasBall=false;
        fouling.lineup=fouling.lineup.filter(id=>id!==defender.id);
      }
    }
    restart(state,p.teamId,{x:p.x,y:p.y},emit);
    return true;
  }
  const chance=clamp(.36+(defend-attack)*.007,.12,.75);
  if(state.rng.next()<chance) {
    owns(state,defender);defender.action='tackle';defender.actionUntil=state.t+2;p.action='idle';
    emit('tackle',defender.teamId,defender.id,{won:true,against:p.id},p.id);
    state.actionCooldown=2;return true;
  }
  emit('tackle',defender.teamId,defender.id,{won:false,against:p.id},p.id);
  return false;
}
function shoot(state,p,emit) {
  const team=state.teams.find(t=>t.id===p.teamId), dir=direction(state,p.teamId);
  const defending=opponent(state,p.teamId), gk=keeper(state,defending);
  const dist=Math.hypot((dir===1?1-p.x:p.x)*105,(p.y-.5)*68);
  const angle=clamp(1-Math.abs(p.y-.5)*1.8,.30,1);
  const attrs=(skill(p,'technical','shooting')*.66+skill(p,'mental','composure')*.34);
  const inspiration=1+(skill(p,'mental','confidence')-50)*.002+
    (skill(p,'mental','morale')-50)*.0015+
    (skill(p,'mental','character')-50)*.0005;
  const xg=clamp((.16*Math.exp(-Math.max(0,dist-12)/17))*angle*
    (.62+attrs/115)*(1-p.fatigue/250)*
    (1-(skill(gk,'technical','goalkeeping')*conditionFactor(gk)-50)*.003)*inspiration*
    (team.shout?.tone==='push'?1.07:1)*(.985+skill(p,'mental','luck')*.0003)*
    conditionFactor(p)*individualPerformanceFactor(p,state.t),.012,.65);
  const onTargetChance=clamp(.46+skill(p,'technical','shooting')*.0035-dist*.005,.18,.79);
  const onTarget=state.rng.next()<onTargetChance;
  const probability=onTarget?clamp(xg/Math.max(.12,onTargetChance),.018,.90):0;
  const outcome=!onTarget?'miss':state.rng.next()<probability?'goal':'save';
  const targetY=outcome==='miss'?clamp(.5+(state.rng.next()-.5)*.46,.04,.96):
    clamp(.5+(state.rng.next()-.5)*.12,.43,.57);
  const target={x:dir===1?.995:.005,y:targetY};
  const duration=clamp(dist/28,.6,2.15);
  const candidate=state.lastAssist;
  const assistId=candidate &&
    candidate.teamId===p.teamId && candidate.receiverId===p.id &&
    candidate.passerId!==p.id && state.t-candidate.t<=20
      ?candidate.passerId:null;
  startFlight(state,'shot',p,target,duration,
    {teamId:p.teamId,shooterId:p.id,outcome,xg,keeperId:gk?.id??null,dir,assistId});
  state.lastAssist=null;
  p.action='shot';p.actionUntil=state.t+2;state.actionCooldown=2;
  state.stats[team.side].shots++;
  emit('shot',p.teamId,p.id,{xg:Number(xg.toFixed(4)),outcomePending:true,from:{x:p.x,y:p.y},to:target});
}
function receivePass(state,flight,emit) {
  const team=state.teams.find(t=>t.id===flight.teamId);
  const intended=state.byId.get(flight.receiverId);
  const opponents=pick(state,opponent(state,flight.teamId));
  const defender=nearest(opponents,state.ball),receiverGap=intended?.active?meters(intended,state.ball):100;
  const defenderGap=defender?meters(defender,state.ball):100;
  const contested=defenderGap<5.5 && (defenderGap<receiverGap+1.7 || !flight.accuracy);
  const intercepted=contested && state.rng.next()<
    clamp(.48+(skill(defender,'technical','positioning')-skill(intended||defender,'technical','control'))*.004,.23,.85);
  if(intercepted) {
    owns(state,defender);defender.action='tackle';defender.actionUntil=state.t+2;
    emit('interception',defender.teamId,defender.id,{fromId:flight.passerId,toId:flight.receiverId});
  } else if(flight.accuracy && intended?.active && receiverGap<15) {
    owns(state,intended);intended.action='control';
    if(flight.passerId && flight.passerId!==intended.id) {
      state.lastAssist={passerId:flight.passerId,receiverId:intended.id,
        teamId:flight.teamId,t:state.t};
    }
  } else {
    const candidates=[...opponents,...pick(state,team)];
    const winner=nearest(candidates,state.ball);
    if(winner){owns(state,winner);if(winner.teamId!==flight.teamId)emit('interception',winner.teamId,winner.id,{fromId:flight.passerId});}
    else restart(state,opponent(state,team.id).id,state.ball,emit,'throwin');
  }
}
function finishShot(state,flight,emit) {
  const team=state.teams.find(t=>t.id===flight.teamId),defending=opponent(state,team.id);
  const gk=state.byId.get(flight.keeperId) || keeper(state,defending);
  if(flight.outcome!=='miss')state.stats[team.side].shotsOnTarget++;
  if(flight.outcome==='goal') {
    state.score[team.side]++;
    const detail={from:flight.from,xg:Number(flight.xg.toFixed(4)),score:{...state.score}};
    if(flight.assistId)detail.assistId=flight.assistId;
    emit('goal',team.id,flight.shooterId,detail);
    kickoff(state,defending.id,emit);
  } else if(flight.outcome==='save') {
    if(gk) {
      gk.action='save';gk.actionUntil=state.t+2;
      emit('save',defending.id,gk.id,{againstId:flight.shooterId,xg:Number(flight.xg.toFixed(4))},flight.shooterId);
      if(state.rng.next()<.19) {
        state.stats[team.side].corners++;
        restart(state,team.id,{x:flight.dir===1?.968:.032,y:flight.to.y<.5?.045:.955},emit,'corner');
      } else {
        restart(state,defending.id,{x:gk.x,y:gk.y},emit);
        owns(state,gk);
      }
    } else restart(state,defending.id,{x:.5,y:.5},emit);
  } else restart(state,defending.id,{x:flight.dir===1?.94:.06,y:.5},emit);
}
function progressFlight(state,dt,emit) {
  const f=state.ball.flight;
  if(!f)return false;
  f.elapsed=Math.min(f.duration,f.elapsed+dt);
  const ratio=f.elapsed/f.duration;
  state.ball.x=clamp(f.from.x+(f.to.x-f.from.x)*ratio,.005,.995);
  state.ball.y=clamp(f.from.y+(f.to.y-f.from.y)*ratio,.02,.98);
  state.ball.height=(f.kind==='shot'?2.5:1.1)*Math.sin(Math.PI*ratio);
  if(ratio>=1) {
    clearFlight(state);
    if(f.kind==='pass')receivePass(state,f,emit);
    else finishShot(state,f,emit);
  }
  return true;
}
export function advancePlay(state,dt,emit) {
  if(progressFlight(state,dt,emit))return;
  const owner=state.byId.get(state.ball.ownerId);
  if(!owner?.active) {
    const team=state.teams[Math.floor(state.rng.next()*2)];
    restart(state,team.id,{x:state.ball.x,y:state.ball.y},emit);
    return;
  }
  state.ball.x=owner.x;state.ball.y=owner.y;state.ball.height=0;
  const team=state.teams.find(t=>t.id===owner.teamId);
  const dir=direction(state,team.id);
  if(state.actionCooldown>0){state.actionCooldown=Math.max(0,state.actionCooldown-dt);return;}
  if(challenge(state,owner,emit))return;
  const distGoal=(dir===1?1-owner.x:owner.x)*105;
  const shooting=skill(owner,'technical','shooting');
  const temptation=clamp(.048+(team.tactics.mentality-50)*.0015+
    (shooting-50)*.0007+(22-distGoal)*.0025,.015,.21);
  if(distGoal<27 && state.rng.next()<temptation)shoot(state,owner,emit);
  else if(state.rng.next()<(distGoal<35?.62:.81))pass(state,owner,emit);
  else dribble(state,owner,emit);
}
