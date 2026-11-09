# ORONZO — REPORT-R09-M01 · PR #48

**Verdetto: NEEDS CHANGES / NO MERGE.** Il recupero della larghezza funziona, ma con safe-area inferiore il pulsante finale della partita scende a **42px effettivamente visibili**, contro il requisito di 44px. Correzione circoscritta all'Agente11 sulla stessa PR #48.

- Data: 8 novembre 2026, Europe/Rome.
- PR controllata: [#48](https://github.com/CzekUns/cercax/pull/48), HEAD **`6e72486607405d06d9a5ba8cac8d00a002ea5da8`**, OPEN/NOT MERGED.
- Main corrente letto: **`8d9e84e4bf2544ba65e3b8573db46612e4c8617b`**; base originaria della PR `55df243b6397d545baab967652f8556f71f878d3`.
- Mandato: REQUEST M01/R09 su main, NEXT11 WAIT_REVIEW_M01, REPORT11 e storia R08B pertinente. Nessuna altra PR esaminata, nessun merge, nessuna modifica a gioco/NEXT o al branch11.

**Indipendenza:** nuove prove HTTP e nuovi harness, senza importare o eseguire QA/risultati dell'11 e senza usare i suoi screenshot come evidenza. Questa è tuttavia la stessa chat che aveva prodotto M01: non viene attestata separazione personale tra autore e revisore. Il difetto sotto è una nuova osservazione riproducibile, non una conclusione ricavata dal REPORT dell'autore.

## R09-M01-1 · P2 · CTA tagliata con safe area

**Owner: Agente11. File:** `oronzo/assets/ui/career-r03.css`, nuove righe **81–83**, in interazione con `.runtime-match-panel` e relative regole alle righe **48–66**. CSS HEAD: blob `7feecdc8a9e16d01237627c895bf84e8a4586ad5`.

**Riproduzione verificata:** Chromium 153.0.8010.0, vero HTTP statico; viewport sotto; CDP `Emulation.setSafeAreaInsetsOverride` con `{top:0,left:24,right:12,bottom:16}`. Nuova carriera QA → offerta → 5 risposte → formazione → partita. Intersecare il rettangolo del bottone `[data-action="finish-qa"]` con le aree interne di tutti gli antenati overflow e la viewport.

| Viewport | Stage dopo safe-area (x/y, w×h) | Rettangolo CTA (y, h) | Altezza visibile | Mouse/touch |
|---|---|---|---:|---|
| 640×360 | 24/0, 604×344 | 245, 44 | **42px** | FAIL / FAIL |
| 800×360 | 24/0, 764×344 | 245, 44 | **42px** | FAIL / FAIL |
| 844×390 | 24/0, 808×374 | interamente contenuto | 44px | PASS / PASS |
| 960×400 | 24/0, 924×384 | 282,891, 44 | **42px** | FAIL / FAIL |

Il tap/clic centrale identifica il pulsante e completa realmente la gara (`postmatch_press`): **non è un blocco del gameplay**, ma il controllo è tagliato di 2px e non supera il gate geometrico. Il difetto è presente in **6 degli 8 casi** safe-area. L'inset inferiore riduce l'altezza effettiva dello stage, mentre gli arrangiamenti compatti dipendono dalla viewport e non garantiscono più lo spazio interno necessario. È stato osservato direttamente il clipping; questa spiegazione della causa è dedotta dal CSS e dalle misure.

**Correzione richiesta:** mantenere il padding delle safe area e la larghezza piena, riservando alla CTA tutti i 44px nell'altezza effettivamente disponibile. Comprimere prima gap, padding o informazioni decorative/non interattive del pannello; non ridurre font/target e non togliere la safe-area inferiore. Non modificare motore, renderer o salvataggi. Aggiungere queste tre condizioni al QA, oltre al caso 844×390 già coperto dall'autore; verificare tap centrale e almeno 44px dopo clipping. Nessuna patch al gioco realizzata dal revisore.

## Nuove prove riuscite

**Chromium 153.0.8010.0**, locale it-IT, DPR1; desktop + mobile/touch emulato. Server HTTP autentico, ESM/JSON/PNG originali, localStorage autentico, reload. Nessun `route.fulfill`, `set_content`, stub motore o storage shim. Gli harness R09 sono distinti dai file QA11.

Ricostruzione locale: **248 file presenti corrispondenti ai blob dell'HEAD**. I moduli runtime necessari coincidono anche col main corrente, salvo il CSS oggetto della PR; gli avanzamenti recenti di main sono documentali. Il confronto della PR rispetto alla sua base conferma **62 file**, dei quali un solo file runtime modificato: **8 righe aggiunte a career-r03.css**. Il resto è QA/REPORT. JS/controller/save/renderer, HTML, font, asset, demo R02 e legacy invariati.

### Geometria senza inset

Misure nuove per Ufficio e Partita, uguali tra mouse/touch:

| Viewport | Stage prima → dopo | Margine laterale prima → dopo | Superficie prima → dopo |
|---|---|---|---|
| 640×360 | 640×360 → 640×360 | 0 → 0 | 100% → 100% |
| 800×360 | 640×360 → 800×360 | 80 → 0 | 80% → 100% |
| 844×390 | 693,328×390 → 844×390 | 75,328 → 0 | 82,15% → 100% |
| 960×400 | 711,109×400 → 960×400 | 124,438 circa → 0 | 74,07% → 100% |

Canvas prima/dopo: **328,875×184,984**, **328,875×184,984**, **361,078×203,094**, **378,859×213,094** rispettivamente. Rapporto effettivo **1,77785–1,77790**, compatibile col 16:9 a precisione subpixel; nessuna deformazione o aumento artificiale del campo. La maggiore larghezza interessa il contenitore/pannelli; il canvas rimane limitato dall'altezza. Linee e sprite proporzionati nelle catture proprie.

### Risultati

| Verifica eseguita | Risultato |
|---|---|
| `node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` | **97/97 PASS**, 0 fail, 18,6s circa |
| `node --test oronzo/systems/match-view/*.test.mjs` | **22/22 PASS**, 0 fail |
| Percorsi Chromium standard prima/dopo | **8/8 prima + 8/8 dopo PASS** |
| Font CSS calcolati | Testo e font di tutte le viste campionate coincidono prima/dopo; nessuna riduzione |
| CTA/select senza inset | Minimo campionato **44px visibili**, hit-test/click/tap centrale riusciti |
| Safe area | **NEEDS CHANGES**, 6/8 casi con CTA 42px |
| Portrait → landscape | Avviso e ritorno riusciti nei 16 percorsi |
| Resize viewport | Stage segue il nuovo spazio dopo rimozione inset, h→h+30→h, negli 8 casi supplementari |
| Demo R02 | Ancora centrata 16:9 a 960×400: 711,109×400, x124,438 |
| Homepage / Rapida1985 | Link reali presenti, pagina rapida HTTP200 e canvas presente; file invariati |

Ogni percorso standard ha esercitato: selezione degli **8 avatar**, **20 offerte** e ultima raggiunta mediante gesture/wheel, ingaggio, **5 risposte**, Ufficio, **16 giocatori** e scheda del sedicesimo confrontata con `getRosterPlayer/getTrainingPlayer`, allenamento consultivo senza mutazione, **classifica16** confrontata con l'ordine/ID restituiti da `getStandings`, scroll alla posizione16, **11 titolari/1 GK**, capitano, **22 attori Engine06**, fulltime vero tramite comando QA, **2 risposte** postpartita, settimana2, reload e stato JSON identico dopo load. Provati anche `geography_required` atomico, evento soglia morale0 tramite API09, nuova carriera con precedente save preservato e dialogo di sovrascrittura rifiutato. Nessun nuovo effetto di gameplay o dato geografico inventato.

Screenshot propri esaminati per Avatar, Offerte, Stampa, Ufficio, Rosa, Classifica e Partita alle quattro risoluzioni, con confronti affiancati. Conservati banner e leggibilità alle dimensioni precedenti. **Zero eccezioni JavaScript R03**; resta un **404 opzionale `assets/cutscenes/manifest.json` per partita**, già assente su main. Nessun altro HTTP>=400 nei percorsi standard. Non viene dichiarata console rete priva di errori.

## Evidenze e limiti

[Pacchetto R09-M01 con nuove prove](https://chatgpt.com/library?file_id=libfile_5f366a2250288191873bf523b1402548&account_id=personal): tre harness nuovi, CSS baseline, log Node/browser, metriche standard e safe-area, PNG nativi selezionati e quattro tavole prima/dopo. `safe-results.json` registra esplicitamente le sei violazioni geometriche: la conclusione non dipende dal solo codice d'uscita dello script. README con replica sul preciso HEAD.

**Non verificati:** Android fisico, toolbar Android reale, preview pubblica del branch, 900 secondi continuativi a 1× e una nuova campagna browser pluristagionale. Le safe area/resize sono simulati con CDP/viewport. Il download Playwright era indisponibile; è stato installato Chromium tramite pacchetto npm @sparticuz/chromium153. Nessun ricorso ai risultati passati per colmare il blocco iniziale.

**Handoff al 10/11:** correggere soltanto **R09-M01-1 sulla stessa #48**, aggiornare il QA con gli inset alle quattro viewport e ripresentare per gate. Necessario anche un revisore in chat distinta per attestare piena indipendenza dall'autore. **Nessun merge raccomandato sul presente HEAD**, nessuna modifica a NEXT, nessuna attivazione M02/M03/M04 o revisione di altre PR.
