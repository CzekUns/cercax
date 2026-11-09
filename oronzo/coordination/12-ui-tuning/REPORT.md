# ORONZO — Agente 12, hotfix S12-004 immagine del computer non visibile

**Data:** 9 novembre 2026  
**Branch:** `agent/oronzo-12-ui-playtest-s03`  
**Stato:** `IMPLEMENTATA_DA_VERIFICARE`; senza merge.  
**Origine:** feedback Android dopo PR #60 integrata e GitHub Pages run #42642167594 riuscita al secondo tentativo.

## Problema segnalato e verifica

Il proprietario vede ancora la landing con due soli pulsanti, senza il computer a sinistra. Il file grafico `office-desk-v02.png` è presente su GitHub main, ma nella PR #60 era usato **solo come background CSS di un div senza contenuto**. La causa finale sul dispositivo non è confermata: potrebbero esserci risorse CSS cached o problemi di rendering. Lo strumento esterno di consultazione non riesce ad accedere direttamente a GitHub Pages in questa sessione.

## Fix concreto

- `career-r03.js`: `renderEntry()` ora include un elemento HTML `img` autentico con `src="./office-desk-v02.png?v=s12-004"`, `alt` leggibile e `fetchpriority=high`; non è più necessario che il background CSS sia applicato per far comparire l'immagine.
- `career-r03.css`: esplicita layout dell'immagine con dimensioni 100%, `object-fit:contain` e wrapper con `overflow:hidden`, mantenendo i due CTA in colonna a destra.
- `career-r03.html`: riferimenti a `career-r03.css?v=s12-004` e `career-r03.js?v=s12-004`, per non riusare la vecchia cache sotto gli URL precedenti. Nessuna modifica fullscreen o sistemi.
- `qa/ui12-landing-nav.test.cjs`: aggiunti 2 test sull'esistenza dell'IMG reale e sulla coerenza delle due versioni asset.

**Regressioni protette:** 2 CTA `start/load`; cinque sottosezioni Campionato/Rosa/Allenamento/Tifoseria/Presidente e ritorni; navigazione inferiore nascosta; fullscreen nella barra alta; canvas partita e save invariati.

## QA eseguita

- Parsing JS autenticato da sorgente GitHub, import ESM eliminati solo per parser V8 isolato: **PASS**.
- Codice test della repo eseguito in V8 su sorgenti aggiornati recuperati da GitHub, `require` simulato: **10/10 PASS**. Inclusi test delle cinque sottosezioni e nuove asserzioni su `img` e cache bust.
- **QA HTTP/Chromium sul gioco integrato: NON ESEGUITA** (checkout autenticato GitHub non disponibile dalla sessione). **Test su Android reale: NON ESEGUITO**. Non affermare che il problema su telefono sia risolto prima di vedere la schermata pubblicata.

## Merge/deploy

PR in bozza da aprire, ancora nessun merge; l'utente continua quindi a vedere `main` precedente. Dopo approvazione merge controllare GitHub Pages `success`, quindi URL HTML con parametro nuovo `?v=s12-004` e screenshot Android, prima di chiudere la nota S12-004.

---

# RAPPORTO ORONZO-AGENT-12 — S02, revisione ingresso e sezioni Ufficio

