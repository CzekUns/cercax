import {createMatch} from './match-engine.js';
import {makeFixture} from './fixtures.js';
import {formationAnchors} from './movement.js';

// Complete 90-minute matches at 100 reproducible seeds with in-match tactics,
// one individual instruction and one substitution per match.
function verify(value,message){if(!value)throw new Error('QA-100: '+message);}
const sum=(a,key)=>a.reduce((n,x)=>n+x[key],0);
const count=(ev,type)=>ev.filter(e=>e.type===type).length;
const mean=(a,key)=>Number((sum(a,key)/a.length).toFixed(3));
function anchorDistance(s){
  const a=formationAnchors('3-5-2');
  return s.players.filter(p=>p.teamId==='montevento')
    .reduce((v,p,i)=>v+Math.hypot((p.x-a[i].x)*105,(p.y-a[i].y)*68),0)/11;
}
function runSeed(seed){
  const match=createMatch(makeFixture(seed));
  const initial=match.snapshot();
  verify(initial.players.length===22,'starting 22 seed '+seed);
  match.step(600);
  const before=match.snapshot(),beforeAnchor=anchorDistance(before);
  const tactical=match.command({type:'tacticChange',teamId:'montevento',
    payload:{formation:'3-5-2',pressing:78,tempo:65}});
  verify(tactical.accepted,'formation rejected seed '+seed);
  const applied=match.snapshot();
  verify(applied.players.every((p,i)=>p.x===before.players[i].x&&p.y===before.players[i].y),
    'instant teleport at formation command '+seed);
  const firstStep=match.step(1);
  const maxMoved=Math.max(...firstStep.players.map((p,i)=>
    Math.hypot((p.x-applied.players[i].x)*105,(p.y-applied.players[i].y)*68)));
  const restartFirst=firstStep.events.some(e=>e.type==='kickoff');
  if(!restartFirst)verify(maxMoved<9.5,'speed cap from formation command seed '+seed);
  const regroup=match.step(21);
  const restartRegroup=regroup.events.some(e=>e.type==='kickoff');
  const checkedRegroup=!restartFirst&&!restartRegroup;
  const recovered=checkedRegroup && anchorDistance(regroup)<beforeAnchor+.05;
  if(checkedRegroup)verify(recovered,'new tactical anchors unreached seed '+seed);
  match.step(578); // t=1200
  const players=match.snapshot().players.filter(p=>p.teamId==='montevento'&&p.id!=='montevento-0');
  let shouted=false;
  for(const p of players){
    const result=match.command({type:'shout',teamId:'montevento',payload:{
      targetPlayerId:p.id,tone:seed%2?'harsh':'encourage',
      coachOrigin:{regionId:'campania',macroRegion:'south'},
      playerOrigin:{regionId:'campania',macroRegion:'south'},
      utteranceId:'qa-'+seed
    }});
    if(result.accepted){shouted=true;break;}
  }
  verify(shouted,'individual shout unavailable seed '+seed);
  match.step(600); // t=1800
  let substituted=false;
  for(const p of match.snapshot().players.filter(p=>p.teamId==='montevento'&&p.id!=='montevento-0')){
    if(match.command({type:'substitution',teamId:'montevento',
      payload:{outId:p.id,inId:'montevento-11'}}).accepted){substituted=true;break;}
  }
  verify(substituted,'substitution unavailable seed '+seed);
  match.step(3600); // t=5400
  const s=match.snapshot(),events=match.getEventsSince();
  verify(match.isFinished()&&s.t===5400&&s.phase==='fulltime','fulltime '+seed);
  verify(s.score.home===events.filter(e=>e.type==='goal'&&e.teamId==='montevento').length,
    'home score mismatch '+seed);
  verify(s.score.away===events.filter(e=>e.type==='goal'&&e.teamId==='portoselva').length,
    'away score mismatch '+seed);
  verify(s.stats.home.shots+s.stats.away.shots===count(events,'shot'),'shot stats '+seed);
  verify(s.stats.home.fouls+s.stats.away.fouls===count(events,'foul'),'foul stats '+seed);
  verify(events.every((e,i)=>e.id===i+1&&(i===0||e.t>=events[i-1].t)),
    'event order '+seed);
  for(const [type,n] of [['coach_shout',1],['substitution',1],['tacticChange',1],['fulltime',1]])
    verify(count(events,type)===n,type+' count seed '+seed);
  verify(s.players.length<=22&&s.players.length>=11,'on-pitch count '+seed);
  verify(new Set(s.players.map(p=>p.id)).size===s.players.length,'duplicate ids '+seed);
  verify(s.players.every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1&&p.energy>=0&&p.energy<=100),
    'player field/energy bounds '+seed);
  verify(s.ball.x>=0&&s.ball.x<=1&&s.ball.y>=0&&s.ball.y<=1,'ball bounds '+seed);
  verify(Math.abs(s.stats.home.possession+s.stats.away.possession-100)<.11,'possession percentages '+seed);
  return {
    goals:s.score.home+s.score.away,shots:count(events,'shot'),
    passes:count(events,'pass'),fouls:count(events,'foul'),offsides:count(events,'offside'),
    injuries:count(events,'injury'),interceptions:count(events,'interception'),
    sentOff:events.filter(e=>e.type==='card'&&e.detail?.color==='red').length,
    homePossession:s.stats.home.possession,remainingPlayers:s.players.length,
    substitutions:count(events,'substitution'),shouts:count(events,'coach_shout'),
    checkedRegroup:checkedRegroup?1:0,recoveredRegroup:recovered?1:0,
    maxStepMeters:restartFirst?0:maxMoved,
    signature:JSON.stringify({score:s.score,events})
  };
}
export function runQa100(seeds=100){
  if(!Number.isInteger(seeds)||seeds<1||seeds>1000)throw new RangeError('seeds must be 1..1000');
  const rows=[];let deterministicReplays=0;
  for(let seed=0;seed<seeds;seed++){
    const x=runSeed(seed);rows.push(x);
    if(seed<10){
      const y=runSeed(seed);
      verify(x.signature===y.signature,'non-deterministic replay '+seed);
      deterministicReplays++;
    }
  }
  const clean=rows.map(({signature,...r})=>r);
  return {
    seeds,deterministicReplays,
    meanGoals:mean(clean,'goals'),minGoals:Math.min(...clean.map(x=>x.goals)),
    maxGoals:Math.max(...clean.map(x=>x.goals)),
    meanShots:mean(clean,'shots'),meanPasses:mean(clean,'passes'),
    meanFouls:mean(clean,'fouls'),meanOffsides:mean(clean,'offsides'),
    meanHomePossession:mean(clean,'homePossession'),
    injuries:sum(clean,'injuries'),redCards:sum(clean,'sentOff'),
    acceptedSubstitutions:sum(clean,'substitutions'),acceptedIndividualShouts:sum(clean,'shouts'),
    anchorsChecked:sum(clean,'checkedRegroup'),anchorsRecovered:sum(clean,'recoveredRegroup'),
    maxNonRestartStepMeters:Number(Math.max(...clean.map(x=>x.maxStepMeters)).toFixed(3)),
  };
}
