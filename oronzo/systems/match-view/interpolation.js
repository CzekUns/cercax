/** ORONZO — visual-only interpolation of MatchSnapshotV1. No football decisions. */
export const DIRECTIONS = Object.freeze(['N','NE','E','SE','S','SW','W','NW']);
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const finite = (n, fallback=0) => Number.isFinite(n) ? n : fallback;
export const clamp01 = n => clamp(finite(n), 0, 1);
export function directionFromVector(x, y, fallback='S') {
  if (Math.hypot(x, y) < 0.0001) return DIRECTIONS.includes(fallback) ? fallback : 'S';
  const eighth = Math.round((Math.atan2(y, x) + Math.PI / 2) / (Math.PI / 4));
  return DIRECTIONS[(eighth % 8 + 8) % 8];
}
export function resolveFacing(facing, vx=0, vy=0, fallback='S') {
  if (typeof facing === 'string') {
    const dir = facing.toUpperCase().trim();
    if (DIRECTIONS.includes(dir)) return dir;
    const names={NORTH:'N',NORTHEAST:'NE',EAST:'E',SOUTHEAST:'SE',SOUTH:'S',SOUTHWEST:'SW',WEST:'W',NORTHWEST:'NW'};
    if (names[dir]) return names[dir];
  }
  // Agent 6 emits +1 / -1 as the horizontal sign, not radians.
  // Angles are still supported, but must use {radians} or {angle} for +/-1.
  if (facing === 1) return 'E';
  if (facing === -1) return 'W';
  if (Number.isFinite(facing)) return directionFromVector(Math.cos(facing),Math.sin(facing),fallback);
  if (facing && typeof facing === 'object') {
    if (Number.isFinite(facing.radians ?? facing.angle)) {
      const a=facing.radians ?? facing.angle;
      return directionFromVector(Math.cos(a),Math.sin(a),fallback);
    }
    return directionFromVector(finite(facing.x),finite(facing.y),fallback);
  }
  return directionFromVector(finite(vx), finite(vy), fallback);
}
export function spriteAction(action, keeper=false, speed=0) {
  const a = String(action || '').toLowerCase();
  if (['shot','shoot','pass','passing','kick','cross','clear','header'].includes(a)) return 'kick';
  if (['tackle','slide','challenge','block','interception','intercept'].includes(a)) return 'tackle';
  if (['save','dive','parry','catch','keeper','goalkeeping'].includes(a)) return 'keeper';
  if (['run','sprint','accelerate','chase','press','dribble','unmark','move','support','mark','track','dash','recover','position','receive','pursuit'].includes(a)) return 'run';
  if (keeper && a === 'defend') return 'keeper';
  return speed > 0.0035 ? 'run' : 'idle';
}
/** Match engine V1 reports energy in percentage points [0..100].
 * Renderer normalizes to [0..1]; do not treat an engine value of 1 as 100%.
 */
