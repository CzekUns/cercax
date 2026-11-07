# RAPPORTO AGENTE 02 — Cutscene ed eventi — ciclo 01

**Stato:** PR_OPEN / WAIT_REVIEW (nessun fix richiesto)  
**Identità:** `ORONZO-AGENT-02`  
**Branch:** `agent/oronzo-cutscenes`  
**PR:** https://github.com/CzekUns/cercax/pull/12 (aperta, **draft**, NON merged)  
**Issue:** https://github.com/CzekUns/cercax/issues/2  
**Commit di consegna verificato prima di questo report:** `d2c58d2c786b56b80d11686409288b04a98f0658`  
**Data verifica:** 2026-11-07 (Europe/Rome)  
**NEXT su main:** `WAIT_REVIEW`; orchestratore non ha ancora approvato, mergiato o autorizzato ciclo 02.

## Realizzato nel ciclo 01

- 5 sprite strip **PNG RGBA 1920×180**, 6 fotogrammi **320×180** ciascuno: `goal_celebrate.png`, `goalkeeper_save.png`, `yellow_card.png`, `red_card.png`, `injury.png`. 30 slot di frame.
- 10 maschere raster, una `*_materials.png` e una `*_shades.png` per ciascuna sequenza, allineate 1:1 con l'alpha dei PNG. Codici `material ID` e livelli di ombra 0–3 in `manifest.json`.
- Sfondi riutilizzabili, separati dai calciatori: `stadium_background.png` e `stadium_goal_background.png`, 320×180.
- `manifest.json` definisce 5 eventi `goal`, `save`, `yellow`, `red`, `injury`, frame size, pivot, fps, durata, palette indicizzate e ruoli.
- `cutscene-player.js`: modulo JavaScript ESM che esporta `OronzoCutscenePlayer`; disegna i sei frame sopra lo sfondo e applica colori dinamici `skin`, `hair`, `shirt`, `shirtB`, `shorts`, `socks` e pattern `solid`, `vertical`, `horizontal`, `halves`. Cache degli atlas per combinazioni colori.
- `demo.html` autonoma per selezione evento, playback, step, velocità, loop e ricolorazione; `integration-notes.md` spiega gli hook che l'orchestratore dovrà inserire in `oronzo/game.js`.
- `generate_assets.py` generatore deterministico, `qa_assets.py` controllo strutturale, `qa_overview.png` tavola d'ispezione dei frame.
- Le **24 modifiche originarie** del branch riguardano soltanto `oronzo/assets/cutscenes/`. Questo report è l'**unica eccezione di scope autorizzata** dal protocollo.

## Verifiche realmente eseguite (ripresa 7 novembre)

1. `python qa_assets.py` nella cartella cutscene: **PASS**, stampa `ALL 5 CUTSCENES VALIDATED`. Controlla dimensioni, formato RGBA, cinque scene, maschere allineate all'alpha, livelli ombra entro 0–3, sei frame non vuoti per ciascuna scena, sfondi 320×180.
2. `node --check cutscene-player.js`: **PASS** (nessun errore di sintassi). Estratto il codice ESM di `demo.html` e testato con `node --check --input-type=module`: **PASS**.
3. Controllo aggiuntivo con Pillow su tutti i sei slot di ogni scena: **PASS**. I materiali usati sono sottoinsieme degli ID dichiarati dal manifest, le strisce hanno dimensioni 1920×180 e ogni fotogramma contiene pixel non trasparenti.
4. `git hash-object` su tutti e **24** i file locali della precedente consegna: gli SHA risultanti coincidono con i blob GitHub già pubblicati nella PR (controllo dei byte, non soltanto dei nomi). Diff GitHub `main...agent/oronzo-cutscenes`: 24 percorsi originari, tutti sotto `oronzo/assets/cutscenes/`; compare al momento della verifica: **1 commit ahead / 33 behind main**, senza cambiamenti esterni nel diff.
5. Controllo fotogrammi **unici**: `goal` 6/6; `save` 6/6; `injury` 6/6; `yellow` 5/6; `red` 5/6. Le scene dei cartellini tengono intenzionalmente l'ultima posa per due slot; sono comunque sei frame, di cui cinque stati visivi distinti.
6. Tentativo di screenshot della demo in Chromium headless locale via HTTP su porta 8895, finestra 640×360: **NON COMPLETATO**, comando in timeout dopo ~35 s e **nessuno screenshot** generato. Il log include errori D-Bus; non è dimostrato che l'animazione JS funzioni sul browser. **Non** segnare questo test come PASS.
7. PR REST attuale: `state=open`, `draft=true`, `merged=false`; nessuna review o commento con richieste di fix esaminati; issue #2 ancora aperta. Nessun merge effettuato.

