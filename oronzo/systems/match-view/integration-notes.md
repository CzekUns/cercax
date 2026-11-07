# ORONZO — Integrazione match-view nel runtime

**Scope modificato da Agente 5:** solo `oronzo/systems/match-view/`. `oronzo/game.js`, `index.html`, `ui.css`, `oronzo/assets/players/`, `oronzo/assets/cutscenes/` sono rimasti intatti. Non dichiarare questa PR già connessa al prototipo.

## Dipendenze su branch altri agenti

1. Agente 1 (`agent/oronzo-players`) porta `oronzo/assets/players/manifest.json`, i 5 atlas `idle/run/kick/tackle/keeper.png` e le relative maschere (`*-mask.png`), più `ball.png`. Il manifest effettivo dichiara `atlas.width=256`, `height=128`, celle 32×32, direzione per colonna, quattro frame per riga. La vista legge **i rettangoli da `actions[action].directions[dir][frame]`**, usa pivot `16,29`, ricolora materiali tramite maschere e conserva in cache palette per squadra.
2. Agente 2 (`agent/oronzo-cutscenes`) porta `manifest.json`, cinque strisce, maschere materiale/ombra, sfondi di stadio. Il suo manifest mappa `goal`, `save`, `yellow`, `red`, `injury`; la vista disegna le strisce 320×180 a 1× pixel logico usando gli stessi mask IDs. Le palette scene sono adattate dai colori della squadra; pattern complessi delle maglie (strisce/halves) non ancora replicati nelle cutscene: **limite visivo non bloccante**, il colore base è corretto.
3. Agente 6 (`agent/oronzo-match-engine`) deve fornire `MatchSnapshotV1` come da `oronzo/engine-contract.md`. La vista non deve leggere variabili private della IIFE esistente.

## Inserimento futuro nell'orchestratore (non eseguito qui)

La pagina esistente sceglierà un canvas `640×360` e importerà il modulo ESM. Idealmente attaccare il renderer al ciclo del match engine, **non** alla vecchia funzione procedurale `draw()`.

```js
import {createMatchView} from './systems/match-view/match-view.js';
const mv=createMatchView(matchCanvas,{config:{
  homeTeamId: matchInput.homeClub.id,
  awayTeamId: matchInput.awayClub.id,
  keeperIds:[homeGoalkeeperId,awayGoalkeeperId],
  appearances:{home:homeKit,away:awayKit,homeKeeper:homeKeeperKit,awayKeeper:awayKeeperKit}
}});
// Ogni nuovo snapshot *emesso* dall'Agente 6:
mv.render(snapshot);
// Gli stessi controlli che muovono il runner del motore:
mv.setPaused(paused);
mv.setSpeed(speed);
// Cambio pagina/unmount:
mv.destroy();
```

### Handoff evento continuo consigliato (FIX ORZ-P1-004)

Usare **questo** bridge invece di alimentare direttamente `render(match.step(...))` con i soli
`tickEvents`: l'API `command(substitution)` dell'Agente 6 emette un evento che lo `step()`
successivo cancella dal campo `events` temporaneo. Il log con `getEventsSince(lastId)` resta valido.

```js
import {createMatchView,createEngineViewBridge} from './systems/match-view/match-view.js';
const mv=createMatchView(matchCanvas,{config:{
  homeTeamId:matchInput.homeClub.id, awayTeamId:matchInput.awayClub.id,
  keeperIds:[homeGoalkeeperId,awayGoalkeeperId]
}});
const bridge=createEngineViewBridge(match,mv,{
  keeperIds:[homeGoalkeeperId,awayGoalkeeperId],initialEventId:0
});
bridge.sync(); // evento kickoff iniziale
function onEngineAdvanced(deltaRealSeconds) {
  match.advanceRealSeconds(deltaRealSeconds);  // SOLO runner: autorita' della simulazione
  bridge.sync();                               // 1x getEventsSince(cursor), render snapshot
}
// Gli ordini del mister restano responsabilita' del runner:
const result=match.command({type:'substitution',teamId:matchInput.homeClub.id,
  payload:{outId:homeGoalkeeperId,inId:replacementGoalkeeperId}});
if(result.accepted) bridge.sync(); // evento e XI aggiornati, prima dello step successivo
// Sincronizzare pausa e velocita' su entrambi i moduli.
match.setPaused(true);mv.setPaused(true);
match.setSpeed(2);mv.setSpeed(2);
// Al termine: mv.destroy();
```

