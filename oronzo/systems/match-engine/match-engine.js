import { createRng, clamp, stat } from './rng.js';
import { resetPositions, updateMovement } from './movement.js';
import { validateTactics, executeCommand } from './commands.js';
import { advancePlay, kickoff } from './actions.js';

const copy=o=>JSON.parse(JSON.stringify(o));
function roster(club,eleven,bench,teamId) {
  if(!club || !Array.isArray(club.players))throw Error('club players are required');
  if(!Array.isArray(eleven)||eleven.length!==11 || new Set(eleven).size!==11)throw Error('exactly 11 unique starter ids required');
  if(!Array.isArray(bench)||new Set(bench).size!==bench.length)throw Error('bench ids must be unique');
  if(bench.some(id=>eleven.includes(id)))throw Error('starter also on bench');
  const indexed=new Map(club.players.map(p=>[p.id,p]));
  if(indexed.size!==club.players.length)throw Error('duplicate player id in club');
  const all=[...eleven,...bench];
  if(all.some(id=>typeof id!=='string'||!indexed.has(id)))throw Error('unknown player id');
  const start=eleven.map(id=>indexed.get(id));
  const keep=start.filter(p=>p.positions?.includes('GK'));
  if(keep.length!==1)throw Error('starting XI requires exactly one GK');
  // GK first establishes a stable formation slot and makes keeper handling explicit.
  const lineup=[keep[0].id,...eleven.filter(id=>id!==keep[0].id)];
  return {lineup,bench:bench.slice(),players:all.map(id=>indexed.get(id)),id:teamId};
}
function preparePlayer(source,teamId,active) {
  const p=copy(source), status=p.status || {};
  p.teamId=teamId;p.positions=p.positions||[];
  p.active=active;p.hasBall=false;p.action='idle';p.x=.5;p.y=.5;
  p.vx=0;p.vy=0;p.facing=1;p.energy=100;
  p.fatigue=clamp(Number(status.fatigue)||0,0,100);
  p.injured=Number(status.injuryDays)>0 || Number(status.health)===0;
  p.suspended=Number(status.suspensionMatches)>0;
  p.isKeeper=p.positions.includes('GK');
  if(active&&(p.injured||p.suspended))throw Error('unavailable starter: '+p.id);
  return p;
}
export function createMatch(input) {
  if(!input || !input.homeClub || !input.awayClub)throw Error('MatchInputV1 required');
  const homeId=input.homeClub.id,awayId=input.awayClub.id;
  if(typeof homeId!=='string'||typeof awayId!=='string'||homeId===awayId)throw Error('distinct club ids required');
  const h=roster(input.homeClub,input.homeXI,input.homeBench||[],homeId);
  const a=roster(input.awayClub,input.awayXI,input.awayBench||[],awayId);
  const allIds=[...h.players,...a.players].map(p=>p.id);
  if(new Set(allIds).size!==allIds.length)throw Error('player ids must be globally unique');
  const byId=new Map([...h.players.map(p=>[p.id,preparePlayer(p,homeId,h.lineup.includes(p.id))]),
    ...a.players.map(p=>[p.id,preparePlayer(p,awayId,a.lineup.includes(p.id))])]);
  const maxSubstitutions=input.competitionRules?.maxSubstitutions ?? 2;
  if(!Number.isInteger(maxSubstitutions)||maxSubstitutions<0||maxSubstitutions>15)throw Error('invalid maxSubstitutions');
  const state={
    t:0,phase:'firstHalf',homeId,awayId,byId,rng:createRng(input.seed),
    rules:{maxSubstitutions},teams:[
      {id:homeId,side:'home',lineup:h.lineup,bench:h.bench,tactics:validateTactics(input.homeTactics),
       subsUsed:0,shout:null},
      {id:awayId,side:'away',lineup:a.lineup,bench:a.bench,tactics:validateTactics(input.awayTactics),
       subsUsed:0,shout:null},
    ],
    score:{home:0,away:0},
    stats:{home:{shots:0,shotsOnTarget:0,possessingSeconds:0,fouls:0,corners:0},
           away:{shots:0,shotsOnTarget:0,possessingSeconds:0,fouls:0,corners:0}},
    ball:{x:.5,y:.5,height:0,vx:0,vy:0,ownerId:null,flight:null},
    events:[],tickEvents:[],cards:new Map(),actionCooldown:0,possessingTeamId:null,
    paused:false,speed:1,carry:0,
  };
  function emit(type,teamId=null,playerId=null,detail={},otherPlayerId=null) {
    const ev={id:state.events.length+1,t:state.t,type};
    if(teamId!==null)ev.teamId=teamId;
    if(playerId!==null)ev.playerId=playerId;
    if(otherPlayerId!==null)ev.otherPlayerId=otherPlayerId;
    if(detail && Object.keys(detail).length)ev.detail=copy(detail);
    state.events.push(ev);state.tickEvents.push(ev);
    return ev;
  }
  resetPositions(state);
  kickoff(state,homeId,emit);
  function view() {
    const total=state.stats.home.possessingSeconds+state.stats.away.possessingSeconds;
    const per=side=>({
      shots:state.stats[side].shots,
      shotsOnTarget:state.stats[side].shotsOnTarget,
      possession:total?Number((100*state.stats[side].possessingSeconds/total).toFixed(1)):50,
      fouls:state.stats[side].fouls,corners:state.stats[side].corners,
    });
    const ps=state.teams.flatMap(team=>team.lineup.map(id=>state.byId.get(id)));
    return copy({
      t:state.t,minute:state.t/60,phase:state.phase,score:state.score,
      players:ps.filter(Boolean).map(p=>({
        id:p.id,teamId:p.teamId,x:p.x,y:p.y,vx:p.vx,vy:p.vy,
        facing:p.facing,action:p.action,energy:p.energy,hasBall:p.hasBall,
      })),
      ball:{x:state.ball.x,y:state.ball.y,height:state.ball.height,
        vx:state.ball.vx,vy:state.ball.vy,ownerId:state.ball.ownerId},
      stats:{home:per('home'),away:per('away')},
      events:state.tickEvents,possessingTeamId:state.possessingTeamId,
    });
  }
  function apply(command) {
    state.tickEvents=[];
    return executeCommand(state,command,emit);
  }
  function step(dt,commands=[]) {
    if(!Number.isFinite(dt)||dt<0)throw Error('dt must be finite nonnegative simulated seconds');
    state.tickEvents=[];
    const inputs=Array.isArray(commands)?commands:[commands];
    const commandResults=inputs.map(c=>executeCommand(state,c,emit));
    if(!state.paused && state.phase!=='fulltime') {
      state.carry+=dt;
      while(state.carry>=1 && state.phase!=='fulltime') {
        state.carry-=1;
        state.t=Math.min(5400,state.t+1);
        // End-of-half fixed boundaries independent of caller's frame rate.
        if(state.t===2700){
          state.phase='halftime';emit('halftime');
          state.phase='secondHalf';kickoff(state,awayId,emit);
        } else if(state.t===5400){
          state.phase='fulltime';emit('fulltime');
        } else {
          updateMovement(state,1);
          advancePlay(state,1,emit);
          const owner=state.byId.get(state.ball.ownerId);
          if(owner)state.stats[owner.teamId===homeId?'home':'away'].possessingSeconds++;
        }
        for(const team of state.teams)
          if(team.shout && state.t>=team.shout.expires)team.shout=null;
      }
    }
    return {...view(),commandResults};
  }
  function advanceRealSeconds(seconds,commands=[]) {
    if(!Number.isFinite(seconds)||seconds<0)throw Error('invalid real-time delta');
    return step(seconds*60*state.speed,commands);
  }
  function setSpeed(value) {
    if(![1,2,4,8].includes(value))throw Error('speed must be 1,2,4,8');
    state.speed=value;return value;
  }
  return Object.freeze({
    step,snapshot:view,getEventsSince(lastEventId=0) {
      return copy(state.events.filter(e=>e.id>lastEventId));
    },isFinished:()=>state.phase==='fulltime',
    command:apply,setPaused(value){state.paused=!!value;return state.paused;},
    setSpeed,advanceRealSeconds,
  });
}
