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
