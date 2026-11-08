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

---

## Addendum R04 — correzione gate browser

**Data:** 7 novembre 2026. **Stato:** PR #33 OPEN / HOLD per review finale. **NEXT su main:** `WAIT_REVIEW`, gate R04 specifico. Nessun merge; nessun R03 autorizzato.

### Correzioni pubblicate nella PR corrente

- `oronzo/assets/ui/demo-v02.js`: corretta esclusivamente la permanenza del toast quando si cambia schermata (il precedente messaggio stampa copriva temporaneamente i comandi del match in navigazione rapida). `changeScreen()` cancella il timer del toast e nasconde il messaggio prima di ridisegnare la nuova vista. **Commit** `353d4eddb426c73d94bb23f48dbc5bf344738d5b`; blob JS nuovo `3bdb10678ff2810296385dc6937d851f48ddbcc8`.
- `oronzo/assets/ui/qa/run_browser_r04.py`: nuovo QA **riproducibile con Chromium vero**, emulazione touch, tre viewport e URL CSS/JS/PNG separati attraverso richieste browser intercettate da `page.route(...).fulfill(...)`.
- `oronzo/assets/ui/qa/R04-BROWSER-RESULTS.json`: dati di verifica con versione browser, regioni, controlli e risorse decodificate.
- Screenshot Chromium reali pubblicati nella PR (non mockup di PIL):
  `qa/r04-entry-640x360.png`, `qa/r04-avatar-640x360.png`, `qa/r04-avatar-dynamic-640x360.png`, `qa/r04-press-1-640x360.png`, `qa/r04-offers-800x360.png`, `qa/r04-hub-800x360.png`, `qa/r04-match-tv-844x390.png`, `qa/r04-match-full-844x390.png`.
- Commit che pubblica QA e screenshot: **`f49a79ab55a09ec06b7390a41ab8e10c51fac226`**.
- File modificati esclusivamente dentro `oronzo/assets/ui/` più questo `REPORT.md`. Niente modifiche al runtime, engine, contratti dei colleghi, `NEXT`, dati o NEXT R03.

### Test realmente eseguiti

| Comando | Esito osservato |
|---|---|
| `node --check oronzo/assets/ui/demo-v02.js` | **PASS** (sintassi JS dopo fix; Node 22.16.0 nel sandbox) |
| `python oronzo/assets/ui/qa/check_assets.py` | **PASS** sui file R02 originali recuperati, 10 PNG, dimensioni, 3 atlanti RGBA, 8 viste e manifest. |
| `python oronzo/assets/ui/qa/run_browser_qa.py` | **PASS**, vecchia suite Chromium con `set_content` e immagini in data URI, tre risoluzioni. |
| `python oronzo/assets/ui/qa/run_browser_r04.py` | **PASS**, Chromium 144.0.7559.96 reale, `/usr/bin/chromium`, Playwright Python, emulazione `is_mobile=True/has_touch=True`; 640×360, 800×360, 844×390. |

**Verifiche R04 browser puntuali**: layout centrato e 16:9 (letterbox a 800×360 e 844×390); click/tap reali, 8 avatar con 4 tratti originali e cambio mostrato nel DOM; `setData` cambia effettivamente nome, luogo e valori (fixture `MISTER DINAMICO`), senza alterare il portrait bitmap; 20 offerte vere nel DOM con selezione dell'ultima e **scroll** positivo; anteprima morale solo `0/-1/-3` **mock**; 4 presidenti disponibili nel kit e scena presentazione; **5 domande** di conferenza con 3 risposte ciascuna e fan mood demo finale 53; quattro menu hub premibili; prepartita; 22 marcatori dimostrativi invariati tra FULL/TV; screenshot full e TV; pulsanti visibili con **larghezza e altezza >=43,5 CSS px** (tolleranza geometrica 0,5 px sul target 44), nessun controllo principale tagliato; navigazione cancella toast passato; **zero `pageerror`, errori console e richieste fallite nel browser intercettato**; 10 PNG decorativi decodificati da Chromium con dimensioni reali.

