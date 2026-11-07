# RAPPORTO AGENTE 03 — UI dinamica e avatar · ciclo R02

**Stato:** PR_OPEN, senza merge.
**Identità:** ORONZO-AGENT-03 — UI Art Director.
**Repository:** CzekUns/cercax.
**Branch:** `agent/oronzo-ui-r02`.
**PR:** https://github.com/CzekUns/cercax/pull/33
**Issue:** https://github.com/CzekUns/cercax/issues/3
**Arte/kit commit:** `dfaef4c94cdb08aee8ba3c12814f4753c59f6a5d`.
**Baseline verificata:** `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697` su main al momento della creazione branch.
**Ciclo:** visione v0.2 / 7 novembre 2026.
**Precedente:** PR #5 mergiata, merge `ad84dd134b98d5fde8017af3da5e6e7b1b21e63e`.

## Realizzato

Consegnato **kit componibile** in `oronzo/assets/ui/`, senza editare i runtime:
- `demo-v02.html`, `demo-v02.css`, `demo-v02.js`: interfaccia HTML/CSS/JS con otto viste effettivamente navigabili in una demo autonoma: Nuova/Carica, avatar, 20 ingaggi, presidente, 5 domande conferenza iniziale, hub 1979 Campionato/Rosa/Tifoseria/Ufficio Presidente, prepartita, match con commutazione full campo/TV.
- `coaches-atlas.png` 416×256: 8 caricature originali 4×2, celle 104×128; `presidents-atlas.png` 208×256: 4 presidenti; `journalists-atlas.png` 312×256: 6 volti stampa. Ritratti senza valori statistici, nomi e città incorporati.
- `navy-noise.png` / `panel-noise.png` 96×96, `office-desk-v02.png` 375×160, `pitch-textless.png` 496×272, `btn-{blue,gold,disabled}-v02.png` 164×44. Texture/asset senza punteggi, nomi giocatori o HUD fissi; testo e controlli sono DOM.
- `ui-v02-manifest.json` identifica asset, frame atlas, selettori di hot spot touch `data-action`, aree bindabili, dimensioni e responsabili dei dati.
- `INTEGRATION-R02.md` descrive consumer/API e dipendenze; `qa/check_assets.py` e `qa/run_browser_qa.py` forniscono test ripetibili.
- Screenshot verificati e salvati in PR: `qa/avatar-640x360.png`, `qa/offers-800x360.png`, `qa/match-tv-844x390.png`; script QA genera localmente anche entry/hub/full per tutti i viewport.

**Nessun file** `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html` o sistemi gameplay modificato in R02.

## Verifiche effettivamente eseguite

1. `node --check demo-v02.js`: **PASS**.
2. `python qa/check_assets.py`: **PASS**, 10 PNG con dimensioni/formati previsti, 8 schermate nel manifest, conteggi 8 coach/4 presidenti/6 giornalisti e file demo esistenti.
3. `python qa/run_browser_qa.py`: **PASS** eseguito con Chromium + Playwright per **640×360, 800×360, 844×390**; pagina caricata con `page.set_content` (HTML+CSS+JS+PNG data URI dagli identici file perché il sandbox blocca `file://` e `localhost`). Non è la prova di deploy via HTTP, ma usa DOM vero ed esegue i callback JS nel browser.
4. Verifiche browser: layout 16:9 letterboxed; 8 avatar selezionabili con cambio visibile di città/4 statistiche DOM; 20 offerte reali nel listbox scorrevole, selezione ed anteprima; presidente; sequenza 5 risposte; hub; prepartita; 22 calciatori **dimostrativi** renderizzati; commutazione full ↔ TV con marker invariati; nessun `pageerror`.
5. Geometry QA: pulsanti interni alla scena almeno 44 px in altezza CSS (esclusi elementi listbox fuori viewport per scroll intenzionale), non tagliati da nav; nav inferiore ≥44px nei tre viewport. Prove screenshot 3 risoluzioni prodotte e ispezionate localmente, incluso avatar 640 e campo match full 640.
6. `ui-v02-manifest.json` parsato senza errori. Nessuna prova reale di rendering Android né prova di salva/carica, logica partita o eventi deterministici.

