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

`render(snapshot)` non imposta un altro timer di simulazione. Soltanto il runner chiama `engine.step(dt)`. Il renderer usa `t` per calcolare il tempo di transizione; presuppone che 1× faccia trascorrere 60 secondi di gioco per secondo reale (5400s / 90s), valore configurabile `simSecondsPerRealSecond`. Il backend può emettere snapshot a cadenza diversa, ma deve sempre includere `t` monotono. `setSpeed` e `setPaused` devono essere chiamati **insieme ai comandi del runner**.

`facing` opzionale: cardinale, radianti o vettore. Azioni consigliate: `idle`, `run`, `sprint`, `chase`, `unmark`, `dribble`, `pass`, `shot`, `tackle`, `save`. La vista usa l'immagine `kick` per pass/shot, `keeper` per save, `tackle` per intercettazioni, `run` per corse e smarcamento; senza un'action la velocità determina il passo e il resto è `idle`.

### Eventi cutscene

Eventi `MatchSnapshotV1.events[]` con `id` stabile, `type` (`goal`, `save`, `card`, `injury`), `t`, `playerId`, `detail.color` per cartellini. Deduplica per ID e cooldown visivo per tipo. L'intermezzo sovrappone 320×180 e non congela l'avanzamento della simulazione; nessun goal o tiro calcolato nella vista.

### Verifica QA al merge

- Integrare PR Agente 1/2 e questa PR in branch d'integrazione, poi servire su HTTP la demo. **Non** usare `file://`.
- Controllare console senza errori PNG e vedere sparire `FALLBACK ASSET`; testare 640×360, 800×360, 844×390 e smartphone landscape. I pixel della canvas logica non cambiano al resize.
- Verificare colori kit, 8 orientazioni, idle/run/kick/tackle/keeper, pallone, overlay gol/parata/cartellino/infortunio e riciclo overlay senza duplicati.
- Collegare l'Agente 6; verificare che il risultato e il possesso visibili siano solo quelli del motore, che durante pausa non avanzino e che 1×/2×/4×/8× non producano teleport.
- `node --test oronzo/systems/match-view/*.test.mjs`; il test copre logic/interpolation/asset failures. Eseguire anche test visivi da browser con i PNG mergeati.

## Follow-up degli altri agenti

Chiedere all'Agente 6 ID fissi tra tick e ruoli portiere in `MatchInputV1`, all'Agente 1/2 di mantenere i nomi/format dichiarati nel manifest. Solo l'orchestratore deve collegare scoreboard e commentario dell'UI: la vista non li duplica.