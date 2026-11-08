// Reproducible Node cross-PR integration gate; runs after #35 files are present in checkout.
// Until then it is SKIPPED, not falsely marked passed. Independently exercised in V8 against #35 HEAD.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSquad} from '../generator.js';
import {toMatchEnginePlayer,toIndividualShoutCommand} from '../player-engine-bridge.js';
import {effectiveAbility} from '../personality.js';
let engine=null,fixtureMaker=null,orders=null,ledger=null;
try {
 const pack=await Promise.all([
  import('../../match-engine/match-engine.js'),
  import('../../match-engine/fixtures.js'),
  import('../../match-engine/orders.js'),
  import('../../match-engine/coach-effects.js')
 ]);
 engine=pack[0];fixtureMaker=pack[1];orders=pack[2];ledger=pack[3];
} catch(error) {
 if(error?.code!=='ERR_MODULE_NOT_FOUND')throw error;
}
const unavailable=!engine?'Merge/check out Agent 06 PR #35 to execute real match integration':false;
function setup(homeOrigin={comune:'Napoli',regione:'Campania'}){
 const f=fixtureMaker.makeFixture('m1-pr35-contract');
 const h=generateSquad({seed:1979,teamId:f.homeClub.id,origins:[homeOrigin]});
 const a=generateSquad({seed:1980,teamId:f.awayClub.id,origins:[{comune:'Roma',regione:'Lazio'}]});
 f.homeClub.players=h.map(toMatchEnginePlayer);
 f.awayClub.players=a.map(toMatchEnginePlayer);
 f.homeXI=h.slice(0,11).map(p=>p.id);f.homeBench=h.slice(11).map(p=>p.id);
 f.awayXI=a.slice(0,11).map(p=>p.id);f.awayBench=a.slice(11).map(p=>p.id);
 return f;
}
function issue(f,coachOrigin,tone='gentle'){
 return toIndividualShoutCommand({teamId:f.homeClub.id,player:f.homeClub.players[9],
  coachOrigin,tone,coachLeadership:60,utteranceId:'copy-original-1'});
}
test('M1 08+06: real PlayerV2 11v11, canonical regional affinity and 150s ownership',{skip:unavailable},()=>{
 const f=setup(),m=engine.createMatch(f);
 assert.equal(m.snapshot().players.length,22);
 const r=m.command(issue(f,{comune:'Salerno',regione:'Campania'}));
 assert.equal(r.accepted,true);
 assert.equal(r.effects.affinity,'region');
 assert.equal(r.effects.tone,'encourage');
 assert.equal(r.effects.attributesTone,'gentle');
 assert.equal(r.effects.temporaryOwner,'match-engine-06');
 assert.equal(r.effects.persistentOwner,'coach-club-09');
 assert.equal(r.effects.temporaryEffect.expiresAt,150);
 assert.equal(orders.individualPerformanceFactor({personalShout:{modifier:.05,startedAt:0,expiresAt:150}},150),1);
});
test('M1 08+06: same seed region > macro > other, harsh effect reads trust=0',{skip:unavailable},()=>{
 const outcome=coach=>{const f=setup(),m=engine.createMatch(f);m.step(100);
  return m.command(issue(f,coach)).effects;};
 const same=outcome({comune:'Salerno',regione:'Campania'});
 const macro=outcome({comune:'Bari',regione:'Puglia'});
 const other=outcome({comune:'Roma',regione:'Lazio'});
 assert.ok(same.temporaryEffect.modifier>macro.temporaryEffect.modifier);
 assert.ok(macro.temporaryEffect.modifier>other.temporaryEffect.modifier);
 const f=setup();f.homeClub.players[9].relationships.coachTrust=0;
 f.homeClub.players[9].relationshipWithCoach=100;
 const r=engine.createMatch(f).command(issue(f,{comune:'Napoli',regione:'Campania'},'hard'));
 assert.equal(r.accepted,true);assert.equal(r.effects.coachTrustAtCommand,0);
});
test('M1 08+06+09: coach event ledger remains idempotent after JSON reload, no 08 180s',{skip:unavailable},()=>{
 const f=setup(),m=engine.createMatch(f);
 assert.equal(m.command(issue(f,{comune:'Napoli',regione:'Campania'})).accepted,true);
 const events=m.getEventsSince().filter(e=>e.type==='coach_shout');
 const once=ledger.collectCoachEffects([...events,...events],[],{matchId:'1979-1'});
 assert.equal(once.effects.length,1);
 const restored=JSON.parse(JSON.stringify(once.appliedEventIds));
 assert.equal(ledger.collectCoachEffects(events,restored,{matchId:'1979-1'}).effects.length,0);
 const p=f.homeClub.players[9];p.temporaryEffects=[{kind:'coach-shout',bonus:8,expiresAt:180}];
 assert.equal(effectiveAbility(p,{skill:'shooting',t:100}).modifiers.temporary,0);
});
