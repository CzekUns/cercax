# ORONZO — Audit R01 del nucleo partita

**Verdetto: needs changes.** I tre moduli possono scambiarsi rose e snapshot di base. Prima dell'innesto servono correzioni mirate alle convenzioni visive, al passaggio degli eventi e al consumo degli attributi. Nessun P0 emerso nel perimetro testato.

| PR | HEAD verificato | Esito per l'integrazione |
|---|---|---|
| [#18](https://github.com/CzekUns/cercax/pull/18) | `71fa0aeac7dd694a8cae4962e35205a86c1579c0` | needs changes |
| [#15](https://github.com/CzekUns/cercax/pull/15) | `5558c89f5104b40e49f74158b868e53966612dee` | needs changes |
| [#16](https://github.com/CzekUns/cercax/pull/16) | `9105014b569e3290ba86590f597c2202dbca846e` | ready for orchestrator QA come produttore PlayerV1 e consumatore degli eventi supportati |

Gli HEAD coincidono con REQUEST. Tutte e tre le PR risultavano aperte e senza merge. I REPORT degli agenti ai rispettivi HEAD hanno restituito 404. Riferimenti usati: codice, test, NEXT e note d'integrazione.

## Cinque problemi P1

1. **Orientamento degli sprite — verificato, Agenti 5 e 6.** Il motore emette `facing=1/-1` come segno orizzontale. La vista interpreta entrambi come radianti: al calcio d'inizio seed 42 la casa risulta SE e l'ospite NE invece di E e W. Concordare una convenzione non ambigua. Preferibile emettere direzioni cardinali o vettori, mantenendo a riposo l'ultima direzione o il lato d'attacco. Testare fermi e corse nelle otto direzioni. [Motore](https://github.com/CzekUns/cercax/blob/71fa0aeac7dd694a8cae4962e35205a86c1579c0/oronzo/systems/match-engine/movement.js#L23-L30) · [Vista](https://github.com/CzekUns/cercax/blob/5558c89f5104b40e49f74158b868e53966612dee/oronzo/systems/match-view/interpolation.js#L11-L20)
2. **Interpolazione attraverso il campo alla ripresa — verificato, Agente 5.** Fra t=2699 e t=2700, con `halftime` e `kickoff`, la vista campiona il portiere di casa a x=0,048 mentre il nuovo snapshot lo colloca a x=0,945. La stessa logica interpola la palla. Azzerare il blend per il nuovo snapshot su un `kickoff` inedito o cambio di tempo, conservando pausa e velocità. Testare anche la ripresa dopo gol. [Emissione](https://github.com/CzekUns/cercax/blob/71fa0aeac7dd694a8cae4962e35205a86c1579c0/oronzo/systems/match-engine/match-engine.js#L103-L116) · [Blend](https://github.com/CzekUns/cercax/blob/5558c89f5104b40e49f74158b868e53966612dee/oronzo/systems/match-view/interpolation.js#L57-L91)
3. **Decisioni, forma e salute non incidono come valori graduati — verificato, Agente 6 con Agente 8.** `technical.decisions` viene prodotto da #16, mentre il passaggio legge `mental.decisions` e cade sul default 50. `fitness` è ignorato e `health` serve solo a escludere chi ha 0. Variando per tutta la casa `decisions/fitness` da 0 a 100 e `health` da 1 a 100, seed 42, snapshot finale ed eventi sono identici. Leggere `technical.decisions` e concordare modificatori di forma/salute. Se si inietta `effectiveAbility`, sostituire i modificatori equivalenti per evitare il doppio conteggio, mantenendo l'RNG del motore. [Passaggio](https://github.com/CzekUns/cercax/blob/71fa0aeac7dd694a8cae4962e35205a86c1579c0/oronzo/systems/match-engine/actions.js#L98-L103) · [Preparazione](https://github.com/CzekUns/cercax/blob/71fa0aeac7dd694a8cae4962e35205a86c1579c0/oronzo/systems/match-engine/match-engine.js#L23-L32) · [PlayerV1](https://github.com/CzekUns/cercax/blob/9105014b569e3290ba86590f597c2202dbca846e/oronzo/systems/attributes/player-model.js#L3-L8)
4. **Cambio accettato, evento perso dal feed a snapshot — verificato, Agente 6 e runner d'integrazione.** `command(substitution)` seguito da `advanceRealSeconds(1/60)` aggiorna l'XI, ma lo snapshot d'avanzamento non contiene il cambio, presente nel log persistente. Anche gli ID portiere configurati nella vista restano quelli iniziali finché il runner non chiama `setKeepers`. Usare `getEventsSince(lastId)` come feed autorevole del runner, processare una volta ogni ID prima di disegnare e aggiornare i portieri sul cambio. [Reset eventi](https://github.com/CzekUns/cercax/blob/71fa0aeac7dd694a8cae4962e35205a86c1579c0/oronzo/systems/match-engine/match-engine.js#L94-L102) · [Cambio](https://github.com/CzekUns/cercax/blob/71fa0aeac7dd694a8cae4962e35205a86c1579c0/oronzo/systems/match-engine/commands.js#L46-L61) · [Vista](https://github.com/CzekUns/cercax/blob/5558c89f5104b40e49f74158b868e53966612dee/oronzo/systems/match-view/match-view.js#L139-L153)
5. **Assist assenti dal feed per lo storico — verificato, Agente 6 con Agente 8.** Nel match di prova l'unico gol accredita il marcatore, ma il payload ha solo `from/xg/score`. Il produttore non emette `assist` né `goal.detail.assistId`, gli unici due ingressi riconosciuti da #16. Gli assist non sono quindi misurabili con il feed corrente. Se inclusi nello storico, tracciare nel motore l'ultimo passaggio utile della stessa azione e pubblicare `goal.detail.assistId` opzionale. Testare anche gol senza assist e interruzione del possesso. [Evento gol](https://github.com/CzekUns/cercax/blob/71fa0aeac7dd694a8cae4962e35205a86c1579c0/oronzo/systems/match-engine/actions.js#L225-L233) · [Storico](https://github.com/CzekUns/cercax/blob/9105014b569e3290ba86590f597c2202dbca846e/oronzo/systems/attributes/career-stats.js#L18-L37)

## Matrice delle interfacce

| Origine → destinazione | Compatibilità | Intervento |
|---|---|---|
| #16 `generateSquad` → #18 `createMatch` | OK per schema base, XI e panchina. INCOMPATIBILE per gli attributi del punto 3 | Agenti 6/8: passare PlayerV1 in `ClubV1.players` e ID negli XI/panchine, correggere letture e modificatori |
| #18 `snapshot/step/advanceRealSeconds` → #15 `render` | OK per coordinate, ID, tempo simulato e forma dello snapshot. INCOMPATIBILE per orientamento, riprese e cambi con il solo feed a tick | Agenti 5/6 e runner: punti 1, 2, 4. Allineare anche la scala di `energy` prima di usarla in UI: motore 0–100, vista la limita a 0–1 |
| #18 log eventi → #16 `recordMatch` | OK per il gol del marcatore riprodotto. INCOMPATIBILE per assist | Agenti 6/8: punto 5. Il chiamante fornisce `minutes` e `started` |
| #18 → #15 su dispositivo con asset reali | NON VERIFICATO | QA visuale fuori perimetro. La prova qui usa il percorso logico d'interpolazione |

## Test e riproduzione

Node 24.22.1, sorgenti dai tre HEAD in una directory temporanea con struttura comune. Da `oronzo/systems`, `node --test */tests/* match-view/*.test.mjs`: **39 passati, 0 falliti**. `node match-engine/cli-demo.mjs 10`: completato. La prova incrociata con rose di #16, motore #18 e interpolatore #15 accetta 22 giocatori, riproduce i difetti sopra, conclude 0–1 a t=5400, conferma un gol da evento, parità del log con batching diverso e rapporto del clock 60× a 1×, 2×, 4× e 8× con pausa. Nessuna verifica visuale su smartphone.

<details>
<summary>Script di riproduzione da oronzo/systems (smoke.mjs)</summary>

```js
import assert from 'node:assert/strict';
import {generateSquad} from './attributes/generator.js';
import {createCareerRecord,recordMatch} from './attributes/career-stats.js';
import {createMatch} from './match-engine/match-engine.js';
import {makeFixture} from './match-engine/fixtures.js';
import {SnapshotInterpolator,resolveFacing} from './match-view/interpolation.js';
const input=makeFixture(42);
for(const side of ['home','away']){
 const club=input[side+'Club']; club.players=generateSquad({seed:42,teamId:club.id});
 input[side+'XI']=club.players.slice(0,11).map(p=>p.id);
 input[side+'Bench']=club.players.slice(11).map(p=>p.id);
}
const m=createMatch(input), v=new SnapshotInterpolator();
const opening=m.snapshot();v.push(opening,0);
assert.equal(v.sample(0).players.length,22);
for(const p of [opening.players[0],opening.players[11]]) console.log('facing',p.facing,resolveFacing(p.facing),'energy',p.energy);
const outId=input.homeXI[0],inId=input.homeBench[0];
const accepted=m.command({type:'substitution',teamId:input.homeClub.id,payload:{outId,inId}});
assert(accepted.accepted);
const lost=m.advanceRealSeconds(1/60);
assert(!lost.events.some(e=>e.type==='substitution'));
assert(m.getEventsSince().some(e=>e.type==='substitution'));
assert(lost.players.some(p=>p.id===inId));assert(!lost.players.some(p=>p.id===outId));
console.log('substitution: lineup updated, tick event lost, cursor recovered');
const prev=m.step(2698);const next=m.step(1);v.push(prev,0);v.push(next,16);
assert(next.events.some(e=>e.type==='kickoff'));
const sample=v.sample(16);
assert.notEqual(sample.players[0].x,next.players[0].x);
console.log('halftime keeper x sampled/engine',sample.players[0].x,next.players[0].x);
const end=m.step(2700);const events=m.getEventsSince();
assert.equal(end.t,5400);assert.equal(events.filter(e=>e.type==='goal').length,end.score.home+end.score.away);
const goal=events.find(e=>e.type==='goal'); assert(goal); assert.equal(goal.detail.assistId,undefined);
const stats=recordMatch(createCareerRecord(goal.playerId),{playerId:goal.playerId,id:'42',seasonId:'1985-86',minutes:90,started:true,events});
console.log('end',end.score,'scorer goals',stats.delta.goals,'goal detail keys',Object.keys(goal.detail));
const run=(n)=>{const data=structuredClone(input);for(const p of data.homeClub.players){p.technical.decisions=n;p.status.fitness=n;p.status.health=n===0?1:n;}const game=createMatch(data);return game.step(5400);};
assert.deepEqual(run(0),run(100));console.log('decisions/fitness 0 vs 100, health 1 vs 100: same final snapshot and tick events');
const replay=createMatch(input);replay.command({type:'substitution',teamId:input.homeClub.id,payload:{outId,inId}});replay.step(5400);
assert.deepEqual(replay.getEventsSince(),events);console.log('determinism: same seed and commands, different dt batches, same event log');
for(const speed of [1,2,4,8]){const g=createMatch(input);g.setSpeed(speed);assert.equal(g.advanceRealSeconds(1).t,60*speed);g.setPaused(true);assert.equal(g.advanceRealSeconds(1).t,60*speed);}
```
</details>

## Priorità per l'orchestratore

1. Assegnare agli agenti 5/6 una convenzione per `facing` e una prova di ripresa senza blend tra i lati.
2. Far concordare agli agenti 6/8 le letture degli attributi e il payload assist.
3. Collegare il runner al cursore eventi e rieseguire lo smoke test con sostituzione del portiere.
