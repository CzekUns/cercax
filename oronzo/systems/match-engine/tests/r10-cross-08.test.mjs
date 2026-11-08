import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch} from '../match-engine.js';
import {makeFixture} from '../fixtures.js';
import {createIndividualShoutCommand} from '../orders.js';
import {collectCoachEffects} from '../coach-effects.js';

// Run this after combining PR #31 (08) and #35 (06) into one checkout.
// Standalone PR #35 has PlayerV1 only on main: do not hide that prerequisite.
async function get08(t) {
  try {
    const [model,generator] = await Promise.all([
      import('../../attributes/player-model.js'),
      import('../../attributes/generator.js')
    ]);
    if(!model.normalizePlayer({id:'probe',teamId:'probe',name:'Prova',
      positions:['DF']}).relationships?.coachTrust && // value 50 is truthy
      typeof model.normalizePlayer({id:'probe',teamId:'probe',name:'Prova',
        positions:['DF']}).relationships?.coachTrust!=='number'){
      t.skip('Requires PlayerV2 branch PR #31; not integrated on this checkout');
      return null;
    }
    return {model,generator};
  } catch(error) {
    if(error?.code==='ERR_MODULE_NOT_FOUND') {
      t.skip('Requires combined checkout with PR #31 geography/PlayerV2');
      return null;
    }
    throw error;
  }
}
function real08Input(generateSquad,seed){
  const base=makeFixture(seed);
  for(const side of ['home','away']){
    const club=base[side+'Club'];
    const players=generateSquad({seed,teamId:club.id,size:22});
    club.players=players;
    base[side+'XI']=players.slice(0,11).map(p=>p.id);
    base[side+'Bench']=players.slice(11).map(p=>p.id);
  }
  return base;
}

test('R10 cross-module: actual 08 normalizePlayer uses origin and coachTrust 0/100',async t=>{
  const mod=await get08(t);if(!mod)return;
  const {normalizePlayer}=mod.model;
  const camp={comune:'Napoli',regione:'Campania',macroregione:'Sud'};
  const coach={origin:{comune:'Salerno',regione:'Campania'},traits:{leadership:70}};
  const response=trust=>{
    const base=makeFixture('cross08');
    const target=normalizePlayer({...base.homeClub.players[9],origin:camp,
      relationships:{coachTrust:trust}});
    base.homeClub.players[9]=target;
    const match=createMatch(base);match.step(300);
    const command=createIndividualShoutCommand({teamId:base.homeClub.id,player:target,coach,tone:'gentle'});
    const result=match.command(command);
    assert.equal(result.accepted,true);
    return result.effects;
  };
  const a=response(0),b=response(100);
  assert.ok(b.temporaryEffect.modifier>a.temporaryEffect.modifier);
  assert.equal(a.coachTrustAtCommand,0);assert.equal(b.coachTrustAtCommand,100);
});

test('R10 cross-module: generated 08 players across 100 deterministic matches',async t=>{
  const mod=await get08(t);if(!mod)return;
  const coach={origin:{comune:'Napoli',regione:'Campania',macroregione:'Sud'},
    traits:{leadership:75}};
  for(let seed=0;seed<100;seed++){
    const run=()=>{
      const input=real08Input(mod.generator.generateSquad,seed),match=createMatch(input);
      const player=input.homeClub.players[9];
      assert.ok(player.origin?.regione&&player.origin?.macroregione);
      assert.ok(Number.isFinite(player.relationships.coachTrust));
      const instruction=createIndividualShoutCommand({
        teamId:input.homeClub.id,player,coach,tone:seed%2?'gentle':'hard'
      });
      const accepted=match.command(instruction);
      assert.equal(accepted.accepted,true);
      match.step(1800);
      const sub=match.command({type:'substitution',teamId:input.homeClub.id,
        payload:{outId:input.homeXI[10],inId:input.homeBench[1]}});
      assert.equal(sub.accepted,true);
      match.step(3600);
      const events=match.getEventsSince(),snapshot=match.snapshot();
      assert.equal(snapshot.t,5400);
      assert.equal(snapshot.score.home+snapshot.score.away,
        events.filter(e=>e.type==='goal').length);
      assert.equal(events.filter(e=>e.type==='coach_shout').length,1);
      const effects=collectCoachEffects(events,[],{matchId:'1979-CROSS-'+seed});
      const retry=collectCoachEffects(JSON.parse(JSON.stringify(events)),
        JSON.parse(JSON.stringify(effects.appliedEventIds)),{matchId:'1979-CROSS-'+seed});
      assert.equal(effects.effects.length,1);
      assert.equal(retry.effects.length,0);
      return JSON.stringify({snapshot,events});
    };
    const signature=run();
    if(seed<10)assert.equal(signature,run(),'real PlayerV2 replay mismatch '+seed);
  }
});
