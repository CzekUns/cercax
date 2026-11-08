# ORONZO · Handoff operativo permanente all'Agente 12

**Data:** 8 novembre 2026 (Europe/Rome). **Repository:** `CzekUns/cercax`, main. **Missione:** accompagnare il proprietario nelle correzioni dell'interfaccia su smartphone **senza Layout Editor**. Si annota **schermata per schermata** in `SCREEN-NOTES.md`, poi si modifica direttamente il CSS / rendering della UI su branch/PR. Lo scopo è dare all'utente un interlocutore che conosca esattamente **dove mettere le mani**, senza fargli modificare manualmente file o coordinate.

## Decisione del proprietario
«La chat deve comunque sapere dove mettere le mani ma si occuperà di fare le modifiche per supportarmi nelle correzioni in fase di test. Principalmente devo spostare le cose dell'UI. Invece del Layout Editor voglio appuntare le modifiche schermata per schermata.»

Traduzione operativa: ricevi screenshot di una schermata, registra cosa non va e la destinazione desiderata in `SCREEN-NOTES.md`; se chiede di correggere, modifica in GitHub sul tuo branch e verifica il runtime. **Nessun prototipo di editor, pannello drag/resizing, gestione di coordinate in gioco, schermata di configurazione riservata**. L'utente può chiedere di «appuntare» soltanto, senza eseguire ancora la patch.

## Stato tecnico verificato all'handoff

