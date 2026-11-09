# ORONZO — Agente 00 · audit mirato PR #63

**Verdetto: NEEDS CHANGES — non certificata per il prossimo playtest completo.**

Data: 9 novembre 2026. PR aperta e non mergiata. HEAD verificato e ricontrollato live: `6eb647894f79b38bc26915f016d245b7ee25bc85`. Base produttiva `84f1b0be735b7f52a55211a2b9739040617fd488`; main locale aggiornato `1351946d421fbc7ec84ee10f9260267a932efaa1` aggiunge soltanto istruzioni di coordinamento. `git merge-tree --write-tree origin/main HEAD` termina senza conflitti; nessun merge/ref modificato. Nessuna modifica al codice produttivo.

## Rilievi e correzioni

### R11-QA-01 · P2 · piano salvato diverso dai controlli visualizzati — verificato, introdotto dalla PR

File: `oronzo/assets/ui/sections-r11/sections.js:90–110`; `career-r03.js:37,61,161`.

Riproduzione nel gioco HTTP: selezionare RECUPERO, intensità 73, confermare, ricaricare la pagina, CARICA PARTITA, ALLENAMENTO. Il ledger conserva `{plan:'rest', intensity:73, absoluteWeek:1}` e il riepilogo dice RECUPERO 73%, mentre il pulsante evidenziato e disabilitato dice EQUILIBRATO e lo slider disabilitato mostra 50. Riprodotto in tutte le otto configurazioni. Nessuna perdita del ledger in questa prova iniziale.

**07B:** derivare piano evidenziato, output e slider da `trainingStatus(ui).selected` quando presente, riservando lo stato locale alla bozza non confermata. Aggiungere verifica di save/reload sul rendering reale. Screenshot `*-training-reloaded.png`, record `reloadTraining` in `browser-results.json`.

### R11-QA-02 · P1 · salvataggio standard lungo eccede localStorage e perde l'avanzamento — verificato, dipendenza preesistente

File: `oronzo/systems/career/save.js:105–111`, `oronzo/assets/ui/career-r03.js:47–59,256–262,282–286`.

Carriera standard, catalogo comuni reale, seed 1979, club PROM-13: generate 30 partite autentiche con Engine06, conferenze e `advanceMatchday`, ottenendo settimana 31 senza alterare il contatore. Lo stato serializzato occupa circa 4,1 milioni di caratteri. Su origine HTTP pulita il primo salvataggio A entra (`4125983` caratteri), il secondo slot supera la quota nativa del browser. Anche con dati preesistenti il tentativo genera `QuotaExceededError`.

Nelle otto prove browser la UI avanza correttamente 31→39 e arriva a fine stagione; i salvataggi silenziosi falliscono. Reload e CARICA PARTITA riportano **alla settimana 31**. Nessuna falsa partita o conferenza del mister; vengono correttamente risolte le gare delle altre divisioni.

Il salvataggio e il catch silenzioso erano già su main: non attribuire la causa di quota a 07B. Tuttavia il percorso nuovo non può essere certificato con persistenza. La nuova conferma allenamento traduce qualunque `save()` falso nel messaggio «salvataggio precedente protetto», anche quando la causa è quota: osservato con TECNICA 61% alla settimana 31.

**07 + responsabile salvataggi:** rendere il formato/provider persistente compatibile con una carriera standard e i due slot, preservando recuperabilità e atomicità; provare su localStorage reale, non soltanto Map senza quota. **07B:** distinguere errore di salvataggio da protezione volontaria, mostrare esplicitamente avanzamento solo in memoria quando il salvataggio fallisce; non comunicare successo persistente. Non risolvere cancellando automaticamente il vecchio slot.

### Stadio · BLOCKED_DEPENDENCY confermata

STADIO/TIFOSI/GIORNALI sono navigabili. La carriera non espone dati stadio operativi; compare DATI STADIO NON DISPONIBILI. Nessuna biglietteria, affluenza o transazione economica certificata. L'handoff `sections-r11/HANDOFF-07-09.md` rimane necessario. La rappresentazione dello stadio è CSS, non un nuovo asset PNG rifinito: nessuna certificazione di completamento artistico dello stadio. Questo limite dichiarato, da solo, consentirebbe una beta UI condizionata; i due rilievi sopra impediscono ora `R11-01_UI_PASS_STADIUM_BLOCKED`.

## Prove effettive

