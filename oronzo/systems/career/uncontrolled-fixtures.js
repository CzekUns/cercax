/** Explicitly simulated results for games NOT played by the human coach.
 * This provider is never presented as Match Engine 06 gameplay.
 */
import { seededRandom } from './league.js';
const attrs = c => c.players.reduce((s,p)=>s+(p.technical?.shooting??40),0)/Math.max(1,c.players.length);
export function simulateOtherFixture(state,fixture) {
  if(fixture.homeId===state.coach.clubId||fixture.awayId===state.coach.clubId)
    throw new Error('Cannot simulate the coach-controlled match');
  if(fixture.result)throw new Error('Fixture already resolved');
  const home=state.clubs.find(c=>c.id===fixture.homeId);
  const away=state.clubs.find(c=>c.id===fixture.awayId);
  if(!home||!away)throw new Error('Missing team');
  const rng=seededRandom('ai-fixture:'+state.seed+':'+fixture.id);
  const rating=(attrs(home)-attrs(away))/100;
  const goals=(bias)=>Math.min(6,Array.from({length:5},(_,i)=>rng()<Math.max(.05,Math.min(.58,.23+bias-i*.05))).filter(Boolean).length);
  const score={home:goals(.06+rating*.08),away:goals(-rating*.08)};
  const events=[];
  for(const [side,club,count] of [['home',home,score.home],['away',away,score.away]]) {
    const scorers=club.players.filter(p=>!p.positions?.includes('GK'));
    for(let i=0;i<count;i++) {
      const scorer=scorers[Math.floor(rng()*scorers.length)];
      events.push({id:'sim:'+fixture.id+':'+side+':'+i,type:'goal',teamId:club.id,
        playerId:scorer.id,t:Math.round(1+rng()*5398),
        detail:{simulated:true,provider:'deterministic_uncontrolled_fixture_v1'}});
    }
  }
  events.sort((a,b)=>a.t-b.t||a.id.localeCompare(b.id));
  return {fixtureId:fixture.id,homeId:fixture.homeId,awayId:fixture.awayId,score,events,
    provider:'deterministic_uncontrolled_fixture_v1',playedByHuman:false};
}