## Integrazione e API

- Import ESM: `import { OronzoCutscenePlayer } from './assets/cutscenes/cutscene-player.js';` oppure `import(...)` dinamico perché `oronzo/game.js` usa un IIFE classico.
- Costruttore `new OronzoCutscenePlayer(canvas, { onComplete })`; `await instance.init()`; `await instance.play(type, {appearance, pattern, loop, speed})`; `instance.stop()`, `instance.renderFrame(index)`.
- Trigger JSON: `goal`, `save`, `yellow`, `red`, `injury`; player canvas di destinazione 320×180 con CSS `image-rendering: pixelated`; non fermare timer o simulazione match durante overlay.
- **Dipendenza orchestratore:** aggiunta overlay e hook reali in `oronzo/index.html`/`oronzo/game.js` dopo merge e QA, fuori dal perimetro dell'agente 2.
- **Dipendenze agenti 05/06/08:** eventi semanticamente attendibili dal motore, identità di marcatore/portiere/ammonito/infortunato e `appearance` coerente; queste interfacce non sono ancora integrate nella partita.
- **Dipendenza agente 01:** una tabella comune per i colori di pelle/capelli/divise tra sprite match e cutscene, altrimenti differenti sfumature fra viste.

## Mancante / problemi e limiti

- Nessuna approvazione artistica o QA di gameplay dal coordinatore. La grafica procedurale attuale, pur essendo raster reale e material-masked, è più semplificata rispetto a `images.jpeg`; non dichiararla equivalente alla reference.
- La demo non è ancora validata in un browser smartphone reale, e mancano screenshot affidabili nei formati landscape di accettazione `640×360`, `800×360`, `844×390`.
- Sei fotogrammi per evento sono presenti; giallo e rosso hanno però due fotogrammi finali identici per posa trattenuta, dettaglio da valutare in QA estetica.
- Nessun trigger cutscene è stato collegato a `oronzo/game.js` (file riservato all'orchestratore); il simulatore non riproduce quindi queste sequenze da solo.
- Branch creato su base precedente: al controllo, `main` avanzato di 33 commit rispetto all'antenato comune. **Non è stato effettuato rebase/merge** senza autorizzazione, perché `NEXT.md` impone `WAIT_REVIEW`. Il diff specifico resta confinato ai soli 24 asset più il report.
- Nessuna correzione al codice richiesta nelle review GitHub consultate; in questo ciclo di ripresa non sono stati modificati asset o script, soltanto redatto il report.

## Proposta prossimo ciclo (solo previa autorizzazione dell'orchestratore)

1. Priorità **QA browser/visiva**: eseguire in browser reale le cinque animazioni, ricolorazione e viewport 640×360, 800×360, 844×390, con screenshot e verifica della fluidità/leggibilità.
2. Se richiesto dalla review: perfezionare i frame dei cartellini e le silhouette/ombre del giocatore rispetto alla reference, preservando gli stessi material ID e path degli asset.
3. Solo dopo merge e nuovo `NEXT.md=READY`: coordinare l'API colori/trigger con gli agenti 01, 05 e 06; preparare integrazione senza modificare il runtime dell'orchestratore direttamente.

**Conclusione:** consegna verificabile, PR **draft in attesa di revisione**. Nessun merge, nessuna iterazione nuova avviata.

---

## Addendum QA — v0.2 e gate artistico (7 novembre 2026)

**Mandato corrente da `NEXT.md` su main:** `WAIT_REVIEW`, mantenere la PR [#12](https://github.com/CzekUns/cercax/pull/12) in bozza, completare il rapporto QA e correggere gli asset **solo se arriva una richiesta precisa di revisione**. Nessuna review o commento GitHub della PR #12 richiede al momento correzioni; l'issue #2 rimane aperta. Per questo addendum **nessun asset/renderer/demo è stato modificato**, nessun nuovo branch o merge.

**Specifiche aggiornate lette:** `oronzo/coordination/GAME-VISION-v02.md`, `10-orchestrator/PLAN.md`, protocollo e `NEXT.md`. Nuovo inizio carriera **1979** e velocità partita **1× ≈ 15 minuti reali**: valgono per il gioco, ma **non impongono di cambiare** i sei frame, i 10/8 FPS e le durate real-time (600/750 ms) delle cutscene. La demo contiene ancora il testo stilistico «1985 / 1995»; verificare in UI che non venga presentato come anno della carriera.

### Evidenze di test ripetuti in questa ripresa

| Test / comando effettivo | Risultato |
| --- | --- |
| `python qa_assets.py` sul pacchetto originale messo in una directory QA | **PASS**: tutte le 5 scene, 6 frame per strip, dimensioni 1920×180, alpha allineato alla maschera, ombre 0–3, sfondi 320×180 |
| `node --check cutscene-player.js` | **PASS** sintassi ESM, non equivale a esecuzione browser |
| Pillow/NumPy: ricostruzione del PNG dagli ID materiali + shade + palette del manifest, confronto **pixel per pixel** | **PASS**: 0 pixel diversi in ogni strip; tutti i materiali hanno palette; nessun foreground pixel tocca un margine del frame 320×180 |
| SHA `git hash-object` sugli asset locali usati per QA | **PASS**: corrispondono agli SHA GitHub del ciclo precedente, verificati almeno per manifest, modulo, demo e le 21 immagini/script; nessuna nuova versione è stata introdotta |
| Confronto SHA-256 dei sei frame RGBA di ciascun evento | **PASS formato**, **limite artistico**: gol 6/6 pose uniche, parata 6/6, infortunio 6/6, giallo 5/6, rosso 5/6; il frame 6 coincide pixel per pixel col 5 per entrambi i cartellini |
| Compositing offline dei 30 frame su sfondi indipendenti | Eseguito con Pillow, montaggio temporaneo `qa_frame_review_30.png` (file locale di QA, **non committato**). Anteprima già versionata `oronzo/assets/cutscenes/qa_overview.png` mostra frame 1/3/6 |
| Playwright Python + `/usr/bin/chromium` headless, server HTTP locale `127.0.0.1:18945`, tentativo viewport 640×360 | **BLOCCATO**: `Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR`. Nessuna pagina caricata e nessuno screenshot browser. **Non** sono state provate le viewport 800×360 e 844×390 né la ricolorazione JS dal vivo |
| REST GitHub, PR #12: stato, commenti, review, compare con main | **OPEN/DRAFT, non merged**, 0 richieste di correzione rilevate, 25 file di diff (24 cutscene + questo REPORT). All'ultimo confronto prima dell'addendum: branch 2 commit ahead e 108 behind su main; HEAD branch `b633cc20be4d8da66f50c597eae748ac0e956ba2`, main `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697` |

### Confronto visivo con la reference principale `images.jpeg`

Reference Google Drive: immagine raster **376×285**; calciatore laterale intero, proporzioni umane, dettagli di volto e maglia, pubblico con volti e posture differenziati, parapetto/pubblicità, campo in primo piano. Le cinque sequenze consegnate mantengono orientamento **laterale**, palette pixel a bordi netti, pubblico/tribuna, personaggi leggibili e sfondi separati; ma i soggetti sono **più stilizzati e schematici**, con arti segmentati, visi poco definiti, spettatori ripetuti su griglia e minor ricchezza materica/ambientale. Il gate di **equivalenza artistica alla reference non è dimostrato** dal solo PASS geometrico e rimane all'orchestratore.

| Scena | QA artistico su tutti e 6 i frame | Decisione / limite |
| --- | --- | --- |
| **Gol** (`goal_celebrate`) | Corsa progressiva verso destra; figura intera e braccia che si alzano nel finale; centro bbox circa x=112→184, 6 pose diverse, ombre coerenti | Azione comprensibile, ma espressione del volto e folla lontane dalla ricchezza della reference; chiedere parere artistico |
| **Parata** (`goalkeeper_save`) | Portiere passa dalla posizione d'attesa al tuffo; rete e campo stabili, palla presente; 6 frame differenti, personaggio e palla non tagliati | Drammaturgia leggibile, però fase di presa e postura orizzontale da giudicare in movimento; non è un test di animazione browser |
| **Ammonizione** (`yellow_card`) | Arbitro frontale/laterale alza giallo di fronte al giocatore; 6 slot, ma gli ultimi **2 sono identici**; calciatore quasi fermo | Riconoscibile, limitata varietà di reazioni; 5/6 pose uniche |
| **Espulsione** (`red_card`) | Gestualità quasi identica al giallo, cartellino rosso materializzato su ID separato; 6 slot, ultimi 2 identici | Leggibile dal colore, scarso carattere distintivo dall'ammonizione, nessuna reazione di allontanamento |
| **Infortunio** (`injury`) | Dalla corsa passa a rotazione/caduta; tutti 6 frame diversi, posizione finale bassa senza crop | Caduta visibile; posa finale di rotolamento/piegamento poco naturale e richiesta «resta a terra» **da verificare artisticamente** |

### Verifica della ricolorazione

I PNG foreground sono 100% ricostruibili dai materiali e 4 ombre definiti in `manifest.json` (test Python con **zero differenze**). I colori di `skin`, `hair`, `shirt`, `shirtB`, `shorts`, `socks` sono configurabili nel modulo JS; arbitro e portiere hanno materiali/palette dedicati e i cartellini ID distinti. `solid`, `vertical`, `horizontal`, `halves` sono implementati nel renderer, ma **non risultano testati in un browser reale in questo ciclo**. L'allineamento esatto delle maschere, da solo, non garantisce la resa delle fantasie sulla divisa in movimento.

### Collegamento tecnico richiesto agli altri agenti (nessun hook inserito)

- **Agente 06 (motore)**: emettere eventi con identificatore canonico `goal|save|yellow|red|injury`, ID calciatore/portiere interessato, timestamp e identificatore evento unico. Il motore calcola esiti e fa avanzare il cronometro: una cutscene non deve fermare o riscrivere la simulazione.
- **Agente 05 (vista match)**: overlay 320×180 compositato sopra **full campo** e **camera televisiva** senza alterare lo snapshot, l'orientamento degli sprite o le coordinate fisiche.
- **Agente 01 e 08 (sprite/identità)**: fornire `appearance` coerente tra campo e cutscene (pelle, capelli, colori squadra, tipo di maglia). Evitare di fissare tinte nell'arte; mappare ID dei giocatori reali.
- **Agente 03 (runtime UI futuro)**: dopo autorizzazione nel relativo `NEXT`, integrare overlay e `import()` dinamico in gioco legacy non-module, fallback su canvas quando manca un asset, controllo del ciclo vita e ritorno al campo senza bloccare comandi. `cutscene-player.js` esporta `OronzoCutscenePlayer`, `init()`, `prepare(type)`, `play(type,{appearance,pattern,loop,speed})`, `stop()`, `renderFrame(i)`, `setAppearance()` e callback `onComplete(type)`. Il `play()` è asincrono **per il caricamento**, non per l'intera durata dell'animazione.
- **Agente 07 (game flow 1979)**: se il gioco usa nuove scene per presentazione del presidente o conferenze, richiederne prima un nuovo `NEXT`; **nessuna cutscene presidente è stata sviluppata**.

### Rischi residui e richiesta all'orchestratore

1. Il gate **artistico** è ancora aperto; una valutazione visiva sulle cinque scene (soprattutto finale parata, due cartellini e posa finale infortunio) deve decidere se chiedere remake/fix. Gli screenshot Playwright non sono disponibili per il blocco amministrativo.
2. Differenza tra runtime e demo: le cinque scene sono asset importabili e una **demo HTML autonoma**, **non** cutscene agganciate alla partita ORONZO in `main` né QA mobile confermata. Ulteriore sequenza o integrazione non autorizzate da `WAIT_REVIEW`.
3. La PR è basata su un `main` vecchio: confronto senza path estranei, ma 108 commit di ritardo; **non** eseguire rebase o merge senza un piano dell'orchestratore e un controllo aggiornato.
4. Futuro eventuale miglioramento: migliorare anatomia, superfici, folla e varietà delle reazioni, **solo** dopo commenti/criteri artistici espliciti, preservando manifest/mask/trigger.

**Decisione agente 02:** restare su PR #12, **draft + WAIT_REVIEW**; questo aggiornamento è di **solo REPORT**, senza nuovi asset, fix al codice, nuove PR o merge.