export function normalizeEnergy(energy=100) {
  return clamp01(finite(energy,100)/100);
}
function copyPlayer(p) {
  return {
    ...p, id: String(p.id), teamId: String(p.teamId), x:clamp01(p.x), y:clamp01(p.y),
    vx:finite(p.vx), vy:finite(p.vy), energy:normalizeEnergy(p.energy ?? 100),
    hasBall:Boolean(p.hasBall), action:String(p.action ?? 'idle')
  };
}
export function normalizeSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.players) || !snapshot.ball) throw new TypeError('Expected MatchSnapshotV1 with players and ball');
  const ids = new Set();
  const players = snapshot.players.map(p => {
    if (p?.id === undefined || p?.teamId === undefined) throw new TypeError('Player id and teamId required');
    const actor = copyPlayer(p);
    if (ids.has(actor.id)) throw new TypeError('Duplicate player id '+actor.id);
    ids.add(actor.id);
    return actor;
  });
  const b = snapshot.ball;
  return {
    ...snapshot, t:finite(snapshot.t), players,
    ball:{...b, x:clamp01(b.x), y:clamp01(b.y),height:Math.max(0,finite(b.height)), vx:finite(b.vx), vy:finite(b.vy)},
    events:Array.isArray(snapshot.events) ? snapshot.events : []
  };
}
const lerp=(a,b,u)=>a+(b-a)*u;
/** Interpolate positions by stable player IDs, never array order. */
export function interpolateSnapshots(a,b,alpha) {
  if (!b) return a;
  if (!a) return b;
  const u=clamp01(alpha), old=new Map(a.players.map(p=>[p.id,p]));
  const players=b.players.map(next=>{
    const prev=old.get(next.id);
    if (!prev || prev.teamId!==next.teamId) return next;
    const vx=lerp(prev.vx,next.vx,u), vy=lerp(prev.vy,next.vy,u);
    const dx=next.x-prev.x, dy=next.y-prev.y;
    const facing=resolveFacing(next.facing,vx || dx,vy || dy,resolveFacing(prev.facing,prev.vx,prev.vy));
    return {...next,x:lerp(prev.x,next.x,u),y:lerp(prev.y,next.y,u),vx,vy,facing};
  });
  return {...b,players,ball:{...b.ball,x:lerp(a.ball.x,b.ball.x,u),y:lerp(a.ball.y,b.ball.y,u),height:lerp(a.ball.height,b.ball.height,u)}};
}
/** The clock is wall time; t is match time and is never advanced here. */
export class SnapshotInterpolator {
  constructor({simSecondsPerRealSecond=60,maxBlendMs=600,minBlendMs=24}={}) {
    this.rate=simSecondsPerRealSecond;this.maxBlendMs=maxBlendMs;this.minBlendMs=minBlendMs;
    this.previous=null;this.latest=null;this.started=0;this.duration=0;this.speed=1;this.paused=false;this.pausedAt=0;
  }
  sample(now=0) {
    if (!this.latest) return null;
    const t=this.paused?this.pausedAt:now;
    const u=this.duration>0?clamp01((t-this.started)/this.duration):1;
    return interpolateSnapshots(this.previous,this.latest,u);
  }
  push(raw,now=0) {
    const next=normalizeSnapshot(raw);
    // A restart is a hard scene cut: never tween a goalkeeper or ball
    // across the field after a goal or when sides change at halftime.
    // Also handle phase changes when a producer omits kickoff in a snapshot.
    const events=next.events;
    const hardCut=this.latest && (
      next.t<this.latest.t ||
      next.phase!==this.latest.phase ||
      events.some(e=>e?.type==='kickoff' || e?.type==='halftime')
    );
    if (hardCut) this.previous=null;
    else this.previous=this.sample(now);
    const delta=this.latest ? Math.max(0,next.t-this.latest.t) : 0;
    this.latest=next;
    this.started=now;
    this.duration=this.previous&&delta>0?clamp(delta*1000/(this.rate*this.speed),this.minBlendMs,this.maxBlendMs):0;
    if (this.paused) this.pausedAt=now;
    return next;
  }
  setSpeed(next,now=0) {
    if (![1,2,4,8].includes(next)) throw new RangeError('Speed must be 1, 2, 4 or 8');
    const progress=this.duration>0?clamp01(((this.paused?this.pausedAt:now)-this.started)/this.duration):1;
    const frame=this.sample(now);this.previous=frame;this.started=now;
    this.duration*=1-progress; // no visual jump when changing playback speed
    // Future snapshots use the new speed. The in-flight blend is left continuous.
    this.speed=next;
    if (this.paused) this.pausedAt=now;
  }
  setPaused(paused,now=0) {
    if (Boolean(paused)===this.paused) return;
    if (paused) {this.pausedAt=now;this.paused=true;}
    else {this.started+=Math.max(0,now-this.pausedAt);this.paused=false;}
  }
  reset(){this.previous=null;this.latest=null;this.duration=0;this.started=0;this.paused=false;}
}