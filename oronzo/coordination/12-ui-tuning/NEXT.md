# ORONZO — AGENTE 12 · COORDINAMENTO CON NUOVO 07-BIS

**STATO: `ACTIVE_SCREENSHOT_FIXER_NOT_R11_SECTION_OWNER` — 9 novembre 2026.** L'utente ha creato **[Agente 07-bis / `ORONZO-AGENT-07B`](https://github.com/CzekUns/cercax/issues/62)** per completare grafica e azioni delle sottosezioni. File propri del nuovo agente: `oronzo/assets/ui/sections-r11/**`, più innesti minimi e documentati in `career-r03.js/css` durante la sua PR. **Da ora il 12 non deve iniziare una PR autonoma sulla nuova scheda giocatore, allenamento, stadio/tifoseria o «Cosa fare oggi».** Mantieni il ruolo primario di correzioni da screenshot: landing PC, spostamenti, dimensioni, leggibilità e bug visuali richiesti direttamente dall'utente. Puoi lavorare su altre schermate, inclusi fullscreen/camera/ordini solo su incarico esplicito, ma prima controlla la PR attiva 07B; non modificare gli stessi blocchi `career-r03.js/css` in parallelo. Registra nuove note e invia dipendenze all'Agente10; niente merge autonomo. TODO aggiornato: `oronzo/coordination/10-orchestrator/TODO-R11-SEZIONI-UI.md`.

---

## ARCHIVIO NEXT12 PRECEDENTE

# ORONZO — AGENTE 12 · PR #59 MERGED, PROSSIMO PLAYTEST

**STATO: `READY_PLAYTEST_AFTER_S01_MERGE` — 9 novembre 2026.** L'utente ha richiesto merge per provare immediatamente sul telefono. La [PR #59](https://github.com/CzekUns/cercax/pull/59) è **MERGED** su main, con [#52 fullscreen](https://github.com/CzekUns/cercax/pull/52) e [#53 comuni](https://github.com/CzekUns/cercax/pull/53) già integrati. Primo feedback S12-001/S12-002 pubblicato e visibile nella beta: schermata iniziale a due CTA e navigazione inferiore non più onnipresente. **Il feedback Android effettivo e la QA Chromium di #59 mancano tuttora**, non segnare `CONFERMATA_UTENTE` prima della prova.

**Due gap funzionali emersi dal codice main, da gestire su nuova PR UI mirata quando confermati:** (1) durante settimane 31–38 dopo le 30 partite PROM, `getCoachWeekStatus(state)` espone `bye_week` e `advanceMatchday(state,{presidentCatalog,expectedAbsoluteWeek:state.absoluteWeek})` è disponibile, ma `renderHub()` espone solo FORMAZIONE/SALVA e il footer PROSSIMA non compare più. Aggiungere pulsante contestuale **AVANZA SETTIMANA** solo quando è un bye reale, con richiesta idempotente all'adapter; non reintrodurre il menu inferiore e non inventare risultati. (2) `renderMatch()` mostra ancora **TV NON DISP.** e `interact('camera-tv')` emette toast: il renderer05 integrato espone `view.setCameraMode('broadcast')` / `view.setCameraMode('full')`. Collegare il vero cambio camera conservando motore/snapshot e QA 640×360/844×390.

**Poi, su incarichi mirati:** presentare allenamenti, shout individuali, stadio/mercato già esistenti come API, senza simulazioni. Prima missione resta raccogliere screenshot/feedback dal proprietario sulla landing dopo #59; non modificare tutto da solo senza test di regressione. Per ogni fix nuova PR di ciclo, REPORT, Node/Chromium HTTP e 44px. No merge automatico.

---

## ARCHIVIO NEXT12 PRECEDENTE

# ORONZO — AGENTE 12 · S01 PLAYTEST ASSISTITO, SCHERMATA PER SCHERMATA

**STATO: `READY_FOR_USER_SCREEN_FEEDBACK` — 8 novembre 2026.** Incario autorizzato: assistere il proprietario che prova il gioco su smartphone e correggere **posizione, dimensioni e disposizione dei componenti UI** sulla base delle istruzioni fornite durante i test. **Niente Layout Editor**: il sostituto è il registro di annotazioni per schermata `SCREEN-NOTES.md`, conservato nella repo.

## Inizio immediato della nuova chat 12
1. Leggi `IDENTITY.md`, `RUN.md`, `HANDOFF.md`, `SCREEN-NOTES.md` e verifica live le PR. Non creare/modificare codice UI prima di avere la prima nota concreta da parte dell'utente, a meno che l'utente ti chieda direttamente un fix specifico nello stesso messaggio.
2. Prepara una branch **`agent/oronzo-12-ui-playtest-s01` dall'ULTIMO main** soltanto quando arriva la prima modifica implementabile o la prima nota che l'utente chiede di salvare; preferire una PR di ciclo piuttosto che una PR per nota.
3. Scrivi note persistenti su branch in `SCREEN-NOTES.md`. Riporta screenshot e descrizioni, ordine temporale e stato; conserva l'intera lista con nuovi ID `S12-xxx`.
4. Nel primo ciclo **puoi realizzare correzioni visuali mirate** a `career-r03.css` e, esclusivamente se necessario, `career-r03.html`/`career-r03.js` (UI/rendering); QA e REPORT del tuo ramo. Evita cambi al motore, flow, dati, copy, salvataggi e altre applicazioni della repo. Conflitti con PR aperte vanno valutati prima di modificare e potrebbero richiedere aspettare il merge di quei lavori.
5. Esegui prove reali HTTP/Chromium, tutela layout M01, area fullscreen futura e selettore comuni futuro, target touch44px, safe-area, canvas16:9; REPORT e PR aperta senza merge. Non dichiarare test che non hai eseguito.

## Gate di collisione attuale
- [PR #48](https://github.com/CzekUns/cercax/pull/48): **MERGED**; M01 layout landscape full-width, `TERMINA GARA`44px, scroll conferenze; R09C indipendente PASS.
- [PR #52](https://github.com/CzekUns/cercax/pull/52): **OPEN al controllo del 8/11**, fullscreen in `career-r03.html`, `career-r03.css` e modulo `fullscreen-r03.js`. Non reinserire il pulsante né cambiare la barra assumendo che non arriverà.
- [PR #53](https://github.com/CzekUns/cercax/pull/53): **OPEN al controllo del 8/11**, import 500 comuni attuali, `world.js`, dati, `career-r03.js`. Non creare un altro selettore origine su main o riscrivere il sistema dati.
- [PR #51](https://github.com/CzekUns/cercax/pull/51) è REPORT di audit R09C e non cambia il gameplay.
- Il live-check all'apertura prevale sempre sulle righe sopra.

## Cosa fare per primo
Aspettare una schermata/screenshot e la prima istruzione del proprietario. Esempio: «Nella schermata **UFFICIO**, sposta il riquadro **CAMPIONATO** più a sinistra e riduci il titolo». Registra e applica sul ramo se chiaro. Se l'utente indica soltanto «appunta», registra senza alterare il codice.

**Non avviare il Layout Studio. Nessun merge autonomo.**
