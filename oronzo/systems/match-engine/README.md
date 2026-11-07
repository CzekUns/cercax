# ORONZO · Football simulation engine (Agente 6)

Motore calcistico autonomo, ESM nativo, seed deterministico, **nessuna dipendenza** e **nessuna dipendenza dal DOM**. Unica directory di competenza: `oronzo/systems/match-engine/`.

## Quick start

Dalla directory di questo modulo:

```bash
node --test
node cli-demo.mjs 10
npm run qa       # oppure node cli-qa.mjs · 100 seed e 10 replay
```

Apri anche `demo.html` tramite un server statico locale o GitHub Pages per un pannello diagnostico 16:9 (non la grafica finale dell'Agente 5).

## API

```js
import { createMatch } from './match-engine.js';
import { makeFixture } from './fixtures.js';

const match = createMatch(makeFixture('giornata-01'));
const first = match.snapshot();                 // MatchSnapshotV1
const update = match.step(30);                  // 30 secondi di partita
const recent = match.getEventsSince(0);        // log completo ordinato
const command = match.command({
  type: 'tacticChange',
  teamId: 'montevento',
  payload: { formation:'3-5-2', pressing:85, mentality:80 }
});
const sub = match.command({
  type: 'substitution', teamId:'montevento',
  payload:{outId:'montevento-10',inId:'montevento-11'}
});
match.setPaused(true);                         // congela il tempo
match.setPaused(false);
match.setSpeed(2);                             // 1,2,4,8
match.advanceRealSeconds(1);                   // +120 s simulati a 2×
match.isFinished();                            // true a t=5400
```

`step(dt,commands?)` accetta **secondi simulati** non negativi; se presenti, i comandi hanno effetto prima dell'avanzamento. Restituisce lo snapshot con `commandResults`, uno per ordine (`accepted`, `reason`, `effects`). `command(command)` applica subito un ordine e restituisce lo stesso esito. `advanceRealSeconds(seconds, commands?)` è un helper **legacy v1** (1×=60 s simulati per secondo reale, 90 secondi totali). La **visione v0.2** richiede 90 minuti simulati in circa 15 minuti reali: la pagina integratrice deve chiamare `step(realDt*6*speed)` con speed 1/2/4/8, senza passare da `advanceRealSeconds`; nessun clock di carriera è stato implementato nel motore. Il core simula a passi interi da 1 s: chiamate con frazioni accumulano il residuo.

**Schema di input**: `MatchInputV1` da `../engine-contract.md` (percorso concettuale), con `homeClub/awayClub`, 11 ID unici per XI, ID della panchina, seed e tattiche opzionali. I club e calciatori sono **copiati** all'avvio: l'engine non altera le anagrafiche dell'Agente 8. Il portiere deve avere `positions:['GK']` (un solo GK per XI) ed è disposto nello slot zero. Gli altri giocatori sono disposti secondo l'ordine dell'XI; l'orchestratore dovrebbe ordinarli per ruolo.

**Tattiche**: `formation` in `4-4-2`, `4-3-3`, `3-5-2`, `4-2-3-1`, `5-3-2`; `mentality`, `pressing`, `tempo`, `width` in [0,100]; `marking` uguale `zonal` o `man`. I campi non forniti ricevono valori neutrali; gli sconosciuti sono rifiutati. Un `shout` usa `payload.tone` tra `encourage`, `focus`, `calm`, `push`, dura 180 secondi simulati e ha cooldown di 120 s. Le direttive influiscono su accelerazione, pressing, passaggio, falli o tiro.

**Regole**: `competitionRules.maxSubstitutions` è configurabile e per default è **2**, coerentemente con il massimo previsto dalla legge III IFAB 1985–86 per gare ufficiali (vedi [Laws of the Game 1985–86](https://downloads.theifab.com/downloads/laws-of-the-game-1985-86?l=es)). Il punteggio in classifica, in Serie A 1985/86 2 punti per vittoria, appartiene all'Agente 7, non al motore partita. Non vengono introdotti 5 cambi per impostazione predefinita.

## Snapshot verso Agente 5

`{t,minute,phase,score,players,ball,stats,events,possessingTeamId}`:

- `t` in [0,5400], `minute=t/60`; fase `firstHalf`, `secondHalf`, `fulltime`.
- `players`: 22 inizialmente (poi 22 dopo cambi, meno se espulsioni), con `id,teamId,x,y,vx,vy,facing,action,energy,hasBall`. Coordinate sempre normalizzate in [0,1]. Velocità in coordinate normate **per secondo simulato**. `facing` è un **angolo in radianti** (E=0, S=π/2, W=π, N=−π/2). A riposo conserva l'ultimo orientamento; l'Agente 5 lo interpreta con `resolveFacing()`. `energy` resta 0–100. Azioni: `idle,run,control,pass,shot,dribble,tackle,save,injury`.
- `ball`: `x,y,height,vx,vy,ownerId`, `ownerId=null` durante un lancio; `height` è un indicatore visuale astratto, non metri fisici.
- `score` cambia **solo** all'emissione di `goal` dopo la risoluzione di un `shot`.
- `stats`: per casa e trasferta `shots,shotsOnTarget,possession,fouls,corners`; possesso è percentuale sui secondi con palla controllata.
- `events`: fatti dell'ultimo step e comandi esterni in attesa, visibili **una volta nello step successivo**. Il feed **autorevole** per il runner è `getEventsSince(lastId)` (ID stabili monotoni, indipendenti dagli step); aggiornare il cursore soltanto dopo il consumo.
- Tipi: `kickoff,pass,dribble,tackle,interception,offside,shot,save,goal,foul,card,injury,corner,throwin,substitution,tacticChange,shout,halftime,fulltime`. `substitution.detail` contiene `outId`, `inId`, `goalkeeper`, `used`, `limit`. `goal.detail.assistId` è **opzionale** per l'ultimo passaggio realmente ricevuto dal marcatore nella medesima azione, entro 20 secondi, senza passaggi successivi, cambio possesso o palla inattiva. Ogni evento ha `id,t,type` e identificativi/dettagli quando applicabili.

## Implementato

22 agenti in formazione e in transizione, inseguimento palla, pressione parametrica e marcatura, offside, possesso e passaggi con traiettorie, ricezioni/intercetti, contrasti e falli, ammonizioni/doppia ammonizione-espulsioni, dribbling, tiro contestuale con xG semplificato e parate, angoli e riprese, lievi infortuni, affaticamento, cambi, istruzioni in corsa, due periodi di gioco e seed riproducibile. Le abilità tecniche (incl. `technical.decisions`), la mobilità, `status.fitness`, `status.health`, fatica e tratti mentali alterano velocità, decisioni e probabilità. `conditionFactor()` applica gradualmente forma/salute **una sola volta** alle abilità grezze; non aggiungere anche `effectiveAbility()` già condizionata senza una convenzione d'iniezione per evitare il doppio conteggio. Gol, classifiche e titoli del film non vengono estratti a caso.

## Feed di eventi per il runner

```js
let lastEventId = 0;
function renderTick(match, matchView, elapsedSeconds, now) {
  const snapshot = match.advanceRealSeconds(elapsedSeconds);
  const events = match.getEventsSince(lastEventId);
  if (events.length) lastEventId = events.at(-1).id;
  matchView.render({...snapshot, events}, now);
}
```

Il `kickoff` iniziale è già disponibile allo snapshot t=0. Dopo una sostituzione portiere, il runner segnala il nuovo ID alla vista (`setKeepers`). Ogni `kickoff` successivo richiede il reset d'interpolazione, da gestire nella PR #15.

## Limiti dichiarati / da evolvere

Questo è un **vertical slice funzionante**, non una replica esaustiva delle leggi del calcio. Il passo fisico è 1 s; la traiettoria della palla è interpolata e il contatto è probabilistico/contestuale, non collisioni fisiche 3D continue. Mancano rigori, punizioni specialistiche, rimesse dal fondo e laterali completamente procedurali, recupero, giocatori che giocano temporaneamente fuori ruolo, strategie automatiche della panchina e disciplina medica completa. L'espulsione riduce gli effettivi, ma non applica l'intero regolamento delle gare sospese. I cambi sono applicati subito dal comando (semplificazione: manca attesa della palla fuori gioco). I falli non generano ancora calci piazzati differenziati.

Per un bilanciamento definitivo servono test statistici su **molti più seed e combinazioni di valori** e confronto con distribuzioni stagionali reali. La qualità grafica e le cutscene spettano esclusivamente agli agenti 1, 2 e 5; l'integrazione in `oronzo/game.js` non è stata eseguita.

## Ciclo R02 · direttive personali e QA

`CoachCommandV1` resta compatibile con gli ordini tattici, le sostituzioni e i vecchi `shout` di squadra (`focus/calm/push/encourage`). Una **nuova** direttiva per il singolo usa:

```js
const order=match.command({
  type:'shout', teamId:'montevento',
  payload:{
    targetPlayerId:'montevento-9',tone:'encourage', // oppure 'harsh'
    utteranceId:'copy-utterance-1979-01',          // ID testo opzionale dall'Agente 04
    coachOrigin:{regionId:'campania',macroRegion:'south'},
    playerOrigin:{regionId:'campania',macroRegion:'south'},
    coachTraits:{leadership:65},                  // facoltativo, da CoachV2 / Agente 09
    playerTrust:50                                // facoltativo, fallback a PlayerV2
  }
});
```

`targetPlayerId` deve identificare un titolare attivo della stessa squadra. Toni personali ammessi `encourage` e `harsh`. Richiamo duro può migliorare o peggiorare temporaneamente prestazione a seconda di disciplina, carattere, autocontrollo e fiducia. L'affinità geografica (stessa regione > stessa macroregione > resto) amplia moderatamente la risposta, senza inventare geografie: preferire `player.origin` fornita dall'Agente 08 quando disponibile, altrimenti `payload.playerOrigin`. La durata del modificatore è **150 secondi simulati**, cooldown per giocatore **120 secondi simulati**; il successivo ordine sostituisce il bonus precedente e non si somma. Questi valori sono **parametri iniziali da bilanciare**, non regole storiche o decisioni irrevocabili.

Un ordine accettato emette un solo evento deterministico `coach_shout`:

```js
{
  id:177, t:600, type:'coach_shout',
  teamId:'montevento', playerId:'montevento-9',
  detail:{
    tone:'encourage', accepted:true, affinity:'region',
    temporaryEffect:{modifier:0.065,startedAt:600,expiresAt:750},
    persistentSuggestion:{playerTrustDelta:2,coachMoraleDelta:0},
    utteranceId:'copy-utterance-1979-01'
  }
}
```

Gli importi sono **esempi dello schema**. Il motore altera temporaneamente velocità e probabilità delle azioni sul campo, senza incrementare direttamente risultato, morale permanente o rapporto col mister.

### Bridge verso l'Agente 09 — idempotenza tra snapshot e stagioni

```js
import {collectCoachEffects} from './coach-effects.js';
const {effects,appliedEventIds}=collectCoachEffects(
  match.getEventsSince(lastEventId),career.appliedEventIds,
  {matchId:'fixture-persistente-1979-01'}
);
// Agente 09: applica il delta suggerito validato e salva i nuovi
// appliedEventIds NELLA STESSA TRANSAZIONE del rapporto/morale.
```

`collectCoachEffects` è **pura**: non modifica il coach né il save. Richiede `matchId` persistente per evitare collisioni fra `event.id` di due partite e deduplica eventi ripetuti. Restituisce `effects` e la nuova lista `appliedEventIds`; i delta sono **suggerimenti per l'Agente 09**, non mutazioni automatiche. Se il salvataggio fallisce, non registrare l'ID senza aver applicato il rapporto, né applicare il rapporto senza scrivere l'ID.

### QA documentata

`node cli-qa.mjs` esegue **100 partite complete**, un cambio modulo 4-4-2 → 3-5-2, un ordine individuale e una sostituzione per seed; controlla 22 iniziali, posizione/palla, accelerazione senza teletrasporto al comando, recupero ancoraggi (salvo riprese), score = eventi goal, statistiche, fulltime e ID cronologici. I primi 10 seed vengono ripetuti e comparati.

Campione R02 al codice del branch: **100/100 fulltime, 10/10 replay identici, 99/99 regroup osservabili recuperati**, 100 sostituzioni e 100 `coach_shout`, media **35,32 tiri** e **3,07 gol**, 7 infortuni e 10 espulsioni nel campione. Sono dati osservati, non taratura definitiva del calcio storico del 1979. Prima della calibrazione il campione aveva ~48,45 tiri e ~4,43 gol; la selezione di tiro è stata modificata esclusivamente nell'engine.
