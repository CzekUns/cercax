# ORONZO — Agente 07 R10/M1 · contratto operativo per Agente 12

**Proprietario del codice:** ORONZO-AGENT-07. **Consumatori:** Agente 12 (controlli UI), Coerentizzatore 00. **Versione:** `M1_CONTRACT_VERSION=1`. **Moduli:** `oronzo/app/flow/controller.js` e `m1-contract.js`. Il controller continua a possedere calendario, classifica, partita/risultati, salvataggio e morale già integrato. Nessuna UI/HTML/CSS viene fornita da questa PR.

## Ingresso carriera e identità del giocatore

`newGame({seed,avatar,municipalityCatalog?,surnameCatalog?,playerOrigins?})` è compatibile con i chiamanti precedenti. I 500 comuni **non** sono incorporati nella PR 07: il consumatore fornisce `municipalityCatalog` da `oronzo/data/world/municipalities-m1.json` della PR #53, quando approvata. I metadati null di provincia/anno demografico restano null e la fonte è contemporanea, non una prova di confini calcistici del 1979. Senza catalogo: `geography_required` su `acceptOffer`, senza mutation; non utilizzare fixture QA per il pubblico.

I 600 cognomi di Bergamo 2021 sono di **PR #31, Agente 08**, sorgente `BUILTIN_SURNAME_CATALOG`, licenza **CC0 1.0**. Passare il catalogo validato a `newGame({surnameCatalog,playerOrigins:[]})`, oppure chiamare `enableM1SourcedPlayers(state,{surnameCatalog,playerOrigins:[]})` **una sola volta** sul mondo appena creato e prima della firma. Restituisce `{accepted:true,players,dataset:{sourceId,version,license,recordCount}}`. Nella carriera il vecchio `player.id` rimane **identico**; il generatore 08 è referenziato tramite `sourcePlayerId`, `surnameId` e `surnameSourceId`. Non generare ID, origini o nomi nella UI; `origin:null` è lecito. Il catalogo deve contenere **almeno 500 cognomi distinti con ID e provenienza**. Senza PR #31, il consumer rifiuta i nomi non verificati e il gate M1 resta **non completato**.

`getStateForUI(state).m1` espone `playerDataset,training,matchCommands,matchLoads,persistentEvents,seasonDevelopments` in una proiezione serializzabile; la fonte univoca rimane `state.clubs[].players[]`, indicizzata per `player.id`. `getRosterPlayer/getTrainingPlayer` condividono player ID e kit come in R03. Non rigenerare dopo `loadGame`.

## Controlli allenamento per UI12

`selectM1Training(state,{plan,intensity,expectedAbsoluteWeek})`: 5 piani autorizzati **`technical|athletic|tactical|balanced|rest`**, intensità intera **0..100**. `expectedAbsoluteWeek` è il numero **letto da getStateForUI prima del click**. Richiede stage `hub` e un mister impiegato. Sceglie il piano tramite `chooseTrainingPlan` reale del 09; senza prova sufficiente l'API restituisce `accepted:false` con `reason` localizzabile. La UI non deve chiamare direttamente `applyTrainingWeek`: il controller la esegue **una sola volta** nel successivo `advanceMatchday`, sul draft economico atomico, usando l'algoritmo reale **08**. Aggiorna `fatigue,fitness,health,technical/physical/mental`; `flow.m1.training.appliedWeeks` impedisce una seconda applicazione dopo save/reload.

Risposte previste: `{accepted:true,selection:{plan,intensity,absoluteWeek,seasonYear,clubId}}` oppure `{accepted:false,reason:'stale_week_action'|'already_planned'|'invalid_training_plan'|'training_requires_hub'|'game_over'|...}`. Visualizzare plan e intensità dalla proiezione; la UI non anticipi i delta prima della contabilizzazione.

## Controlli in partita e motore06

Usare `prepareMatch(state)` esistente e custodire il relativo **handle `engine` in memoria**. Non salvare mai il motore come JSON e non inviare un ordine dopo fulltime. `commandM1Match(state,engine,request)` è l'unico bridge UI12 per:

- `{requestId,type:'tacticChange',payload:{formation?,mentality?,pressing?,tempo?,width?,marking?}}`
- `{requestId,type:'substitution',payload:{outId,inId}}`, veri `playerId` di campo e panchina; massimo sostituzioni imposto dal motore06.
- `{requestId,type:'individualShout',targetPlayerId,tone:'encourage'|'harsh'|'gentle'|'hard',utteranceId?}`. `gentle/hard` sono convertiti in `encourage/harsh`; non inventare `playerOrigin` e `coachTrust`.

**Ogni click deve avere requestId univoco per azione**, con deduplica nel ledger `fixtureId:requestId`; il controller registra soltanto `engine.command()` **accepted:true**. Gli esiti respinti (cooldown, formazione illegale, panchina indisponibile, engine #35 ancora assente) mostrano `reason`; **nessun successo ottimistico**. `commandM1Match` applica `coach.tactics` solo quando il motore conferma la modifica. Per la simulazione temporale usare **`tickMatch(engine,realSeconds,{speed})`** per la scala 1× ≈ 15 minuti reali; non chiamare `engine.advanceRealSeconds` legacy.

**Disponibilità verificata:** tattiche e sostituzioni sono su **main**; gli shout individuali attendono **PR #35** (e PlayerV2/CoachTrust della **#31**). Con solo main, un ordine individuale riceve un rifiuto reale dal motore, che UI12 deve mostrare o nascondere dietro il gate di feature. La **camera full/broadcast** resta della PR **#28**, non è implementata da questo controller. Fullscreen resta della **#52**.

## Durata ordini, rapporti e audit

Il motore06 è unico proprietario del bonus individuale temporaneo (150 secondi di tempo simulato su #35). `consumeMatchResult` estrae il feed autentico del motore e salva suggerimenti permanenti `coach_shout` in `flow.m1.persistentEvents['fixtureId:eventId']` con `status:'pending_agent09_player_trust'`. Il 07 **non** altera `player.relationships.coachTrust` in autonomia e non duplica il bonus temporaneo. `reconcileM1Shouts(state,{persistShout})` applica soltanto eventi pendenti quando il **09 consegna un port certificato che restituisca coach+club**, usando ID stabili; finché manca, UI12 può mostrarli come pendenti, non “fiducia aumentata”.

`flow.effectTransactions` della carriera conserva separatamente gli effetti *reali e già applicati* delle 20 offerte e delle 5+2 risposte stampa tramite `applyOfferEffect/applyPressEffect` del 09. Gli shout pending non devono essere confusi con quegli eventi. `morale=0` blocca tutto: il gioco esistente gestisce `GAME_OVER` e serializza il ledger 09.

## Calendario, save e fine stagione

`consumeMatchResult` aggiunge i minuti effettivamente giocati da titolari e subentranti; `applyMatchLoad` dell'08 aggiorna fatica/fitness una sola volta per fixture. `advanceMatchday(state,{presidentCatalog,expectedAbsoluteWeek})` registra risultati delle gare, liquida salari del 09, applica il piano di allenamento scelto per `absoluteWeek` e avanza la giornata atomicamente, con token anti doppio click. `rolloverSeason(state)` applica sviluppi stagionali dell'08 una volta, senza incrementare due volte l'età già aggiornata da Career07. `saveGame/loadGame` mantiene contratti, ID, geografia, `surnameId`, origin, rapporti e `flow.m1` anche dopo due stagioni.

**Prove da gate:** `node --test oronzo/app/flow/tests/m1-contract.test.mjs oronzo/app/flow/tests/m1-live.test.mjs` su main per le parti già presenti; ripetere checkout combinato con HEAD **#31/#35/#53** per i casi gate (nessun copy del codice 08/06/53 nel branch07). Test Chrome/Android e collegamento UI reali rimangono del 12/00. Un modulo disponibile in PR non è una funzione già giocabile nel sito.
