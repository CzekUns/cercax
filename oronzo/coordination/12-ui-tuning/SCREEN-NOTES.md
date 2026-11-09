# ORONZO · Registro richieste UI da playtest — Agente 12

**Regola:** una richiesta per ID e schermata; conserva tutta la cronologia in GitHub. Questo Markdown **sostituisce il Layout Editor** nella fase di test: l'utente descrive, eventualmente annota uno screenshot, l'Agente12 registra e cambia CSS/HTML/JS di presentazione su PR dopo aver localizzato il componente.

## Registro sintetico

| ID | Schermata | Modifica richiesta | Viewport / dispositivo | Stato | PR / commit |
| --- | --- | --- | --- | --- | --- |
| S12-001 | `entry` — apertura, revisione richiesta | Immagine computer a sinistra, due CTA a destra, zero testo introduttivo | Android landscape, risoluzione da verificare | `IMPLEMENTATA_DA_VERIFICARE` | [#59](https://github.com/CzekUns/cercax/pull/59) + S02 |
| S12-002 | Tutte le viste — navigazione inferiore | Eliminare il menu inferiore onnipresente; mantenere la navigazione in-contesto e futuro fullscreen accessibile senza ripristinare il menu | Android landscape, risoluzione da verificare | `IMPLEMENTATA_DA_VERIFICARE` | [PR #59](https://github.com/CzekUns/cercax/pull/59) |
| S12-003 | `hub` → sottosezioni | Aprire Campionato, Rosa, Allenamento, Tifoseria e Presidente in viste dedicate, senza anteprima a destra | Android landscape, risoluzione da verificare | `IMPLEMENTATA_DA_VERIFICARE` | Branch `agent/oronzo-12-ui-playtest-s02` |

**Stati:** `RICHIESTA` → `IMPLEMENTATA_DA_VERIFICARE` → `IMPLEMENTATA_DA_VERIFICARE` → `REVISIONE_00` → `CONFERMATA_UTENTE`; oppure `BLOCCATA` / `DIPENDENZA`. Non segnare una nota come corretta senza prova sufficiente.

## Richieste utente effettive · 9 novembre 2026

**Implementazione di sviluppo pubblicata nella PR #59 (DRAFT), senza merge.** Non è ancora stata osservata una schermata Android dopo la modifica. Screenshot in repository: nessuno (non ancora disponibile).

### S12-001 — `entry` · Inizio a tutta larghezza

- **Stato:** `IMPLEMENTATA_DA_VERIFICARE`
- **Messaggio utente:** «Anzitutto la pagina iniziale dovrebbe essere bella larga e avere solo nuova partita e carica partita.»
- **Schermata / navigazione:** apertura della carriera, `renderEntry()`; qui si vedono anche `.entry-panel`, `.entry-brief`, `.runtime-image` e `.entry-actions`.
- **Viewport:** Android landscape; il proprietario non ha fornito ancora le dimensioni.
- **Screenshot:** feedback testuale in chat; nessuno screenshot fornito o salvato nella repository.
- **Com'è ora:** testo introduttivo e pannello decorativo dividono la larghezza disponibile; i due pulsanti sono confinati in un pannello.
- **Come deve diventare:** corpo iniziale largo quanto l'area utile, con **soli due comandi centrali**, grandi e leggibili: NUOVA PARTITA e CARICA PARTITA. Il marchio nella barra alta rimane; nessuna nuova meccanica.
- **Componenti confermati:** `renderEntry()`, `#ui-screen`, `.runtime-entry`, `.runtime-entry-actions` (questi ultimi classi locali introdotte con il fix).
- **Impatto e vincoli:** rimuovere testo introduttivo e immagine esclusivamente da entry; preservare flusso `start/load`, safe-area, 44px e stile rétro.
- **File modificati:** `oronzo/assets/ui/career-r03.js`, `oronzo/assets/ui/career-r03.css`; test in `oronzo/assets/ui/qa/ui12-landing-nav.test.cjs`.
- **PR / commit:** [PR #59](https://github.com/CzekUns/cercax/pull/59), JS `4f3cdb6`, CSS `9fda3b2`, test `e7b3f0b`; report nel branch.
- **Prove:** parser V8 sul sorgente JS completo (senza import ESM) PASS; 47/47 asserzioni isolate V8 e 5/5 test QA sorgente PASS. **NON ESEGUITI** Chromium HTTP/Android e geometria touch effettiva. Il proprietario deve confermare l'effetto visivo sul telefono.
- **Esito utente:** da confermare.

### S12-002 — `entry` e altre viste · Menu inferiore ridondante

- **Stato:** `IMPLEMENTATA_DA_VERIFICARE`
- **Messaggio utente:** «Il menù navigaz inferiore è onnipresente in tutte le schermate inutilmente».
- **Schermata / navigazione:** `#runtime-nav.quick-nav`, condiviso tra tutte le 13 schermate e montato in `career-r03.html`; `render()` e le viste hanno già CTA proprie.
- **Viewport:** Android landscape; dimensioni da verificare.
- **Screenshot:** feedback testuale in chat; nessuno screenshot salvato nella repository.
- **Com'è ora:** footer permanente INIZIO/SALVA/UFFICIO/PROSSIMA/RAPIDA 1985, spesso duplicato o non pertinente; sottrae 50px alle viste.
- **Come deve diventare:** non mostrare la navigazione inferiore nelle schermate; lasciare operative le CTA contestuali esistenti (es. UFFICIO ha SALVA e FORMAZIONE, AVATAR ha INDIETRO, GAME OVER ha NUOVA/CARICA, post-partita ha AVANZA). Il comando Fullscreen della PR #52, se presente dopo l'integrazione, deve restare autonomamente raggiungibile nella barra superiore e **non** riaprire il menu.
- **Componenti confermati:** `#runtime-nav`, `render()`, `gamebar`. Non eliminare il markup su branch in collisione con PR #52.
- **Impatto e vincoli:** preservare i percorsi, save/load, fullscreen nativo, layout portrait/landscape, 44px e canvas16:9. Non modificare logiche del controller.
- **File modificati:** `oronzo/assets/ui/career-r03.js` e `career-r03.css`, senza modifica HTML concorrente alla PR #52; test isolati in `oronzo/assets/ui/qa/ui12-landing-nav.test.cjs`.
- **Dipendenza:** PR #52 (fullscreen ancora aperta), quindi verificare anche la combinazione prima dell'approvazione definitiva.
- **PR / commit:** [PR #59](https://github.com/CzekUns/cercax/pull/59), JS `4f3cdb6`, CSS `9fda3b2`, test `e7b3f0b`; report nel branch.
- **Prove:** V8 isolamento di `render()` su 13/13 viste, footer nascosto e spostamento dello stesso elemento fullscreen PASS; test QA 5/5 PASS (isolati). **NON ESEGUITI** QA HTTP/Chromium e verifica su dispositivo reale dopo PR #52.
- **Esito utente:** da confermare.

## Feedback Android successivo — 9 novembre 2026

### Revisione S12-001 — Immagine d'ufficio ripristinata

- **Stato:** `IMPLEMENTATA_DA_VERIFICARE`, a seguito del feedback successivo al merge [#59](https://github.com/CzekUns/cercax/pull/59).
- **Messaggio utente:** «Ci sta anche se a me comunque piaceva quell'immagine con il computer messa all'avvio, con i due tasti a dx, quella la puoi ripristinare.»
- **Nuova disposizione richiesta:** spazio iniziale largo; immagine dell'ufficio con computer sulla **sinistra** (asset già esistente `office-desk-v02.png`); **NUOVA PARTITA** e **CARICA PARTITA** in colonna sulla **destra**. Nessun testo introduttivo; barra superiore e fullscreen esistenti.
- **Componente reale:** `renderEntry()`; markup `.runtime-entry`, `.runtime-entry-visual`, `.runtime-entry-actions`; CSS mirato a `data-screen=entry`.
- **Viewport e screenshot:** Android in orizzontale, dimensioni non indicate; feedback testuale, screenshot non presente nel repository.
- **Ambito:** solo `career-r03.js` e `career-r03.css`, non spostare elementi di altre viste.
- **Verifiche:** parser V8 su sorgente del branch PASS; 8/8 test QA isolati PASS. Chromium HTTP e Android fisico NON ESEGUITI.
- **PR / commit / esito:** sorgente JS commit `ead07a9`, CSS `d7b0d9e`, QA `8ce916b` nel branch S02; PR da collegare, senza merge autonomo.

### S12-003 — Ufficio → schermate dedicate

- **Stato:** `IMPLEMENTATA_DA_VERIFICARE`.
- **Messaggio utente:** «Poi i vari menù rosa, allenamento, campionato, presidente etc mi aspettavo che portassero ad una sottosezione, non che utilizzassero la Sezione a destra per fare vedere velocemente la sezione».
- **Schermata e percorso:** `hub` → `hub-section`, con cinque voci: CAMPIONATO, ROSA, ALLENAMENTO, TIFOSERIA e PRESIDENTE.
- **Com'è ora:** `renderHub()` presenta a sinistra la scrivania e a destra i contenuti immediatamente aggiornati dal pulsante `data-action="section"`; il menu resta sempre visibile.
- **Come deve diventare:** l'UFFICIO contiene solo le cinque scelte e i comandi propri; la scelta apre un pannello **dedicato a larghezza piena**. Un pulsante almeno 44px torna all'Ufficio. Elenchi e classifica scorrono, la scheda giocatore ritorna al corretto elenco (Rosa oppure Allenamento), mentre SALVA e FORMAZIONE rimangono operative. Non inventare allenamenti o funzioni gestionali non disponibili.
- **Componenti reali:** `renderHub()`, `playerRow()`, `renderPlayer()`, `interact('section'/'hub'/'back-rosa'/'back-training')`, `#ui-screen`, `.menu-cards`, `.runtime-table`, `.runtime-roster-list`.
- **Viewport e screenshot:** Android landscape, dimensioni non indicate; feedback testuale in chat, nessun file screenshot in QA.
- **Vincoli:** mantenere safe area, UI retro, touch ≥44px, zero interventi al motore o alle API; rispettare schermo intero e assenza footer S12-002.
- **Stato prove / PR:** 8/8 test QA V8 isolati PASS; DOM reale Chromium HTTP, touch e Android NON ESEGUITI; PR S02 da collegare; verifiche da ripetere post feedback utente.

## Scheda richiesta (duplica per ogni ID `S12-xxx`)

### S12-XXX — [SCHERMATA] · [ELEMENTO]

- **Stato:** `RICHIESTA`
- **Messaggio utente:** [testo fedele o riassunto non ambiguo]
- **Schermata / navigazione:** [es. NUOVA PARTITA → AVATAR]
- **Viewport:** [es. 800×360, smartphone Android landscape; inset/barre browser presenti?]
- **Screenshot:** [percorso file QA o screenshot in chat non salvato, senza inventare link]
- **Com'è ora:** [posizione, dimensione, problema, misura se rilevata]
- **Come deve diventare:** [posizione/dimensioni/spaziatura/stile chiesti; non aggiungere supposizioni non approvate]
- **Componente e selector confermati:** [es. renderMatch() / .runtime-score, dopo lettura del sorgente]
- **Impatto e vincoli:** [44px target; safe-area; campo16:9; altro]
- **File previsti / modificati:** [nomi precisi]
- **PR / commit:** [link]
- **Prove:** [HTTP Chromium reali o NON ESEGUITE; misure/screenshot]
- **Esito utente:** [da confermare]

## Mappa schermate corrente (codice su `main` all'avvio)

| Codice schermata | Nome giocatore | Punto di rendering in `oronzo/assets/ui/career-r03.js` |
| --- | --- | --- |
| `entry` | Inizio / Nuova o Carica | `renderEntry()` |
| `avatar` | Scelta mister / origine | `renderAvatar()` |
| `offers` | 20 offerte | `renderOffers()` |
| `president` | Presidente / presentazione | `renderPresident()` |
| `press` | Conferenza iniziale e postpartita | `renderPress()` |
| `hub` | Ufficio / menu carriera | `renderHub()` |
| `player` | Rosa / scheda giocatore / allenamento | `renderPlayer()` e sezioni `renderHub()` |
| `formation` | Formazione / panchina | `renderFormation()` |
| `match` | Partita / campo e comandi | `renderMatch()` |
| `post` | Risultato finale | `renderPost()` |
| `season` | Fine stagione | `renderSeason()` |
| `unemployed` | Senza panchina | `renderUnemployed()` |
| `gameover` | Game over morale 0 | `renderGameover()` |

**Contenitori e selettori principali:** `.site`, `#oronzo-r03`, `.gamebar`, `#ui-screen`, `.quick-nav`, `.screen-heading`, `.runtime-split`, `.panel`, `.runtime-controls`, `.runtime-avatar-fields`, `.runtime-offer`, `.runtime-roster`, `.runtime-answers`, `.runtime-score`, `.runtime-pitch`, `.runtime-match-panel`, `[data-action="finish-qa"]`. Controlla ogni volta il DOM e CSS effettivamente caricati: mappa orientativa, non sostituisce il debug.

## Indicazioni di stile e regressioni non negoziabili

- Smartphone **landscape**; stage a piena larghezza utile e padding safe-area.
- Canvas della partita mantiene **16:9** (niente stretch).
- Touch target **almeno 44 CSS px realmente visibili e cliccabili/toccabili**, dopo clipping e scroll necessario. In conferenza le risposte possono scorrere e devono poter essere raggiunte per intero.
- Proteggere font leggibili, status toast, etichetta geografica e separazione visiva dei pannelli; non usare semplicemente `overflow:hidden` per occultare un tasto.
- Non alterare motore, morale, dati o salvataggi per un cambio estetico.
- PR #52 fullscreen e #53 comuni contemporanei potrebbero cambiare anche questi file: verifica lo stato prima della modifica.
