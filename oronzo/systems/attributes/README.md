# ORONZO — Attributi, personalità e allenamento (Agente 8)

**Stato:** implementato e testato indipendentemente. **NON ancora integrato** nel prototipo `oronzo/game.js`.

Sistema JavaScript ESM senza dipendenze obbligatorie, compatibile con il contratto `PlayerV1` in `oronzo/engine-contract.md`.

## Demo interattiva

Aprire `oronzo/systems/attributes/demo.html` con GitHub Pages oppure un server statico. Interfaccia **landscape 16:9**. Si possono generare 22 giocatori con seed riproducibile, consultare le loro statistiche, scegliere un allenamento settimanale, caricare 90 minuti e chiudere una stagione. La demo NON genera gol o risultati. Per il browser è preferibile un server HTTP: `python -m http.server` dalla root (i moduli ESM su `file://` possono essere bloccati).

## Moduli pubblici

| Modulo | API |
|---|---|
| `rng.js` | `createRng(seed)`, `seedNumber`, `clamp`, `pick`, `range`, `triangular` |
| `player-model.js` | `normalizePlayer`, `createPlayer`, `validatePlayer`, `importLegacyPlayers`, `ATTRIBUTE_KEYS`, `POSITIONS` |
| `generator.js` | `generatePlayer({seed,teamId,index,role,teamLevel,archetype})`, `generatePlayers(count,options)`, `generateSquad(options)`, `generateLeague(options)` |
| `personality.js` | `effectiveAbility(player,context)`, `resolveAction(player,context,rng)`, `trainingInjuryProbability(player,load)` |
| `training.js` | `TRAINING_PLANS`, `applyTrainingWeek(players,plan,options)`, `applyMatchLoad(players,minutesById,options)`, `applyObservedInjury(player,days)`, `advanceSeason(players,options)` |
| `career-stats.js` | `createCareerRecord(player)`, `recordMatch(record,match)`, `recordSeasonSnapshot(record,seasonId,player)` |

`PlayerV1` comprende `id:string`, `name`, `teamId:string`, `age`, `positions`, `technical`, `physical`, `mental`, `status`. I campi obbligatori del contratto sono presenti. Le estensioni sono `technical.vision/dribbling`, `physical.acceleration`, `mental.ambition`, `foot`, `personality`, `relationships`, `development`. Attributi e indicatori 0–100; giorni infortunio 0–365, giornate squalifica 0–30.

Ruoli: `GK` portiere, `DF` difensore, `MF` centrocampista, `FW` attaccante. Importer legacy: `POR/DIF/CEN/ATT` con conversione di `tech,speed,stamina,luck,character,confidence,health,morale,fatigue`; mantiene anche proprietà originarie (`starter`, ecc.) per migrazioni progressive. Gli ID sono stringhe stabili.

## Collega la probabilità al motore partita

```js
import { effectiveAbility, resolveAction } from './personality.js';
import { createRng } from './rng.js';
const rng = createRng('partita-001');
const rating = effectiveAbility(player, {
  skill: 'shooting',
  pressure: 75,
  teamAction: true,
  tacticalDemand: 70,
  requiresInstruction: true,
  leaderAura: 65,
  allyId: 'club-1-015'
});
const attempt = resolveAction(player, {skill:'shooting',pressure:75}, rng);
// attempt.success riguarda l'esecuzione di una singola azione.
// Il motore decide autonomamente se ciò produca un tiro, una parata o un gol.
```

`effectiveAbility` è pura: restituisce `base`, `effective` (0–100), `executionProbability` (0.01–0.99), `adherence`, `luckDelta`, `modifiers`, senza consumare casualità. Fatica alta penalizza fino a 23 punti; forma, salute, sicurezza, morale, autocontrollo sotto pressione, rapporti e leadership producono modificatori misurabili. Disciplina e collaborazione incidono sull'adesione alle istruzioni. Fortuna: margine ristretto di **±2,5 punti percentuali** di probabilità; nessun fallimento automatico. Usare un unico lancio RNG per ogni azione effettivamente valutata, e non interpretare `success` come un evento `goal`.

## Allenamenti, recupero e stagioni

Piani: `technical`, `athletic`, `tactical`, `balanced`, `rest`; oppure `{load:0..100,skills:[]}`. Allenamento:

```js
const {players:trained, incidents} = applyTrainingWeek(club.players,'technical',{
  seed: 'carriera-1985', week: 7, coachQuality: 60, intensity: 50
});
const postMatch = applyMatchLoad(trained,{'club-1-001':90});
const nextSeason = advanceSeason(postMatch,{seed:'carriera-1985',season:'1985-86'});
```

L'allenamento restituisce oggetti **nuovi**, progressi frazionari limitati dal potenziale, fatica, condizione e rari infortuni da allenamento generati con seed. I giovani migliorano più velocemente; il decadimento fisico inizia dopo un picco individuale. `applyMatchLoad` usa i minuti realmente giocati e non inventa eventi di partita. Eventuali infortuni in partita si applicano **solo dopo** un evento reale dell'engine via `applyObservedInjury`.

`recordMatch(record,{id,seasonId,playerId,minutes,started,events})` registra presenze, minuti, gol, assist, cartellini e infortuni soltanto da dati/azioni reali del motore. I doppi eventi di assist vengono riconciliati; la ripetizione del medesimo ID partita è idempotente. `recordSeasonSnapshot` archivia le capacità per anno. Rosa e storico sono serializzabili in JSON.

## Test replicabili

Da root repository su Node 20+:

```bash
node --test oronzo/systems/attributes/tests/*.test.js
```

Test di 120 giocatori, 8 squadre/176 calciatori, 11 titolari più riserve, generazione a seed, posizioni e archetipi, invarianti numeriche, import dei vecchi salvataggi, probabilità di fortuna e infortuni, carichi, riposo, crescita, declino e registri storici. Il codice è anche testato localmente con Node v22; l'integrazione col progetto globale richiederà test distinti.

## Limiti

- La demo principale e il match engine restano di proprietà dell'orchestratore e degli altri agenti. Questo sistema non cambia score, calendari, bilanci o dialoghi.
- I giorni di stop sono un modello ludico approssimativo, non una diagnosi.
- Chiamare `applyTrainingWeek` **una sola volta** per settimana. Il chiamante deve registrare la settimana completata; questa funzione non fa deduplica temporale.
- Le posizioni sono categorie base PlayerV1; eventuali sottoruoli tattici saranno estensioni interoperabili.

