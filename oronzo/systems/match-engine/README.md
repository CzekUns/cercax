# ORONZO · Football simulation engine (Agente 6)

Motore calcistico autonomo, ESM nativo, seed deterministico, **nessuna dipendenza** e **nessuna dipendenza dal DOM**. Unica directory di competenza: `oronzo/systems/match-engine/`.

## Quick start

Dalla directory di questo modulo:

```bash
node --test
node cli-demo.mjs 10
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

`step(dt,commands?)` accetta **secondi simulati** non negativi; se presenti, i comandi hanno effetto prima dell'avanzamento. Restituisce lo snapshot con `commandResults`, uno per ordine (`accepted`, `reason`, `effects`). `command(command)` applica subito un ordine e restituisce lo stesso esito. `advanceRealSeconds(seconds, commands?)` è un helper per il runner (1×=60 s simulati per s reale, quindi 5400/60=90 secondi reali). Il core simula a passi interi da 1 s: chiamate con frazioni accumulano il residuo.

**Schema di input**: `MatchInputV1` da `../engine-contract.md` (percorso concettuale), con `homeClub/awayClub`, 11 ID unici per XI, ID della panchina, seed e tattiche opzionali. I club e calciatori sono **copiati** all'avvio: l'engine non altera le anagrafiche dell'Agente 8. Il portiere deve avere `positions:['GK']` (un solo GK per XI) ed è disposto nello slot zero. Gli altri giocatori sono disposti secondo l'ordine dell'XI; l'orchestratore dovrebbe ordinarli per ruolo.

**Tattiche**: `formation` in `4-4-2`, `4-3-3`, `3-5-2`, `4-2-3-1`, `5-3-2`; `mentality`, `pressing`, `tempo`, `width` in [0,100]; `marking` uguale `zonal` o `man`. I campi non forniti ricevono valori neutrali; gli sconosciuti sono rifiutati. Un `shout` usa `payload.tone` tra `encourage`, `focus`, `calm`, `push`, dura 180 secondi simulati e ha cooldown di 120 s. Le direttive influiscono su accelerazione, pressing, passaggio, falli o tiro.

**Regole**: `competitionRules.maxSubstitutions` è configurabile e per default è **2**, coerentemente con il massimo previsto dalla legge III IFAB 1985–86 per gare ufficiali (vedi [Laws of the Game 1985–86](https://downloads.theifab.com/downloads/laws-of-the-game-1985-86?l=es)). Il punteggio in classifica, in Serie A 1985/86 2 punti per vittoria, appartiene all'Agente 7, non al motore partita. Non vengono introdotti 5 cambi per impostazione predefinita.

## Snapshot verso Agente 5

`{t,minute,phase,score,players,ball,stats,events,possessingTeamId}`:

- `t` in [0,5400], `minute=t/60`; fase `firstHalf`, `secondHalf`, `fulltime`.
- `players`: 22 inizialmente (poi 22 dopo cambi, meno se espulsioni), con `id,teamId,x,y,vx,vy,facing,action,energy,hasBall`. Coordinate sempre normalizzate in [0,1]. Velocità in coordinate normate **per secondo simulato**. `facing` ±1. Azioni: `idle,run,control,pass,shot,dribble,tackle,save,injury`.
- `ball`: `x,y,height,vx,vy,ownerId`, `ownerId=null` durante un lancio; `height` è un indicatore visuale astratto, non metri fisici.
- `score` cambia **solo** all'emissione di `goal` dopo la risoluzione di un `shot`.
- `stats`: per casa e trasferta `shots,shotsOnTarget,possession,fouls,corners`; possesso è percentuale sui secondi con palla controllata.
- `events`: **solo** eventi avvenuti nella chiamata `step()`/ultimo comando; `getEventsSince(lastId)` fornisce tutta la sequenza incrementale immutabile.
- Tipi: `kickoff,pass,dribble,tackle,interception,offside,shot,save,goal,foul,card,injury,corner,throwin,substitution,tacticChange,shout,halftime,fulltime`. Ogni evento ha `id,t,type` e identificativi/dettagli quando applicabili.

## Implementato

22 agenti in formazione e in transizione, inseguimento palla, pressione parametrica e marcatura, offside, possesso e passaggi con traiettorie, ricezioni/intercetti, contrasti e falli, ammonizioni/doppia ammonizione-espulsioni, dribbling, tiro contestuale con xG semplificato e parate, angoli e riprese, lievi infortuni, affaticamento, cambi, istruzioni in corsa, due periodi di gioco e seed riproducibile. Le abilità tecniche, la mobilità, le condizioni e diversi tratti mentali variano decisioni o probabilità **prima** di generare i fatti calcistici. Gol, classifiche e titoli del film non vengono estratti a caso.

## Limiti dichiarati / da evolvere

Questo è un **vertical slice funzionante**, non una replica esaustiva delle leggi del calcio. Il passo fisico è 1 s; la traiettoria della palla è interpolata e il contatto è probabilistico/contestuale, non collisioni fisiche 3D continue. Mancano rigori, punizioni specialistiche, rimesse dal fondo e laterali completamente procedurali, recupero, giocatori che giocano temporaneamente fuori ruolo, strategie automatiche della panchina e disciplina medica completa. L'espulsione riduce gli effettivi, ma non applica l'intero regolamento delle gare sospese. I cambi sono applicati subito dal comando (semplificazione: manca attesa della palla fuori gioco). I falli non generano ancora calci piazzati differenziati.

Per un bilanciamento definitivo servono test statistici su **molti più seed e combinazioni di valori** e confronto con distribuzioni stagionali reali. La qualità grafica e le cutscene spettano esclusivamente agli agenti 1, 2 e 5; l'integrazione in `oronzo/game.js` non è stata eseguita.