## API / Integrazione

API demo osservabile in `window.OronzoUIKitV02.createApp(root, {data,onIntent})`. L'istanza espone `navigate(screen)`, `render()`, `getScreen()`, `getState()`, `getPreview()`, `setData(partialData)`, `destroy()`. Gli intent sono `{type,value,screen,selectedCoach,selectedOffer,camera}`; `onIntent` può restituire `false` per impedire l'azione mock. Non è ancora un adapter al gameplay.

Dati di esempio: 8 coach, 20 club, 4 presidenti e 5 domande in JS **fittizi**. Città e nomi di club non sono il dataset verificato da 500 comuni né i 5000 cognomi finali. Preview morale territoriale 0/-1/-3 come **esempio** senza bonus salariale e moltiplicatori in attesa di specifica approvata. La fiducia tifosi locale alla pressione delle risposte è **soltanto un esempio di rendering UI**, non modifica il sistema 09. Header data «settembre 1979» è un placeholder d'ambientazione, non una data canonica di turno.

Dipendenze:
- **07** per game-flow e seed delle venti offerte, calendarizzazione 1979, save/load, identità del club e progresso prepartita;
- **09** per avatar (fortune/leadership/self-esteem/patience), risorsa morale e game over, presidente persistente/papponeria e relazioni;
- **04** per banca di domande e giornalisti/emittenti originali; **08** per valori calciatori;
- **05** per API due camere dallo stesso snapshot, **06** per contenuti e conseguenze degli ordini; l'UI non deve inventare eventi o punteggi.
- **01**/02 per sprite e cutscene definitive dopo gate.
Il successivo ciclo di runtime UI su `index.html`, `game.js`, `ui.css`, `partita-rapida.html` resta **prenotato ma non autorizzato** fino a nuovo NEXT.

## Mancante / problemi / qualità

- Demo standalone disponibile nel branch, non collegata al vero runtime: `Carica partita`, cambio giocatore e incitamento mostrano esplicitamente che l'azione è non collegata.
- Nessuna persistenza; punteggio 0–0 e ore 00:00 di scena sono esempi; 22 marker in campo **non** sono sprite 11v11 del motore.
- Il cambio camera in questo kit usa esclusivamente trasformazione CSS di un campo dimostrativo. La vera camera ball-follow dell'Agente 05 deve consumare gli snapshot corretti; nessuna promessa che il gioco già disponga di questa modalità.
- L'illustrazione d'ufficio è decorativa e contiene un titolo di giornale della proprietà ORONZO, non dati dinamici. Le immagini di ritratti sono ritagli di un'illustrazione generata appositamente per il kit R02, senza marche/emittenti reali incorporate negli atlas consegnati.
- QA Chromium `page.set_content` supera il blocco della navigazione locale, ma non dimostra che GitHub Pages carichi gli URL relativi: verificare post-deploy. Non eseguito test Android fisico.
- Font di sistema, nessun file di font distribuito.
- Gli asset cromatici sono in continuità con il design system PR #5; il mockup R01 resta solo reference, non livello click-through.

## Prossimo ciclo proposto (NON autorizzato in R02)

1. Collegare `OronzoUIKitV02` al controller dati e al flow del 07/09, mantenendo read-only la visualizzazione dei loro effetti e rispettando idempotenza/save.
2. Integrare in app vera il canvas partita 05/06 con switching camere e comandi reali; match e prepartita leggono lo stesso snapshot, non valori DOM demo.
3. QA Android e hosting statico, contrasto/font touch e casi edge game over, traduzioni e salvataggi.

**Gate richiesto:** revisione orchestratore della PR #33, nessun merge autonomo.