**Evidence**: lo script ha prodotto **45 screenshot locali = 15 viste × 3 viewport** e la PR ne include **8 rappresentativi**; `qa/R04-BROWSER-RESULTS.json` ne conserva i dati. I file `demo-v02.js`, `demo-v02.html`, `demo-v02.css`, atlanti e altri PNG usati nel test corrispondono ai file pubblicati, non a una reimplementazione mock. Sorgente JS verificato via SHA Git blob prima del fix e dopo il fix.

### Limiti documentati senza PASS improprio

- **HTTP/deploy reale NON verificato.** In questo sandbox la navigazione top-level verso `http://127.0.0.1` e `https://oronzo-qa.invalid` fallisce con `net::ERR_BLOCKED_BY_ADMINISTRATOR`, anche con un server HTTP locale e route Playwright. Il browser ha tuttavia richiesto i veri URL relativi CSS/JS/PNG dal documento HTML; Playwright ne ha restituito esattamente i byte locali via `route.fulfill` con status 200 e content-type corretto. Questo prova il caricamento delle risorse lato Chromium, **non** la reale raggiungibilità HTTP di GitHub Pages, server o CDN.
- **Android fisico NON testato.** Sono test Chromium mobile-touch emulati; non misura densità, leggibilità, prestazioni e navigazione su dispositivo reale. Le didascalie retro di 8–9px visibili negli screenshot richiedono approvazione artistica su telefono prima del gate finale.
- Demo standalone, **NON runtime della carriera**. Avatar, offerte, morale, presidente, tifosi, giornalisti, 22 posizioni e punteggio sono fixture dimostrative. Camera TV è zoom CSS locale, non implementazione ball-follow dell'agente 05. Save/load e game-over non implementati qui.
- La fase M1 è limitata a **100 comuni / 500 cognomi verificati**, la raccolta appartiene già all'automazione; nessun duplicato e nessun testo/dato demografico inciso nelle immagini.
- I moduli 07/09 R02, il futuro adapter 07, gli shout 06/08 e la camera 05 restano prerequisiti contrattuali. Nessun `index.html`, `game.js`, `ui.css`, `partita-rapida.html` alterato; il successivo ciclo runtime richiede autorizzazione esplicita in NEXT.

### Raccomandazioni all'orchestratore (non autorizzazione R03)

1. Rieseguire `python oronzo/assets/ui/qa/run_browser_r04.py` nel checkout della PR #33 con Chromium disponibile, esaminare i PNG caricati e verificare personalmente la leggibilità/touch.
2. Validare il **deploy statico HTTP/GitHub Pages e almeno un Android fisico** nell'ambiente appropriato; la prova in sandbox via route non li sostituisce.
3. Solo dopo gate #33 e fix/merge 07+09, assegnare eventuale ciclo **runtime UI** separato con adapter 07 e contratti #31/#35 coerenti.

**Conclusione:** gate Chromium DOM e touch emulato superato sul codice del kit; gate deploy reale/Android resta da certificare. PR #33 aperta per review.

---

## Addendum R07 — fix R07-1 e R07-2, verifica Chromium

**Data:** 7 novembre 2026; **stato:** PR_OPEN, gate **R07B richiesto**.
**PR:** https://github.com/CzekUns/cercax/pull/33
**Commit sorgenti/test/screenshot R07:** `bb94ab59638921a9212167448091ca94afa5a792`.
**HEAD precedente:** `c38be80c392939d042dd998e6d1bf655c259804d`.
**Mandato:** `03-ui/NEXT.md` su main, **FIX_REQUESTED** solo R07-1/R07-2. Nessun merge, nessun R03.

### Correzioni consegnate

