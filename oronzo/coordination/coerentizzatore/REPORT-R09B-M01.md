# ORONZO — REPORT-R09B-M01 · PR #48

**Verdetto complessivo: NEEDS CHANGES / MERGE BLOCKED.**
**R09-M01-1 (TERMINA GARA): PASS, 16/16 configurazioni.** Rimane una violazione del gate touch nella conferenza iniziale, confermata indipendentemente. Nessun merge eseguito o raccomandato su questo HEAD.

- Revisore: Agente00, Coerentizzatore; 8 novembre 2026.
- HEAD verificato e ricontrollato prima della consegna: **`58c7c65506f74f012b17b099583e96ee380f8db5`**, PR [#48](https://github.com/CzekUns/cercax/pull/48) OPEN / NOT MERGED.
- Main letto e baseline: **`5a0e0a408d5f4c629d23509fdbcb24dde373ba8b`**; base originaria PR `55df243b6397d545baab967652f8556f71f878d3`.
- HEAD precedente #48: `6e72486607405d06d9a5ba8cac8d00a002ea5da8`; commit fix/QA `efd42f14ef7c6c9949d2bfe936a64e04d4b6a47e`.

Letti REQUEST corrente, RUN, REPORT11 aggiornato, NEXT11, precedente REPORT-R09-M01 e documenti di coordinamento/contratti pertinenti. Questa verifica usa sorgenti ricostruiti, harness propri, Chromium e screenshot nuovi; non esegue gli harness dell'autore e non adotta i suoi risultati come prove. Nessuna modifica al gioco, NEXT o branch11; nessuna altra PR esaminata.

## Metodo e integrità

**Chromium 149.0.7827.0 reale, headless, HTTP locale**, Playwright, DPR1, locale it-IT, mouse oppure contesto mobile con touch. ESM, JSON, PNG originali e localStorage autentico; nessun `route.fulfill`, HTML sostitutivo, motore finto o storage shim. Safe area tramite CDP `Emulation.setSafeAreaInsetsOverride`: `{top:0,left:24,right:12,bottom:16}`.

Ricostruiti e verificati **142/142 blob** runtime/test/asset contro gli SHA Git. Di questi, **141 coincidono anche con main**: l'unica differenza è `oronzo/assets/ui/career-r03.css`. Le baseline HTTP servono i medesimi file sostituendo esclusivamente questo CSS con il blob main o pre-fix.

Diff completo #48/base: **104 file**, un solo file runtime modificato, **10 righe aggiunte al CSS**; gli altri file sono QA e REPORT11. Rispetto al precedente HEAD: solo commento e `#oronzo-r03 .runtime-match-panel{padding-top:1px}` nel runtime. Nessuna modifica a JS, HTML, font, asset, controller, motore, renderer o persistenza.

## R09-M01-1 — PASS: TERMINA GARA

Misurata l'intersezione del rettangolo del pulsante con viewport e aree interne di **tutti gli antenati con overflow**. Verificati hit-test al centro e vicino ai due bordi verticali visibili; click/tap reale alle coordinate, senza autoscroll del pulsante. Il controllo porta effettivamente a `postmatch_press` tramite Engine06.

| Viewport | Senza inset: mouse / touch | Con inset: mouse / touch | Stage con inset | Canvas con inset |
|---|---|---|---|---|
| 640×360 | 44 / 44 px | 44 / 44 px | 604×344, x24/y0 | 300,438×168,984 |
| 800×360 | 44 / 44 px | 44 / 44 px | 764×344, x24/y0 | 300,438×168,984 |
| 844×390 | 44 / 44 px | 44 / 44 px | 808×374, x24/y0 | 332,625×187,094 |
| 960×400 | 44 / 44 px | 44 / 44 px | 924×384, x24/y0 | 350,406×197,094 |

Nominale e visibile: **44px in tutti i 16 casi**. Anche i quattro pulsanti adiacenti hanno almeno44px e hit-test positivo. Provati pausa/ripresa, velocità e feedback dei due pulsanti camera già esistenti; nessuna nuova funzione camera valutata o sviluppata.

Senza inset lo stage occupa l'intero viewport. Con inset esclude esattamente36px laterali e16px inferiori. Canvas sempre16:9 entro0,001 sul rapporto, senza stretch; screenshot propri mostrano campo e sprite proporzionati. Font calcolato di TERMINA GARA **9px**, risposte stampa **10px**, invariati nelle condizioni confrontate; nessuna regola di font cambiata. Portrait→landscape e resize dell'altezza di30px verificati nei16 percorsi. Il kit R02 rimane centrato16:9: a960×400 misura711,109×400.

## R09B-M01-1 — P2, bloccante per il gate: terza risposta stampa tagliata

**Owner: Agente11.** Layout in [career-r03.css](https://github.com/CzekUns/cercax/blob/58c7c65506f74f012b17b099583e96ee380f8db5/oronzo/assets/ui/career-r03.css#L15), selettori `.runtime-press-wrap`, `.runtime-answers`, `.runtime-question`, override landscape righe81–86; clipping `.panel` in `demo-v02.css`. Il contenuto è emesso da `renderPress()`, `career-r03.js:80`; non è necessario modificare Copy04.

**Riproduzione:** 640×360, inset left24/right12/bottom16; nuova carriera QA → selezionare Arturo Foschetti (avatar indice1) →20 offerte → scorrere fino alla ventesima e accettarla → presidente → conferenza → scegliere la terza risposta alle prime due domande. Alla domanda3, «Chi non può permettersi il biglietto deve sentirsi parte della squadra?», misurare la terza risposta «Capisco il problema, ma la politica dei prezzi non dipende dal mister.».

| Versione provata via HTTP | Altezza nominale | Altezza visibile | Mouse / touch |
|---|---:|---:|---|
| Main `5a0e0a4`, stessi inset CDP | 44,625 | **44,625px** | non riprodotto / non riprodotto |
| #48 pre-fix `6e724866` | 44 | **39,15625px** | FAIL / FAIL |
| #48 HEAD `58c7c655` | 44 | **39,15625px** | FAIL / FAIL |

Sul nuovo HEAD: rettangolo **x150/y247,84375/w463/h44**; il bordo interno dell'antenato tronca il pulsante a **y287**, nascondendo4,84375px. Il centro visibile è attivabile; il tap a **x381,5/y291,34375**, dentro il rettangolo nominale ma nella striscia tagliata, **non** trova il pulsante e non avanza la domanda. Un successivo tap centrale avanza correttamente. Non è un blocco del gameplay o una corruzione dati: è una violazione geometrica/accessibilità del requisito generale44px.

**Precisazione sulla preesistenza:** il problema precede la correzione R09-M01-1, ma **non si riproduce sul main precedente con lo stesso override CDP**. Main non riserva ancora gli inset con il padding M01: lo stage resta640×360; M01 lo porta a604×344. È quindi un problema del layout M01 già presente nel precedente HEAD della PR, **non causato dalla nuova regola di padding del pannello partita**. Non è corretto archiviarlo come difetto dimostrato di main.

**Atteso:** tutte e tre le risposte devono conservare almeno44px visibili e attivabili, con domanda e informazioni leggibili, anche nell'altezza utile344px.

**Correzione richiesta sulla stessa #48:** adattare il layout compatto della stampa all'altezza utile dopo safe area, recuperando spazio da gap/padding decorativi di `.runtime-answers` e `.runtime-question` oppure ripartendo esplicitamente lo spazio non interattivo. Riservare tre righe da almeno44px e lo spazio dei metadati; mantenere leggibili domanda e morale. Non ridurre font o target, non eliminare inset e non toccare motore, testi o salvataggi. Aggiungere al QA tutte le risposte delle cinque domande, non soltanto quella scelta, nelle16 configurazioni. Accettazione: intersezione con antenati e hit-test su tutta l'altezza utile ≥44px, tap reale e percorso completo invariati. **Fino a quel momento: niente merge.**

## Regressioni realmente eseguite

| Prova | Esito |
|---|---|
| `node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` | **97/97 PASS**, 0 fail, circa18,4s |
| `node --test oronzo/systems/match-view/*.test.mjs` | **22/22 PASS**, 0 fail |
| Carriera HTTP, quattro viewport × due inset × due input | **16/16 percorsi funzionali PASS**; gate geometrico stampa FAIL in2 casi |
| Salvataggio, reload HTTP e caricamento | Stato JSON identico in16/16 |
| Morale0 con evento API09 controllato, game over, nuova carriera e rifiuto sovrascrittura | PASS in16/16; vecchi slot preservati |
| Modalità senza geografia | `geography_required` senza mutazione,16/16 |
| Link homepage → Rapida1985, caricamento pagina/canvas | PASS, HTTP200 |
| Risultati/gol, classifica, finanze e storico dei16 percorsi | PASS; dettagli in `data-validation.json` |

Ogni percorso seleziona gli8 avatar, raggiunge la ventesima offerta tramite wheel/swipe, firma, attraversa presidente e5 domande, Ufficio, Rosa e Allenamento16/16, scheda del sedicesimo confrontata con API07, classifica16 in ordine identico all'API e fondo lista raggiunto, formazione11 con controllo capitano e preparazione validata,22 attori reali, pausa/ripresa e avanzamento del tempo, fulltime Engine06 tramite comando QA,2 risposte postpartita, settimana2, save/load e navigazione. Scroll touch con eventi reali CDP touchStart/Move/End; tap con `touchscreen.tap`.

Esempio controllato: PROM-14 vince **2–1**; tre goal nel fixture corrispondono al punteggio, classifica **1 giocata / 2 punti / differenza+1**; cassa **10.100.000→9.595.000**, stipendio505.000 applicato una sola volta con `settledWeeks:['a:1']`; storico collega il fixture `1979:PROM:1:2`, settimana assoluta2 dopo avanzamento; morale48→49. Controlli analoghi sui16 stati.

Esaminati screenshot propri Avatar/Offerte/Stampa/Ufficio/Scheda/Classifica/Partita alle quattro risoluzioni. Banner sintetico preservato, PNG originali caricati. **Zero eccezioni JavaScript** nei16 percorsi; rimane un404 opzionale per gara su `assets/cutscenes/manifest.json`, assente anche da main. Nessun altro HTTP≥400 nel percorso R03.

## Evidenze, limiti e consegna

[Pacchetto con harness indipendenti, metriche, log, baseline CSS e screenshot nativi](https://chatgpt.com/library?file_id=libfile_4591dac5d3a08191a4ecc08886d9c89a&account_id=personal). File autorevoli: `verified-results.json` (16 percorsi più baseline main), `pre-fix-results.json`, `auxiliary-results.json`, `data-validation.json`; manifest di142 blob. README con replica e nota sui tentativi iniziali del harness touch corretti prima della matrice finale.

**Non verificati:** Android fisico, cutout/toolbar Android reali, preview pubblica del branch,900 secondi continuativi a1×. Le due stagioni sono esercitate dalla suite Node (104 club/76 periodi), **non** da una nuova campagna browser pluristagionale. Nessun PASS generale di tutte le possibili combinazioni di testo/identità è dichiarato.

**Handoff:** richiedere all'Agente11 solo il fix stampa descritto, mantenendo il fix TERMINA GARA già superato e la stessa PR #48; ripresentare il nuovo HEAD al gate indipendente. Nessuna modifica ai NEXT, nessuna attivazione di altri cicli, nessun merge.