Il bridge richiede ID eventi **interi numerici e monotoni** come nella PR #18.
La `substitution` deve avere `detail.outId` e `detail.inId`; `setKeepers()` aggiorna
il giocatore con atlas `keeper`. Un `render()` diretto sincronizza comunque i GK
se riceve l'evento nel suo snapshot, ma non puo' recuperare eventi perduti.
Se il runner gestisce gia' il cursore, puo' fare il medesimo lavoro senza creare il bridge;
non chiamare entrambi i canali in parallelo.

### Convenzioni allineate con #18 (FIX ORZ-P1-001, 002, P2-001)

- `facing: 1` significa **E** e `facing: -1` **W**, anche per i giocatori fermi;
  altre direzioni con stringhe N/NE/E/SE/S/SW/W/NW o `{x,y}`. Per radianti usare `{radians:number}`.
- `kickoff` e `halftime` sono **tagli istantanei di scena**, come il cambio di `phase`;
  niente blend attraverso il campo; normale movimento fra tick continua interpolato.
- `energy` in `MatchSnapshotV1` motore e' un valore **0..100**: `normalizeEnergy`
  lo converte a **0..1** nella copia visiva. Non inviare energia gia' normalizzata
  senza adattarla alla scala del contratto.

`render(snapshot)` non imposta un altro timer di simulazione. Soltanto il runner chiama `engine.step(dt)`. Il renderer usa `t` per calcolare il tempo di transizione; presuppone che 1× faccia trascorrere 60 secondi di gioco per secondo reale (5400s / 90s), valore configurabile `simSecondsPerRealSecond`. Il backend può emettere snapshot a cadenza diversa, ma deve sempre includere `t` monotono. `setSpeed` e `setPaused` devono essere chiamati **insieme ai comandi del runner**.

`facing` opzionale: cardinale, segno E/W ±1, vettore o oggetto radianti. Azioni consigliate: `idle`, `run`, `sprint`, `chase`, `unmark`, `dribble`, `pass`, `shot`, `tackle`, `save`. La vista usa l'immagine `kick` per pass/shot, `keeper` per save, `tackle` per intercettazioni, `run` per corse e smarcamento; senza un'action la velocità determina il passo e il resto è `idle`.

### Eventi cutscene

Eventi `MatchSnapshotV1.events[]` con `id` stabile, `type` (`goal`, `save`, `card`, `injury`), `t`, `playerId`, `detail.color` per cartellini. Deduplica per ID e cooldown visivo per tipo. L'intermezzo sovrappone 320×180 e non congela l'avanzamento della simulazione; nessun goal o tiro calcolato nella vista.

### Verifica QA al merge

- Integrare PR Agente 1/2 e questa PR in branch d'integrazione, poi servire su HTTP la demo. **Non** usare `file://`.
- Controllare console senza errori PNG e vedere sparire `FALLBACK ASSET`; testare 640×360, 800×360, 844×390 e smartphone landscape. I pixel della canvas logica non cambiano al resize.
- Verificare colori kit, 8 orientazioni, idle/run/kick/tackle/keeper, pallone, overlay gol/parata/cartellino/infortunio e riciclo overlay senza duplicati.
- Collegare l'Agente 6; verificare che il risultato e il possesso visibili siano solo quelli del motore, che durante pausa non avanzino e che 1×/2×/4×/8× non producano teleport.
- `node --test oronzo/systems/match-view/*.test.mjs`; 22 test locali superati, inclusa la regressione `compatibility.test.mjs` per orientamento, intervallo, sostituzioni ed energia. Eseguire anche test visivi da browser con i PNG mergeati.

## Follow-up degli altri agenti

Chiedere all'Agente 6 ID fissi tra tick e ruoli portiere in `MatchInputV1`, all'Agente 1/2 di mantenere i nomi/format dichiarati nel manifest. Solo l'orchestratore deve collegare scoreboard e commentario dell'UI: la vista non li duplica.