- **R07-1 — risolto nel kit demo:** `oronzo/assets/ui/demo-v02.js` rende la schermata iniziale con classi `entry-panel`, `entry-brief`, `entry-actions`, `entry-hint`; `demo-v02.css` riserva fisicamente altezza 44px a entrambe le CTA e comprime prima il testo decorativo. Si conserva la frase di avviso del salvataggio demo. I due pulsanti restano HTML con dati dinamici, senza scroll nascosto.
- **R07-2 — risolto nel kit demo:** `demo-v02.html` sposta il nodo accessibile `#ui-toast` nello slot dedicato dentro `.gamebar`, sopra l'intera `#ui-screen`. `demo-v02.css` lo rende flessibile, a due righe, senza overlay assoluto; mantiene aria-live/status e `pointer-events:none` come difesa aggiuntiva. `notify()` e il comportamento `changeScreen()` (pulizia dei messaggi obsoleti R04) non sono stati modificati.
- **Nuovo test:** `oronzo/assets/ui/qa/run_browser_r07.py`; risultati machine-readable `qa/R07B-RESULTS.json`; **12 screenshot Chromium reali**, 4 viste × 3 viewport: `qa/r07-entry-*`, `qa/r07-press-toast-*`, `qa/r07-hub-after-press-*`, `qa/r07-hub-toast-*`.

### Test realmente eseguiti

| Controllo | Evidenza osservata |
| --- | --- |
| `node --check demo-v02.js` | **PASS**, Node 22.16.0, sintassi senza errori |
| Pillow sulle dieci immagini del kit | **PASS**, PNG e dimensioni attese; 10 file verificati |
| `python qa/run_browser_r07.py` | **PASS**, Chromium 144.0.7559.96, 6 percorsi (desktop e `is_mobile/has_touch`) su **640×360**, **800×360**, **844×390** |
| R07-1 clipping effettivo | **PASS 6/6**: `CARICA PARTITA` misura 44px nominali e **44px visibili** dopo intersezione con gli antenati con overflow; nota `entry-hint` dentro pannello; centro `document.elementFromPoint` identifica `sample-load`; tap/mouse fisico su coordinate centrali attiva `#ui-toast` senza auto-scroll |
| R07-2 post-conferenza | **PASS 6/6**: percorso da Nuova → Avatar → 20 offerte → Presidente → 5 risposte stampa → hub; dopo quinta domanda, toast ancora visibile; hit-test al centro della CTA dorata restituisce `goto/prematch`; tocco immediato porta a `prematch` senza aspettare 2400ms |
| Stato, menu e indicatori | **PASS 6/6**: intersezioni geometriche tra lo slot toast visibile e TUTTI i pulsanti, KPI, note, titoli del pannello, quick nav, brand e top-info = **zero**; stesso controllo dopo le risposte 1–4 e su menu `PRESIDENTE` con toast di funzione non collegata |
| Caricamento JS/CSS/PNG | **PASS Chromium** per `demo-v02.js`, `demo-v02.css` e tutti i 10 PNG originali decodificati esplicitamente in ognuno dei sei percorsi, senza eccezioni JS/console. Le richieste sono servite con `Playwright route.fulfill` dai byte locali (NON HTTP reale) |
| SHA Git del file JS testato | **PASS**: hash blob di `demo-v02.js` usato nel browser = `99dff55566f7b0fd1053a190c32e352c7d281098`, esattamente il blob Git pubblicato; CSS/HTML/QA hanno anch'essi SHA uguali ai blob creati |

**Evidenze e script:** https://github.com/CzekUns/cercax/tree/agent/oronzo-ui-r02/oronzo/assets/ui/qa/
Le 12 immagini sono screenshot di Chromium, non screenshot di ImageGen/PIL né previsioni visive.

### Limiti e gate non sostituiti

- In questa sessione `page.goto(http://127.0.0.1/...)` ha fallito con **`net::ERR_BLOCKED_BY_ADMINISTRATOR`**. Il test utilizza Chromium effettivo e `page.set_content` con CSS/JS/asset richiesti tramite URL relativi e bytes originali forniti da `route.fulfill`. **Non è una nuova verifica HTTP reale.** Il report indipendente R07 del 00 aveva già verificato HTTP locale prima del fix.
- **Android fisico NON testato**; desktop + emulazione touch su Chromium sì.
- La suite R04 originale `qa/run_browser_r04.py` e il file `qa/check_assets.py` non sono stati rieseguiti come comandi separati in questo ambiente; la nuova suite R07 contiene i controlli funzionali specifici più stringenti e Pillow ha validato i dieci asset. R07B deve eventualmente rilanciare anche R04 in checkout.
- La demo resta **standalone**, dati fittizi, nessun salvataggio, nessun match reale, nessuna modifica al controller 07, al motore 06 o ai file runtime root.
- Nessun dato geografico raccolto o modificato: la raccolta approvata dei **100 comuni/500 cognomi** appartiene al flusso separato.

