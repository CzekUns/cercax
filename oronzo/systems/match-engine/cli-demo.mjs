import { createMatch } from './match-engine.js';
import { makeFixture } from './fixtures.js';

const count=Math.max(1,Math.min(50,Number(process.argv[2]||5)));
for(let seed=1;seed<=count;seed++){
  const match=createMatch(makeFixture(seed));
  match.step(1800);
  if(seed===1){
    const result=match.command({type:'tacticChange',teamId:'montevento',
      payload:{mentality:84,pressing:76,tempo:78}});
    console.log('Cambio tattico al 30°:',result);
  }
  match.step(3600);
  const s=match.snapshot(),events=match.getEventsSince();
  const goals=events.filter(e=>e.type==='goal');
  console.log(
    'seed',seed,'Montevento',s.score.home,'-',s.score.away,'Porto Selva',
    '| t',s.t,'| tiri',s.stats.home.shots,s.stats.away.shots,
    '| gol da eventi',goals.length,'| passaggi',events.filter(e=>e.type==='pass').length,
    '| fuorigioco',events.filter(e=>e.type==='offside').length,
    '| fine',match.isFinished());
}