| Controllo | Risultato |
| --- | --- |
| `node --check oronzo/assets/ui/career-r03.js` e `sections-r11/sections.js` | PASS |
| `node --test oronzo/assets/ui/sections-r11/sections-r11.test.mjs oronzo/assets/ui/qa/ui12-landing-nav.test.cjs` | 24/24 PASS |
| `node --test oronzo/app/flow/tests/m1-contract.test.mjs oronzo/app/flow/tests/m1-live.test.mjs oronzo/systems/attributes/tests/attributes-m1.test.js oronzo/systems/coach-club/management-r10.test.js` | 40/40 PASS, nessuno skip |
| Prova indipendente 5 piani × intensità 0 e 100 | 10/10 PASS: selezione una volta, nessun delta anticipato, save/load, effetti fisici/tecnici e incidenti confrontati con output autentico 08, payroll una volta e retry stale senza mutazioni |
| Chromium HTTP autentico | Chrome Headless Shell 151.0.7922.34; 8 percorsi completi, 232 checkpoint, 1402 misure target; 8 riproduzioni del difetto controlli, nessuna ulteriore violazione geometrica misurata |
| Viewport e safe-area | 640×360, 800×360, 844×390, 960×400; touch; insets zero oppure left24/right12/bottom16 tramite CDP |
| Navigazione | Entry con PC → 8 avatar → 20 offerte → presidente → 5 domande stampa → hub → campionato/presidente/rosa/scheda/allenamento/tifoseria/agenda; ritorni, reload e salvataggi iniziali provati |
| Agenda | `match_pending` non espone advance; da agenda e campionato compare advance su bye; UI 31–38 fino a fine stagione, nessun nuovo risultato Engine06 o conferenza del mister |
| Allenamento nel browser | Tutti i cinque pulsanti attivabili; RECUPERO 73% salvato alla settimana1 senza delta immediati; ulteriore TECNICA61% alla settimana31 applicata al passaggio32, report reale fatica70,4/incidenti0 e cambi misurati sui giocatori |
| Scheda e scroll | ID/nome dalla rosa autentica; nessun ritratto inventato quando mancano visual/kit. Gesture touch a640×360: colonna identità scrollTop0→124, attributi0→313; ultima riga della rosa raggiungibile |
| PNG reali | PC e training.png decodificati (training1280×720). Partita aperta dalla UI con22 giocatori, caricamento HTTP di idle/run/kick/tackle/keeper, relative maschere e ball.png; screenshot match inclusi |
| UI12/fullscreen | Landing2 CTA, footer nascosto, primo campionato/presidente e stampa preservati. Fullscreen API entra/esce tramite tap a844×390. Nessun pageerror o errore runtime rilevato |

La sola richiesta HTTP404 osservata è `oronzo/assets/cutscenes/manifest.json`, fallback già esistente; non riaperto l'audit cutscene. Le misure touch riguardano controlli visibili e, nelle liste, elementi portati in vista: non si pretende che tutte le righe siano simultaneamente visibili. Nessuna prova Android fisico. Nessun nuovo audit R10 generale o doppia stagione rieseguito.

## Evidenze e limiti

Archivio `ORONZO-PR63-audit-evidenze.zip`: screenshot, `browser-results.json`, `extra-browser.json`, `training-native.json`, log Node, harness indipendenti e stato autentico settimana31. Il file `pr63-native-audit.mjs` va collocato in `oronzo/coordination/coerentizzatore/` per risolverne gli import relativi; adattare il percorso `out` negli harness. Il browser harness avvia il proprio server HTTP dal checkout e non usa route mock o fixture HTML. Lo stato settimana31 è prodotto da partite reali, poi caricato per raggiungere rapidamente il caso mirato.

## Richieste all'orchestratore

1. Inviare a07B R11-QA-01 e la gestione esplicita del fallimento save di R11-QA-02 nella stessa PR63.
2. Assegnare al proprietario07/salvataggi il problema di quota con prova Chromium standard e mantenimento del vecchio save; limitare la successiva verifica a questi fix.
3. Mantenere il blocco stadio07/09 esplicito. Nessun merge effettuato o autorizzato da questo rapporto.

Evidenze conservate: [ORONZO-PR63-audit-evidenze.zip](https://chatgpt.com/library?file_id=libfile_dee17ea401d881919637ffd65f194ce1&account_id=personal).