**Proposta:** revisione mirata **R07B** del Coerentizzatore 00 sul nuovo HEAD della **PR #33** per i due soli fix; l'orchestratore decide il gate/merge. Nessuna richiesta di inizio R03.


**Consolidamento QA R07:** commit `95094ff499b89d6d96ea483b6ae82f06540c2973`. Aggiornati solo `qa/run_browser_r07.py` e `qa/R07B-RESULTS.json` per decodificare **tutti i 10 PNG originali in ciascuno dei 6 percorsi Chromium**. Risultato nuovo: **6/6 PASS**, asset richiesti **12** (CSS, JS e 10 PNG), senza errori console. Sono confermati clipping 44/44px, hit test, tap immediato e zero sovrapposizioni toast; lo script non prova hosting HTTP reale.


---

# ORONZO — AGENTE 03 · REPORT R03 Runtime — 8 novembre 2026

**Identità:** ORONZO-AGENT-03 · **Stato:** PR OPEN, **NO MERGE**.
**Branch:** \`agent/oronzo-ui-r03-runtime\`, base \`main\` \`8ba2a84a0fed49dc052e4c41b06db2c602f093ae\`.
**PR:** https://github.com/CzekUns/cercax/pull/43

## Consegna effettiva

- \`oronzo/assets/ui/career-r03.html\` — nuovo entrypoint R03 1979 separato dal prototipo 1985.
- \`oronzo/assets/ui/career-r03.css\` — riuso dei 10 PNG e del design system v0.2, stato in header, touch 44px, landscape 16:9.
- \`oronzo/assets/ui/career-r03.js\` — UI collegata alle vere API dell'Agente 07, morale 09, Copy04, motore 06 e MatchView05 senza duplicazioni di score o fortuna.
- \`oronzo/assets/ui/qa/r03-chromium.py\` — percorso automatizzato Chromium con touch/mouse e intercettazione al centro reale della CTA, sei varianti.
- \`oronzo/index.html\` — solo link al nuovo entrypoint; vecchio \`game.js\`, \`ui.css\`, \`partita-rapida.html\` e salvataggi legacy 1985 intatti.

**Percorso disponibile:** Nuova partita → otto avatar/quattro tratti/origine esplicita → venti offerte vere → preview morale 09 e contratto → presidente Copy04 → cinque risposte reali → hub 1979 con KPI/rosa/classifica/finanze → formazione selezionabile, 11 titolari, esattamente un GK, panchina e capitano → MatchEngine06 11v11 con \`tickMatch\` e camera full renderer 05 → finale risultato/eventi autorevoli → due risposte postpartita → \`advanceMatchday\` una sola volta e salvataggio/caricamento. 1× = 6 secondi di simulazione per secondo reale, circa 15 minuti a 5400 secondi; velocità 1/2/4/8×. Il pulsante QA per terminare rapidamente usa **sempre** Engine06, non inventa gol.

**Gate geografico:** fixture importata senza modifiche da \`oronzo/app/flow/tests/qa-geography.mjs\`; etichetta persistente \`DEMO TECNICA — LOCALITÀ SINTETICHE\`. Se la modalità QA non è abilitata, \`acceptOffer\` rifiuta \`geography_required\` e lascia il JSON di carriera immutato; nessuna località dichiarata ISTAT. Questo **non** soddisfa la milestone dei comuni/cognomi reali.

**Save:** API 07 con checksum e chiave nuova \`oronzo.career.flow.r03\`, non sovrascrive i salvataggi 1985; la UI rifiuta il salvataggio della gara preparata/in corso e salva nelle transizioni consentite. In assenza di dati verificati, il Playtest QA mantiene solo il mondo sintetico.

## Test effettivamente eseguiti

- \`node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js\` su checkout locale integrato da \`main\` → **97/97 PASS, 0 FAIL** (rerun, circa 29 s).
- \`node --test oronzo/systems/match-view/*.test.mjs\` → **22/22 PASS, 0 FAIL**.
- \`node --check oronzo/assets/ui/career-r03.js\` → PASS.
- Chromium \`/usr/bin/chromium\` headless, viewport 640×360 / 800×360 / 844×390, desktop + touch → **6/6 percorsi end-to-end PASS** (quattro scenari prima dell'ultimo test isolato e altri due 844×390 isolati). Verificati 20 offerte, cinque risposte, 11 titolari e un GK, 22 attori Engine06, fulltime motore, due risposte finali, passaggio a settimana 2, save/load con archivio di prova e rifiuto \`geography_required\` senza alterare lo stato, click al centro senza scroll automatico, assenza di pageerror. L'ultima coppia 844×390 ha prodotto score Engine06 **2–0**, non score simulato dalla UI.
- Render reale degli sprite Agent01 presenti su main; osservato fallback HTTP 404 del manifest cutscene Agent02 assente: non affermiamo cutscene integrate. Screenshot locali generati nel banco di prova: \`r03-hub-{640x360,800x360,844x390}.png\`, \`r03-match-{640x360,800x360,844x390}.png\` (file QA locali, **non** caricati nella PR).
- Il tentativo di aggiungere l'intera suite Engine06 separatamente è stato **interrotto dal timeout dell'ambiente**, quindi **nessun esito PASS assegnato a quella suite**; il match 06 è comunque esercitato nel percorso browser/97 test di flow.

## Limiti e rischi aperti per audit indipendente R08

1. **Non è stato verificato un URL pubblico né Android fisico.** Il server statico Python locale ha risposto HTTP 200, ma Chromium in questo ambiente blocca \`page.goto(http://127.0.0.1)\`. Per Chromium è stato usato \`route.fulfill\` dei **file reali** su un origin \`.invalid\`; non è una navigazione HTTP pubblica. Il test save/load usa storage shim e ricreazione contesto con gli stessi dati (prova di serializzazione, **non** persistenza reale di browser tra riavvii di processo). Gate reale Android/hosting ancora necessario.
2. **Camera TV vera assente** nel renderer 05 su main: la UI la dichiara non disponibile anziché camuffarla con CSS zoom. Le cutscene Agent02 mancano; fallback tecnico esplicito.
3. **Geografia/cognomi storici non verificati**. I club/luoghi della QA sono identificati come sintetici; la release pubblica non deve essere presentata come popolata da ISTAT. Le gare degli altri club vengono prodotte dal provider deterministico Agent07 e sono etichettate come tali.
4. **R03 è un primo slice:** UI degli ordini individuali e integrazione editoriale completa dell'allenamento non coperte. Il percorso verticale richiesto è stato verificato nel test, non l'intera carriera pluristagionale su Android.
5. **Regressione UI del prototipo 1985:** i file runtime legacy e partita rapida non sono stati modificati; è stata aggiunta una CTA nel vecchio \`index.html\`. Nessuna nuova suite di browser legacy completa è stata eseguita in questo ciclo.

**Avvio locale dalla root clone:** \`python3 -m http.server 8000\` e \`http://localhost:8000/oronzo/assets/ui/career-r03.html\`; su telefono nella stessa rete usare l'indirizzo LAN del computer al posto di \`localhost\` (indirizzo non verificato in questa sessione). Selezionare la modalità QA esplicitamente marcata per completare l'ingaggio fino alla disponibilità del catalogo approvato.

**Prossimo gate:** Coerentizzatore 00 deve controllare PR #43 (R08), scenari HTTP reali, Android/touch, regressione legacy, rischio dataset sintetico e merge solo se successivamente autorizzato. Nessuna modifica alle cartelle degli altri agenti; nessun merge eseguito.

**File SHA-256 del contenuto proposto (non commit SHA):**
- \`index.html\` \`1838e33e7d2cca64fd2c0333601d099e51904de2b3146e049591e8c25a467179\`
- \`career-r03.html\` \`7a5aa7c442029d652e7987a704e8d79729e603a8a4fe4f835b0f846fd6516392\`
- \`career-r03.css\` \`380c9a0282a4f361fa2a40d51f4f99a4b437b0926b118c7160edf1353bd5bcd1\`
- \`career-r03.js\` \`2097de5e9dd9ec7fcbd06afbcc4ac5b820845b66d4a1eaf9b448c86d6724ad96\`
- \`qa/r03-chromium.py\` \`4ba72d537b90b07aee442c22301cef1e897e7c1b886fef727a24a70c682ffca7\`

**Proposte prossimo ciclo (dopo R08):** (1) implementare vera camera broadcast con Agent05; (2) integrare il dataset di comuni/cognomi verificato appena disponibile; (3) effettuare QA su Android reale tramite preview pubblicata, includendo salvataggio/riavvio autentico e orientamento.


---

# ORONZO AGENTE 03 — Correzioni mirate R08 / richiesta audit R08B

**Data:** 8 novembre 2026. **PR:** https://github.com/CzekUns/cercax/pull/43 (**OPEN**, NO MERGE).
**Audit esaminato:** REPORT-R08 del Coerentizzatore 00 nella PR #44. **NEXT da main:** FIX_REQUESTED, esclusivamente R08-1/2/3/4.
**HEAD precedente:** 8977305d78d1ddf161ac72b38b41973fe4311db4.
**Commit R08 con sorgenti, test e screenshot:** b2118db7029ab5cab4ed380c21a70a467214f8c8.

## R08-1 — 16 giocatori, schede e Allenamento

Eliminato il taglio a 12 giocatori in renderHub. Tutti i 16 elementi di club.players appaiono come pulsanti accessibili con playerId reale, lista scrollabile e ultimo giocatore raggiungibile. La scheda giocatore interroga entrambe le API reali **getRosterPlayer(state,id)** e **getTrainingPlayer(state,id)** del 07, verifica corrispondenza ID e club, mostra valori restituiti per anagrafica, stato fisico, contratto, tecnica, fisico e mente. I campi assenti vengono esplicitamente resi **dato non disponibile**: nessuna statistica ricostruita nel client.

Hub ampliato con menu **ALLENAMENTO**, consultazione della rosa completa, scheda e ritorno a ROSA; azione **MODIFICA ALLENAMENTO · NON DISPONIBILE** realmente disabilitata. Nessuna nuova regola, valore, variazione della forma o del morale. Allenamento attivo resta dipendenza esterna futura.

## R08-2 — Classifica integrale

Eliminato il taglio a 12: ogni riga restituita dal vero getStandings è mantenuta nell’ordine della API, con rank/clubId/points/played reali. In questa lega **16/16 righe**, incluse posizioni 13–16, raggiungibili con scroll mouse o gesture touch. Squadra allenata sempre presente ed evidenziata. Nessun risultato modificato.

## R08-3 — Target touch / clipping

Il layout avatar separa in un corpo scrollabile il ritratto, le quattro statistiche, il select di origine e il toggle QA, conservando fuori dal suo scroll la barra pulsanti **INDIETRO / 20 OFFERTE**. Il match a 360px conserva 44px effettivi per **TERMINA GARA CON ENGINE06 (QA)** e per le azioni match: decorazioni comprimibili anziché pulsanti. Select origine/capitano min 44px, righe checkbox formazione e pulsanti rosa min 45px, tutti i cinque tasti hub min 44px.

Lo script qa/r08-chromium.py misura la **intersezione del bounding rect con TUTTI gli antenati overflow e viewport**, esige altezza realmente visibile **almeno 43,99px** (tolleranza tecnica floating point 0,01px), identifica il target via document.elementFromPoint e invia click al centro senza locator auto-scroll. Le righe terminali vengono portate nel viewport da wheel o Input.dispatchTouchEvent, poi hit test e tap. Test effettuati in 640×360 / 800×360 / 844×390, mouse e touch.

## R08-4 — Game over con salvataggio conservato

Schermata game over ora contiene **NUOVA CARRIERA** e **CARICA SALVATAGGIO**. L'azione reset-career distrugge MatchView, disassocia engine e stato coach terminato, ripristina soltanto variabili UI e torna alla selezione avatar senza reload. La creazione successiva passa dalla **vera newGame del 07**; il vecchio coach non viene guarito né modificato. I salvataggi esistenti rimangono intatti: dopo reset i salvataggi automatici sono soppressi; un nuovo SALVA manuale chiede conferma esplicita prima della sostituzione. Load precedente ripristina esattamente lo stato originale.

Test: evento reale **applyCoachMoraleEvent** del modulo 09 con delta -100 ed eventId QA (morale 0, gameOver), reset, nuovo coach morale positivo, autosave soppresso, confirm manuale rifiutato, vecchio save invariato e caricabile. L'evento negativo è un artificio QA per raggiungere la soglia, non una decisione fittizia inserita nel gameplay.

## Risultati test R08 realmente rieseguiti dopo le correzioni

- Node sintassi career-r03.js: **PASS**.
- Python compile qa/r08-chromium.py: **PASS**.
- Node flow + career + coach-club: **97/97 PASS**, zero fallimenti, circa 31,4 secondi.
- Node match-view: **22/22 PASS**, zero fallimenti.
- Chromium **144.0.7559.96**, **6/6 PASS**: 640×360, 800×360, 844×390, ciascuna in mouse e touch. I casi sono eseguiti **isolatamente** con R08_CASE per evitare timeout del runner globale; durate 7–21s. Evidenza in qa/R08B-RESULTS.json e script qa/r08-chromium.py.
- In ciascun percorso: 8 avatar, 20 offerte vere, 5 risposte Copy04, 16/16 rosa, scheda 16esimo, consultazione allenamento senza cambi stato, 16/16 classifica con scroll fino a 16, 11 titolari, Engine06 con 22 calciatori e fulltime, 2 risposte postmatch, avanzamento a settimana 2, save/load JSON identici, game-over Agent09, reset e vecchio save protetto, geography_required senza mutazione. **Zero pageerror**.
- Asset opzionale cutscene: **un 404 per percorso** per oronzo/assets/cutscenes/manifest.json assente da main; renderer usa fallback. Nessun altro 4xx nei casi.

**15 screenshot Chromium reali** in oronzo/assets/ui/qa/: cinque schermate avatar/player/standings/match/gameover per ognuna delle tre risoluzioni. Non sono immagini sintetizzate a posteriori.

**File R08 modificati:** oronzo/assets/ui/career-r03.js, career-r03.css, qa/r08-chromium.py, qa/R08B-RESULTS.json, 15 PNG qa/r08-*.png, e questo REPORT.md. Nessun file degli altri agenti, NEXT, Copy04 o runtime legacy alterato in R08. SHA Git dei byte pubblicati: JS 729ab290406d7ab6b33747e6ab09280f04b65af4; CSS 866a60e83b4cce4ca047615ab677dfd99a28c644; test 356e343e8d90a0597e0ad112c0731dc07e3076d4; JSON 5c124ae9737b1e3239f5c5041729816ebe796fbd.

## Limiti e dipendenze

In questo sandbox Chromium non può aprire http://127.0.0.1 (ERR_BLOCKED_BY_ADMINISTRATOR, verificato). Le prove hanno usato **Chromium reale** con ESM, JSON, PNG e CSS dei file originali serviti tramite route.fulfill, e un localStorage shim per il caricamento: ciò **non** costituisce una nuova prova di browser HTTP reale o Android fisico. L'audit 00 precedente aveva verificato HTTP statico e localStorage autentico sul vecchio HEAD; **richiesta di ripetere via HTTP al gate R08B**, non assumere automaticamente l'esito. Durata 15min a 1× non attesa per 900s nei test (completamento QA usa sempre Engine06, nessuno score stub).

Cutscene e camera TV reali non disponibili; modo QA con banner permanente **DEMO TECNICA — LOCALITÀ SINTETICHE**, nessuna falsa provenienza ISTAT. Il modo normale continua a bloccare ingaggio con geography_required fino ai cataloghi verificati. La sezione Allenamento è **consultazione**, non training attivo; serve il futuro contratto degli altri agenti.

**Handoff:** Coerentizzatore 00, eseguire audit indipendente **R08B solo su R08-1/2/3/4 e regressioni** della PR #43. Qualunque merge appartiene all’orchestratore. Nessun merge eseguito.