**Data:** 9 novembre 2026 (Europe/Rome)  
**Stato:** `IMPLEMENTATA_DA_VERIFICARE` — [PR #60](https://github.com/CzekUns/cercax/pull/60) DRAFT; **nessun merge**  
**Base del branch:** `a8e980a2baa1bb45d9c0a34a7db4e6f49df9712c` (main aggiornato dopo merge #59, #52 e #53)  
**Branch:** `agent/oronzo-12-ui-playtest-s02`  
**PR:** [#60](https://github.com/CzekUns/cercax/pull/60)  
**Issue:** [#54](https://github.com/CzekUns/cercax/issues/54)  
**Note:** `oronzo/coordination/12-ui-tuning/SCREEN-NOTES.md`

## Due modifiche realizzate

1. **Revisione S12-001:** `renderEntry()` in `career-r03.js` mantiene due sole CTA `start/load`, adesso a **destra e in colonna**, mentre l'asset autentico già presente nel kit `office-desk-v02.png` è ripristinato **a sinistra** con `.runtime-entry-visual`. `career-r03.css` dedica la larghezza utile all'immagine e ai tasti, senza testo introduttivo, con media query mobile landscape. Header e fullscreen della #52 restano intatti. Il file PNG non è stato modificato.
2. **S12-003:** dal `renderHub()` si vedono cinque scelte a tutta larghezza; `data-action=section` apre la vista nuova `hub-section` tramite `renderHubSection()`, con un pannello che occupa la larghezza disponibile e pulsante `TORNA ALL'UFFICIO`. Sono state riutilizzate senza reinterpretazione le proiezioni già esistenti del campionato (classifica), Rosa, Allenamento in sola lettura, Tifoseria e Presidente. Le schede giocatore ritornano a Rosa o Allenamento corretto; SALVA e FORMAZIONE rimangono utilizzabili. Non sono state inventate funzioni di allenamento, presidente o gestione reale.

**File di codice modificati:** `oronzo/assets/ui/career-r03.js` (commit `ead07a9`), `oronzo/assets/ui/career-r03.css` (commit `d7b0d9e`).  
**QA aggiornata:** `oronzo/assets/ui/qa/ui12-landing-nav.test.cjs` (commit `8ce916b`).  
**Registro aggiornato:** `oronzo/coordination/12-ui-tuning/SCREEN-NOTES.md`.

## Verifiche effettivamente eseguite

- Parsing JavaScript reale del branch tramite V8, eliminando soltanto le dichiarazioni `import` ESM per consentire il parser isolato: **PASS**.
- Esecuzione in V8 del test QA letto dal branch, con `require` compatibile simulato per i file autentici: **8/8 test isolati PASS** (entry due CTA, CSS immagine/colonna, menu assente su 14 screen, fullscreen nodo invariato, conservazione fix M01, cinque carte menu senza preview, contenuti reali delle cinque sottosezioni, rotte menu/back).
- Il confronto dello scope mostra solo modifiche UI/QA/docs nel ramo S02; controller, engine, world, morale, calendario, salvataggi e asset binari **non modificati**.

## Verifiche NON eseguite e limiti

- **Chromium HTTP sul runtime autentico: NON ESEGUITO.** Il container non riesce a risolvere `github.com` per ottenere un checkout (`git ls-remote` fallisce con `Could not resolve host: github.com`). I test su sorgente/DOM simulato non certificano clipping, layout esatto, comportamento browser o geometria.
- **Node test eseguito su checkout completo: NON ESEGUITO.** Il test committed è predisposto per `node --test oronzo/assets/ui/qa/ui12-landing-nav.test.cjs`, ma in questa sessione è stato eseguito soltanto il codice V8 isolato.
- **Android fisico e screenshot dopo il fix: NON ESEGUITI / non disponibili.** Va verificato 640×360, 800×360, 844×390, 960×400, safe area con/senza inset, interazioni e pulsanti ≥44px realmente visibili, scroll classifica/rosa, usabilità header fullscreen e canvas16:9 durante la partita. Prove necessarie prima del merge.
- Le scelte di menu sono **navigazione UI** verso gli stessi dati reali già presenti, nessun nuovo comportamento di gioco.

## Integrazione e prossimo passo

Raccogliere feedback Android sullo schermo iniziale illustrato e sulla navigazione a sottopagine; documentare eventuali correzioni sulla stessa PR S02 e richiedere revisione indipendente del browser QA. **Non effettuare merge senza autorizzazione dell'utente.**

---

## Storico S01 · PR #59 integrata (testo originale preservato)

# RAPPORTO ORONZO AGENTE 12 — S01, primo feedback Android

**Data:** 9 novembre 2026 (Europe/Rome)  
**Stato:** `PR_OPEN / IMPLEMENTATA_DA_VERIFICARE`  
**Issue:** [#54](https://github.com/CzekUns/cercax/issues/54)  
**Branch:** `agent/oronzo-12-ui-playtest-s01`  
**PR:** [#59 — bozza, nessun merge](https://github.com/CzekUns/cercax/pull/59)  
**Base iniziale da ultimo main:** `21337c0161d654cce118a51f2cbbbca4b7e7eeff`

## Realizzato e codice verificato in repository

- **S12-001 — apertura larga:** in `oronzo/assets/ui/career-r03.js`, `renderEntry()` mostra soltanto le due CTA `data-action=start` e `data-action=load`. Rimossi esclusivamente da `entry` pannello introduttivo, descrizione QA e immagine laterale. La barra del marchio ORONZO è conservata; data/demo label sono nascoste solo su entry, visibili dove servono durante la carriera. `career-r03.css` usa un unico layout a due colonne ampio, con pulsanti di altezza minima 72px e safe-area esterne ereditate.
- **S12-002 — navigazione contestuale:** `render()` assegna `data-screen` al root e nasconde il footer `#runtime-nav` sulle 13 schermate; le CTA già integrate nelle viste permettono di proseguire, tornare, salvare nel hub e caricare al menu iniziale. Il markup del footer resta intenzionalmente in `career-r03.html` per non entrare in conflitto con #52. Se il fullscreen F01 (#52) è presente, lo stesso nodo `#fullscreen-toggle` viene riattaccato alla `.gamebar`, conservando `id`, attributi, listener e superficie nominale CSS 44×44px. Il runtime di main attuale **non** include ancora quel controllo.
- **QA aggiunta:** `oronzo/assets/ui/qa/ui12-landing-nav.test.cjs` (Node nativo, sorgente originale letto da disco).
- **Registro cumulativo:** `oronzo/coordination/12-ui-tuning/SCREEN-NOTES.md` include S12-001/S12-002 e motivazione delle modifiche.

Nessun file `career-r03.html`, `demo-v02.css`, `oronzo/app/flow/`, engine, data, salvataggi, career o sistemi è stato alterato.

## Verifiche effettivamente effettuate

- `career-r03.js` autentico letto da GitHub sul branch: parser V8 completo dopo esclusione dei soli import ESM (necessaria nell'ambiente isolato): **PASS**, 0 errori.
- Estrazione ed esecuzione V8 delle funzioni sorgenti originali `renderEntry()` e `render()`, con soli stub DOM e dei renderer delle schermate: **47/47 asserzioni PASS**, verifica 13 schermate, due CTA, visibilità footer, node identity fullscreen, match mount e presenza regole CSS.
- Esecuzione V8 del nuovo `ui12-landing-nav.test.cjs` recuperato dal branch, con `require` simulati per lettura dei due file autentici: **5/5 test PASS**. Il file rimane ripetibile in Node con `node --test oronzo/assets/ui/qa/ui12-landing-nav.test.cjs` su checkout completo; **non si dichiara eseguito con Node** in questa sessione.
- GitHub connector ha restituito SHA dei commit di codice e delle note; PR creata in bozza.

## Test NON eseguiti e rischi da convalidare

- **Chromium HTTP del gioco autentico: NON ESEGUITO.** Il contenitore di esecuzione non può clonare la repository (`git ls-remote`: `Could not resolve host: github.com`). Gli stub V8 non misurano geometria, rendering o interazione reale.
- **Android reale: NON ESEGUITO.** Ancora nessuno screenshot del proprietario dopo il fix.
- **Target ≥44px effettivamente visibili, risoluzioni 640×360 / 800×360 / 844×390 / 960×400, safe-area, overflow, tap/click, campo 16:9, conferenza e fullscreen F01:** attesi dal CSS, ma **non certificati** su Chromium/Android. Anche la compatibilità combinata con le PR #52 (fullscreen) e #53 (comuni, career-r03.js) necessita audit dopo integrazione: entrambe risultavano ancora aperte al controllo.
- Nuova assenza del footer: ricontrollare tutti i passaggi naturali della carriera per verificare che l'utente non desideri un comando di rientro aggiuntivo in alcune schermate. Nessuna modifica al flow/core per forzare i passaggi.

## Integrazione / consegna

Non aprire PR duplicate per S12-002; usare **sempre #59** per le successive correzioni guidate dal proprietario. Prima di approvare o fare merge, revisore00 deve eseguire HTTP Chromium autentico e prove sul codice combinato con #52/#53, allegare screenshot di confronto e touch hit-tests. Il proprietario deve confermare da Android la disposizione richiesta. **Nessun merge autorizzato.**

## Prossimi passi

1. Ricevere screenshot Android iniziale e feedback sulle due CTA a tutta larghezza.
2. Se necessario, rifinire solo `entry` e il posizionamento fullscreen, aggiungendo nuovi screenshot e misure.
3. Auditing indipendente delle viste reali dopo integrazione F01/D01; mantenere aperta questa PR finché non approvata dal proprietario.