### Integrato
- [PR #33](https://github.com/CzekUns/cercax/pull/33) e [PR #43](https://github.com/CzekUns/cercax/pull/43): grafica e runtime carriera 1979 reali, sviluppati dallo storico Agente03.
- [PR #48](https://github.com/CzekUns/cercax/pull/48): **MERGED** (`1bb8815b967dc4171fc644713918ad97f1cd95fb`), audit indipendente R09C **PASS** su HEAD `8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`: stage landscape a larghezza piena, area safe, pulsante `TERMINA GARA` **44px**, conferenza con scorrimento delle risposte tutte raggiungibili. 119/119 Node e 16/16 flussi Chromium HTTP, 336/336 risposte +42 prove extra sul testo lungo. Prova fisica Android non completata nell'audit.

### PR aperte al controllo (controllare di nuovo all'avvio)
- [#51](https://github.com/CzekUns/cercax/pull/51) = solo documentazione audit R09C, **OPEN**, non richiede correzioni UI.
- [#52](https://github.com/CzekUns/cercax/pull/52) = **F01 fullscreen**, branch `feature/oronzo-fullscreen-f01-direct`, **OPEN e NON MERGED**, HEAD `d266ad1740ab330946ab7cccccb6928c30c55a29`. Tocca `career-r03.html`, `career-r03.css`, aggiunge `fullscreen-r03.js` e QA. Le prove sono solo isolate, **non audit E2E del gioco**; non assumere sia già nella versione pubblica.
- [#53](https://github.com/CzekUns/cercax/pull/53) = **D01 500 comuni contemporanei**, branch `feature/oronzo-municipalities-d01-direct`, **OPEN e NON MERGED**, HEAD `9ec2baa6dc0c06b3d6fff432218f19be17ee77c0`. Tocca `career-r03.js`, `oronzo/systems/career/world.js`, catalogo `oronzo/data/world/municipalities-m1.json` e QA. Catalogo da ricerca [#40](https://github.com/CzekUns/cercax/pull/40):500 codici ISTAT distinti, 19 fonti, provincia e anno demografico ignoti; identità comunali contemporanee, **non 1979**. Non assumere sia già sul sito. Non modificare flow/dati in un ciclo UI.
- La ricerca [#40](https://github.com/CzekUns/cercax/pull/40) prosegue indipendentemente. Nessun merge implicito di #40/#51/#52/#53.

### URL e repository
- **Sito previsto GitHub Pages:** `https://czekuns.github.io/cercax/oronzo/assets/ui/career-r03.html`. Va controllato in browser (non dichiarare verificato solo perché nel README). È `main`, non una preview automatica della PR.
- Runtime carriera reale: `oronzo/assets/ui/career-r03.html` → carica `demo-v02.css`, `career-r03.css`, `career-r03.js`; screenshot/assets in `oronzo/assets/ui/`.
- UI nel JS: `renderEntry`, `renderAvatar`, `renderOffers`, `renderPresident`, `renderPress`, `renderHub`, `renderPlayer`, `renderFormation`, `renderMatch`, `renderPost`, `renderSeason`, `renderUnemployed`, `renderGameover`; la funzione `render()` mappa lo stato della carriera alla schermata. **Non riscrivere questi componenti solo per cambiare una posizione**.
- Stile base: `oronzo/assets/ui/demo-v02.css` (shared/storico; evitare modifiche). Override runtime: `career-r03.css` (punto di lavoro principale per UI).
- Interfacce dati esclusivamente in lettura per12: `oronzo/app/flow/controller.js` (07), `oronzo/systems/match-view/` (05), `oronzo/systems/match-engine/` (06), `oronzo/systems/coach-club/` (09). **Non simulare dati per sembrare funzionale.**
- Kit storico per capire lo stile: `oronzo/coordination/03-ui/{IDENTITY,RUN,NEXT,REPORT}.md`, `oronzo/coordination/11-mobile-ui/{IDENTITY,RUN,NEXT}.md`, `oronzo/assets/ui/INTEGRATION-R02.md`.
- Spec di prodotto: `oronzo/coordination/GAME-VISION-v02.md`: carriera dal1979; avatar/morale/20 offerte/conferenze; full campo + camera TV future, 1×≈15min. Non modificare queste regole facendo tuning UI.

## Procedura concreta per ogni screenshot
1. Dai nome alla schermata e al componente: es. `match`, punteggio `.runtime-score`; conferenza `.runtime-answers`; offerte `.runtime-offer`.
2. Scrivi `S12-XXX` in `SCREEN-NOTES.md`, con parole del proprietario, viewport e screenshot. Se una posizione è ambiguamente indicata («qui»), usa l'immagine ricevuta; chiedi un solo dettaglio solo se impossibile dedurre destinazione.
3. Leggi CSS/HTML/JS relativi in **HEAD di main** e diff delle PR aperte, definisci patch minima e quali altre schermate riusano il selettore. Privilegia CSS scoped alla vista; se serve un hook, aggiungi classe semantica senza cambiare handler gameplay.
4. Crea/aggiorna il branch UI12 dall'ultimo main. Conserva modifiche precedenti non ancora mergiate sulla stessa PR e aggiungi nuovi feedback al registro. Evita di basarti sui branch della #52 o #53 (potrebbero cambiare prima del merge).
5. Esegui il gioco **autentico** via server HTTP locale/Chromium; verifica viewport tipici 640×360, 800×360, 844×390, 960×400, mouse/touch, safe-area left24/right12/bottom16, orientamento, clipboard/salvataggi se rilevanti. Target44px effettivi, niente clipping, canvas16:9, pulsante TERMINA e scroll conferenze intatti. Test Node97+22 se presente codice UI critico; segnala prove non eseguite. Valuta fisico Android con istruzioni al proprietario, non dichiarare test che non puoi fare.
6. Consegna screenshot prima/dopo, REPORT e PR senza merge. L'Agente00 è responsabile del gate indipendente; l'utente autorizza ogni merge. A seguito di feedback ulteriore, prosegui dalla stessa PR senza perdere note.

## Le schermate vanno annotate, non tutte ridisegnate insieme
Conserva una tabella cumulativa in `SCREEN-NOTES.md`. Ordina e risolvi i ticket per schermata. Non applicare automaticamente ogni suggerimento agli elementi simili di altre schermate. Quando il proprietario dice «appunta per dopo», registra e basta; quando dice «sposta», puoi realizzare la modifica in PR. Se vi è una regressione, non cancellare la nota: registra esito e versione correttiva.

## Handoff se una chat Work diventa sola lettura
Tutto il lavoro che conta deve stare in GitHub: branch, PR, `SCREEN-NOTES.md`, `REPORT.md`, screenshot QA. Una chat nuova con lo stesso prompt `RUN.md` deve poter riprendere senza ricostruire note perse. Il lavoro non ancora pushato è non verificato. **Nessuna promessa di lavorare in background.**
