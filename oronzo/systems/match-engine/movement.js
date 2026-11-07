import { clamp, meters, stat, conditionFactor } from './rng.js';

// Local anchors: x increases toward the opponent's goal; index 0 is goalkeeper.
export const FORMATIONS = Object.freeze({
  '4-4-2': [4,4,2], '4-3-3': [4,3,3], '3-5-2': [3,5,2],
  '4-2-3-1': [4,2,3,1], '5-3-2': [5,3,2],
});
export function direction(state, teamId) {
  return (teamId === state.homeId ? 1 : -1) * (state.t < 2700 ? 1 : -1);
}
export function formationAnchors(formation) {
  const lines = FORMATIONS[formation] || FORMATIONS['4-4-2'];
  const result = [{ x:.055,y:.5 }];
  const xs = lines.length === 4 ? [.235,.405,.635,.805] :
    lines.length === 3 ? [.23,.51,.79] : [.25,.72];
  for (let line=0; line<lines.length; line++) {
    for (let n=0;n<lines[line];n++) {
      result.push({x:xs[line],y:(n+1)/(lines[line]+1)});
    }
  }
  return result;
}
export function resetPositions(state) {
  for (const team of state.teams) {
    const dir = direction(state,team.id), anchors=formationAnchors(team.tactics.formation);
    team.lineup.forEach((id,i)=>{
      const p=state.byId.get(id), a=anchors[i] || {x:.5,y:.5};
      p.x=dir===1?a.x:1-a.x; p.y=a.y; p.vx=0; p.vy=0;
      // facing is an angle in radians, matching match-view.resolveFacing:
      // E=0, S=PI/2, W=PI, N=-PI/2. At rest retain it.
      p.facing=dir===1?0:Math.PI; p.action='idle';
    });
  }
}
function desired(state, team, p, slot, pursuers) {
  const dir=direction(state,team.id), a=formationAnchors(team.tactics.formation)[slot]||{x:.5,y:.5};
  const owns=state.possessingTeamId===team.id, b=state.ball, isKeeper=slot===0;
  const shouting=team.shout?.tone;
  const ment=(team.tactics.mentality-50)/100, width=team.tactics.width/50;
  const initialX=dir===1?a.x:1-a.x, progress=dir*(b.x-.5);
  let x=initialX, y=clamp(.5+(a.y-.5)*width,.045,.955);
  if (isKeeper) {
    x=dir===1?.048:.952;
    y=clamp(.5+(b.y-.5)*.17,.39,.61);
    if (state.ball.ownerId===p.id) { x=p.x; y=p.y; }
  } else {
    const longitudinal=clamp(dir*(b.x-.5),-.5,.5);
    x=clamp(initialX + dir*(longitudinal*.30+ment*.10+(owns?.035:-.025)+(shouting==='push'?.025:0)),.065,.935);
    y=clamp(y+(b.y-y)*(owns?.23:.17),.045,.955);
    if (owns && !p.hasBall && slot>=5) {
      const spacing=(slot%2===0?1:-1)*.035;
      x=clamp(x+dir*(.02+Math.max(0,team.tactics.tempo-50)*.0005),.065,.94);
      y=clamp(y+spacing,.05,.95);
      // When advancing, stay onside until the ball passes the defensive line.
      const other=state.teams.find(t=>t.id!==team.id);
      const sorted=other.lineup.map(id=>state.byId.get(id)).filter(q=>q?.active)
        .map(q=>q.x).sort((a,b)=>dir===1?b-a:a-b);
      const line=sorted[1];
      if(line!==undefined && dir*(x-line)>-.012 && dir*(b.x-x)<0) x=clamp(line-dir*.012,.05,.95);
    }
    if (!owns && pursuers.includes(p.id)) {
      x=b.x; y=b.y;
    } else if (!owns && team.tactics.marking==='man') {
      const threats=state.teams.find(t=>t.id!==team.id).lineup
        .map(id=>state.byId.get(id)).filter(q=>q && q.active && !q.isKeeper);
      threats.sort((a,b)=>meters(a,p)-meters(b,p));
      if(threats[0]) { x=clamp(x*.65+threats[0].x*.35,.04,.96); y=clamp(y*.65+threats[0].y*.35,.04,.96); }
    }
    if(p.hasBall) { x=p.x; y=p.y; }
  }
  // Formation switching produces a real, visible tactical regroup:
  // off-ball players run to their new slots, then gradually leave those
  // base positions to follow the ball and opponents. The carrier can play on.
  if(!p.hasBall && Number.isFinite(team.regroupStarted) &&
     Number.isFinite(team.regroupUntil) && state.t < team.regroupUntil) {
    const elapsed=state.t-team.regroupStarted;
    const strength=elapsed<22?1:
      clamp((team.regroupUntil-state.t)/(team.regroupUntil-team.regroupStarted-22),0,1);
    x=x*(1-strength)+initialX*strength;
    y=y*(1-strength)+a.y*strength;
  }
  return {x,y};
}
export function updateMovement(state, dt) {
  const positions=new Map();
  for(const team of state.teams) {
    const opponents=state.teams.find(t=>t.id!==team.id);
    const candidates=team.lineup.map(id=>state.byId.get(id))
      .filter(p=>p?.active && !p.isKeeper)
      .sort((a,b)=>meters(a,state.ball)-meters(b,state.ball));
    const howMany=state.possessingTeamId!==team.id ? (team.tactics.pressing>=70?3:team.tactics.pressing>=40?2:1) : 0;
    const pursuers=candidates.slice(0,howMany).map(p=>p.id);
    team.lineup.forEach((id,slot)=>{
      const p=state.byId.get(id);
      if(p?.active)positions.set(p.id,desired(state,team,p,slot,pursuers));
    });
  }
  for (const team of state.teams) {
    for(const id of team.lineup) {
      const p=state.byId.get(id);
      if(!p?.active)continue;
      const target=positions.get(p.id), tired=clamp(p.fatigue/120,0,.72);
      const base=3.5+stat(p,'physical','pace')*.034;
      const character=stat(p,'mental','character');
      const morale=stat(p,'mental','morale');
      // A brief, walkable repositioning run rather than an instantaneous jump.
      const earlyRegroup=Number.isFinite(team.regroupStarted) &&
        Number.isFinite(team.regroupUntil) && state.t<team.regroupUntil &&
        state.t-team.regroupStarted<22 && !p.hasBall;
      const speed=base*(1-tired*.48)*(p.injured?.45:1)*(.9+morale*.0018)*
        (team.shout?.tone==='encourage'?(1+(character-35)*.0005):1)*
        conditionFactor(p)*(earlyRegroup?.55:1);
      const dx=(target.x-p.x)*105, dy=(target.y-p.y)*68, dist=Math.hypot(dx,dy);
      const move=Math.min(dist,speed*dt);
      const tx=dist>1e-6?(dx/dist)*move/105:0,ty=dist>1e-6?(dy/dist)*move/68:0;
      const oldX=p.x,oldY=p.y;
      // No teleport: velocity blends over one physical second.
      const inertia=clamp(dt*1.35,0,1);
      p.vx=clamp(p.vx*(1-inertia)+tx/Math.max(dt,.001)*inertia,-.085,.085);
      p.vy=clamp(p.vy*(1-inertia)+ty/Math.max(dt,.001)*inertia,-.13,.13);
      p.x=clamp(p.x+p.vx*dt,.012,.988);
      p.y=clamp(p.y+p.vy*dt,.025,.975);
      const physicalVx=p.vx*105, physicalVy=p.vy*68;
      if(Math.hypot(physicalVx,physicalVy)>.1) p.facing=Math.atan2(physicalVy,physicalVx);
      if(!p.hasBall && (p.actionUntil===undefined || state.t>=p.actionUntil)) {
        p.action=meters({x:oldX,y:oldY},p)>.28?'run':'idle';
      }
      const effort=state.possessingTeamId!==team.id ? team.tactics.pressing/100 : .48;
      p.fatigue=clamp(p.fatigue + dt*(.0031+effort*.0035)*(1.35-stat(p,'physical','stamina')/260),0,100);
      p.energy=clamp((100-p.fatigue)*conditionFactor(p),0,100);
    }
  }
  // Resolve the worst overlaps without changing the tactical choices.
  const all=state.teams.flatMap(t=>t.lineup).map(id=>state.byId.get(id)).filter(p=>p?.active);
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++) {
    const a=all[i],b=all[j], dx=(a.x-b.x)*105,dy=(a.y-b.y)*68,d=Math.hypot(dx,dy);
    if(d<.85) {
      const ang=d>.00001?Math.atan2(dy,dx):(i+j)*2.399963;
      const push=(.85-d)/2;
      a.x=clamp(a.x+Math.cos(ang)*push/105,.012,.988);
      a.y=clamp(a.y+Math.sin(ang)*push/68,.025,.975);
      b.x=clamp(b.x-Math.cos(ang)*push/105,.012,.988);
      b.y=clamp(b.y-Math.sin(ang)*push/68,.025,.975);
    }
  }
}
