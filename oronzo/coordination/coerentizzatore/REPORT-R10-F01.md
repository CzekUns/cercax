# ORONZO — REPORT-R10-F01 · PR #52 fullscreen

**VERDETTO: PASS.** Nessun blocco tecnico riscontrato. Merge raccomandabile sull'HEAD esatto, dopo autorizzazione dell'utente. **Nessun merge su GitHub effettuato.**

- PR [#52](https://github.com/CzekUns/cercax/pull/52), HEAD **`d266ad1740ab330946ab7cccccb6928c30c55a29`**.
- Data: 8 novembre 2026, Europe/Rome. Revisore00, indipendente dall'implementazione.
- Letti REQUEST, PROTOCOL, registry e ROADMAP-R10 dall'ultimo main; diff, codice e QA della PR. Le dichiarazioni dell'autore non sono usate come certificazione.

## Prove e risultati

| Verifica indipendente | Esito |
|---|---|
| Suite Node preesistente119 +4 nuovi test fullscreen | **123/123 PASS**,0 fail |
| PR52 da sola,4 viewport ×2 inset ×2 input | **16/16 percorsi completi PASS** |
| PR52+PR53 insieme, stessa matrice | **16/16 percorsi completi PASS** |
| Misure supplementari dentro fullscreen attivo | **16/16 PR52 +16/16 combinazione PASS** |
| Ingresso/uscita nativi da inizio, conferenze e partita | PASS; `document.fullscreenElement`, aria e testo sincronizzati |
| Fullscreen negato da Permissions Policy reale, mouse/touch | **2/2 PASS**, feedback comprensibile, aria=false |
| Uscita nativa esterna al pulsante | **2/2 PASS**, evento fullscreenchange risincronizza l'UI |
| Save/load e stato carriera durante i toggle | Stato invariato dai toggle; JSON identico dopo caricamento |
| Node con entrambe le PR, incluse le nuove suite | **128/128 PASS**,0 fail |

`#fullscreen-toggle` rimane attivo durante la partita. Click/tap chiamano la Fullscreen API del browser; non viene sostituita con una classe che simula lo schermo intero. Ogni ingresso/uscita è verificato sullo stato nativo, su `aria-pressed` e sulla conservazione del JSON di carriera.

Misure effettuate **anche mentre il fullscreen è attivo**, con intersezione degli antenati: pulsante fullscreen e controlli partita **≥44px visibili e attivi**; TERMINA GARA QA conserva **44px** nelle16 configurazioni PR52. Lo stesso controllo QA non compare nelle carriere normali della combinazione con PR53: queste raggiungono comunque il vero fulltime.

| Viewport | Stage senza inset | Stage con inset | Campo |
|---|---|---|---|
| 640×360 | 640×360 | 604×344, x24/y0 | 16:9 |
| 800×360 | 800×360 | 764×344, x24/y0 | 16:9 |
| 844×390 | 844×390 | 808×374, x24/y0 | 16:9 |
| 960×400 | 960×400 | 924×384, x24/y0 | 16:9 |

Le tre risposte di ciascuna delle7 domande vengono raggiunte mediante scroll e misurate prima dell'attivazione della terza. Tutte le superfici verificate conservano almeno44px; non viene affermato che siano tutte visibili simultaneamente. Font e proporzioni preservati; il sesto controllo ridistribuisce la larghezza della navigazione senza sottrarre altezza al campo. Screenshot propri ispezionati alle quattro risoluzioni.

Il test di rifiuto usa un vero header `Permissions-Policy: fullscreen=()` sullo stesso runtime; nessuna API falsa. Il caso API realmente assente è coperto anche da un ulteriore unit test del revisore sul modulo originale (1/1 PASS, VM isolata dichiarata), distinto dalle prove browser: il test dell'autore denominato «missing API» imposta soltanto fullscreenEnabled=false. Non viene spacciato per prova Safari/Android. Nel Chromium headless il simbolo Unicode può essere reso dal font con un glifo sostitutivo; l'etichetta testuale completa e accessibile rimane presente. Non è un blocco di azionabilità.

## Metodo e compatibilità

Main documentale: `89a128066525333558899aa25c0e96ce3e123d0c`. Checkout Git veri ottenuti con fetch delle due PR e worktree separati. Nessuna ricostruzione HTML/CSS, intercettazione delle risposte del gioco o sostituzione di motore/storage. Server HTTP statici servono i file originali; i byte caricati sono confrontati con gli indici Git.

Combinazione locale di prova: main + #52 + #53, senza conflitti, **senza commit né push**. Albero Git `3749cc958f86c4bce4bceab7e4bf1e55fae9e227`; nessuna integrazione su GitHub. La combinazione conserva esattamente i blob produttivi delle due PR. Ambiente: Node24.22.1, Chromium149.0.7827.0 headless, Playwright, DPR1, it-IT; mouse o touch mobile emulato. Viewport640×360,800×360,844×390,960×400; inset assenti oppure top0/left24/right12/bottom16.

Gli harness sono del revisore. I controlli vengono intersecati con viewport e antenati overflow; hit-test e click/tap a coordinate, scroll wheel/touchStart/Move/End. Per controlli più alti di44px si verifica anche una fascia centrale realmente attiva di44px; per risposte/CTA da44px è verificata l'intera altezza. Nessun locator autoscroll.

Prove comuni: avatar,20 offerte, ingaggio/presidente,5 domande iniziali, rosa e allenamento16, classifica16, XI11/1GK,22 attori PNG reali, partita Engine06,2 domande finali, settimana2, morale, bilanci, save/reload/load JSON identico, evento controllato API09 per morale0, game over, nuova carriera e protezione del vecchio salvataggio.

**Limiti:** Android fisico, toolbar/cutout hardware e anteprima pubblica non verificati. Non attesi900 secondi reali a1×. Nelle carriere con comuni reali la partita è completata con **tempo browser avanzato di116s a8×** tramite Playwright Clock: RAF, loop, Engine06, gol e fulltime sono quelli autentici; il comando TERMINA GARA QA è assente e non viene usato. Il clock controllato accelera l'esecuzione, non produce risultati finti. La suite Node include due stagioni/104 club/76 periodi; non è una nuova campagna browser pluristagionale.

Con entrambe le PR: nessuna doppia applicazione degli effetti d'ingaggio o degli stipendi, risultati coerenti coi gol e la classifica, fonti/identità persistenti. I toggle fullscreen non cambiano morale, mondo o salvataggio. Zero pageerror nei percorsi completati; resta il404 opzionale del manifest cutscene già assente, senza altri HTTP≥400 nel percorso R03.

## Evidenze e conclusione

[Evidenze R10: harness, screenshot nativi, log, risultati e SHA](https://chatgpt.com/library?file_id=libfile_be1df23835c081918e856744fe71ff1c&account_id=personal). `verified-summary.json`, `browser-results.json`, `fullscreen-geometry-summary.json`, `fullscreen-policy-results.json`, `checkout-proof.json`; comandi nel README.

**Raccomandazione:** #52 pronta per la valutazione del merge su questo HEAD. Compatibilità con #53 verificata sull'albero indicato; nessun via libera per altre PR o per l'intero rilascio M1. Nessun fix di codice richiesto e nessun nuovo ciclo aperto.
