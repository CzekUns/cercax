/** Visual test feed ONLY; not a football simulator and not used by match engine. */
import {clamp01,directionFromVector} from './interpolation.js';
const LINE=[[.035,.50],[.18,.17],[.18,.38],[.18,.62],[.18,.83],[.36,.12],[.36,.38],[.36,.62],[.36,.87],[.53,.38],[.53,.66]];
const FIXTURE_EVENTS=[
  {t:300,type:'pass',playerId:'H10'},
  {t:750,type:'tackle',playerId:'A6'},
  {t:1150,type:'shot',playerId:'H9'},
  {t:1280,type:'save',playerId:'A0'},
  {t:2100,type:'goal',playerId:'H10'},
  {t:2860,type:'card',playerId:'A6',detail:{color:'yellow'}},
  {t:3530,type:'injury',playerId:'H4'},
  {t:4250,type:'shot',playerId:'A9'},
  {t:4300,type:'save',playerId:'H0'},
  {t:5000,type:'goal',playerId:'A10'}
];
export const fixturePlayers=()=>Array.from({length:22},(_,i)=>({
  id:(i<11?'H':'A')+(i%11),teamId:i<11?'home':'away',name:'Prova '+(i+1),
  keeper:i%11===0
}));
function position(i,t){
  const home=i<11,n=i%11,base=LINE[n],flip=home?1:-1;
  const segment=Math.floor(t/540),wave=t/175;
  const attack=clamp01((Math.sin(t/380)+1)/2);
  const drift=(n===0?.012:n<5?.035:n<9?.07:.10);
  let x=home?base[0]:1-base[0];
  let y=home?base[1]:1-base[1];
  x+=flip*(Math.sin(wave+n*.61)*drift+.10*(attack-.5));
  y+=Math.cos(wave*.87+n*1.23)*drift*.75;
  if(n===0)x=home?.025:.975;
  if(n===9||n===10){x+=flip*.055*Math.sin(t/95+n);y+=.06*Math.sin(t/137+n);}
  return {x:clamp01(x),y:clamp01(y)};
}
function possessionId(t){const phase=Math.floor(t/340)%6;return ['H10','H6','H9','A6','A9','A10'][phase];}
function currentAction(p,t){
  const special=FIXTURE_EVENTS.find(e=>e.playerId===p.id&&Math.abs(t-e.t)<45);
  if(special){if(special.type==='shot'||special.type==='pass'||special.type==='goal')return 'kick';
    if(special.type==='save')return 'save';if(special.type==='tackle')return 'tackle';}
  return p.keeper?'idle':Math.sin(t/85+(+p.id.slice(1))*.44)>-.65?'run':'unmark';
}
/** Create deterministic snapshots for a *visual* integration test. score is scripted in fixture. */
export function makeFixtureSnapshot(t,lastT=-1){
  t=Math.max(0,Math.min(5400,t));
  const roster=fixturePlayers(),ownerId=possessionId(t);
  const players=roster.map(p=>{
    const i=(p.teamId==='home'?0:11)+Number(p.id.slice(1));
    const pos=position(i,t),older=position(i,Math.max(0,t-18));
    const vx=(pos.x-older.x)/18,vy=(pos.y-older.y)/18;
    return {id:p.id,name:p.name,teamId:p.teamId,...pos,vx,vy,
      facing:directionFromVector(vx,vy,p.teamId==='home'?'E':'W'),
      action:currentAction(p,t),energy:1-t/7800,hasBall:p.id===ownerId};
  });
  const owner=players.find(p=>p.id===ownerId);
  const airborne=t%340>230&&t%340<315;
  const ball={x:clamp01(owner.x+(ownerId.startsWith('H')?.017:-.017)),y:owner.y,height:airborne?.25+Math.sin((t%340-230)/85*Math.PI)*.40:0,vx:owner.vx,vy:owner.vy,ownerId};
  const events=FIXTURE_EVENTS.filter(e=>e.t>lastT&&e.t<=t).map((e,i)=>({...e,id:'fixture-'+e.t+'-'+i}));
  return {t,minute:t/60,phase:t>=5400?'fulltime':t>=2700?'secondHalf':'firstHalf',
    score:{home:t>=2100?1:0,away:t>=5000?1:0},players,ball,
    stats:{home:{shots:2,shotsOnTarget:1,possession:52,fouls:4,corners:2},away:{shots:1,shotsOnTarget:1,possession:48,fouls:3,corners:1}},
    events,possessingTeamId:ownerId.startsWith('H')?'home':'away'};
}