# ORONZO · Registro richieste UI da playtest — Agente 12

**Regola:** una richiesta per ID e schermata; conserva tutta la cronologia in GitHub. Questo Markdown **sostituisce il Layout Editor** nella fase di test: l'utente descrive, eventualmente annota uno screenshot, l'Agente12 registra e cambia CSS/HTML/JS di presentazione su PR dopo aver localizzato il componente.

## Registro sintetico

| ID | Schermata | Modifica richiesta | Viewport / dispositivo | Stato | PR / commit |
| --- | --- | --- | --- | --- | --- |
| S12-001 | `entry` — apertura | Allargare la pagina iniziale e mostrare solo NUOVA PARTITA e CARICA PARTITA, senza scheda testuale o decorazione laterale | Android landscape, risoluzione da verificare | `IN_LAVORAZIONE` | branch `agent/oronzo-12-ui-playtest-s01` |
| S12-002 | Tutte le viste — navigazione inferiore | Eliminare il menu inferiore onnipresente; mantenere la navigazione in-contesto e futuro fullscreen accessibile senza ripristinare il menu | Android landscape, risoluzione da verificare | `IN_LAVORAZIONE` | branch `agent/oronzo-12-ui-playtest-s01` |

**Stati:** `RICHIESTA` → `IN_LAVORAZIONE` → `IMPLEMENTATA_DA_VERIFICARE` → `REVISIONE_00` → `CONFERMATA_UTENTE`; oppure `BLOCCATA` / `DIPENDENZA`. Non segnare una nota come corretta senza prova sufficiente.

## Richieste utente effettive · 9 novembre 2026

### S12-001 — `entry` · Inizio a tutta larghezza

- **Stato:** `IN_LAVORAZIONE`
- **Messaggio utente:** «Anzitutto la pagina iniziale dovrebbe essere bella larga e avere solo nuova partita e carica partita.»
- **Schermata / navigazione:** apertura della carriera, `renderEntry()`; qui si vedono anche `.entry-panel`, `.entry-brief`, `.runtime-image` e `.entry-actions`.
- **Viewport:** Android landscape; il proprietario non ha fornito ancora le dimensioni.
- **Screenshot:** feedback testuale in chat; nessuno screenshot fornito o salvato nella repository.
- **Com'è ora:** testo introduttivo e pannello decorativo dividono la larghezza disponibile; i due pulsanti sono confinati in un pannello.
- **Come deve diventare:** corpo iniziale largo quanto l'area utile, con **soli due comandi centrali**, grandi e leggibili: NUOVA PARTITA e CARICA PARTITA. Il marchio nella barra alta rimane; nessuna nuova meccanica.
- **Componenti confermati:** `renderEntry()`, `#ui-screen`, `.runtime-entry`, `.runtime-entry-actions` (questi ultimi classi locali introdotte con il fix).
- **Impatto e vincoli:** rimuovere testo introduttivo e immagine esclusivamente da entry; preservare flusso `start/load`, safe-area, 44px e stile rétro.
- **File previsti:** `oronzo/assets/ui/career-r03.js`, `oronzo/assets/ui/career-r03.css`.
- **PR / commit:** da aggiornare alla pubblicazione.
- **Prove:** NON ANCORA ESEGUITE. Chromium HTTP/Android reale da verificare.
- **Esito utente:** da confermare.

### S12-002 — `entry` e altre viste · Menu inferiore ridondante

- **Stato:** `IN_LAVORAZIONE`
- **Messaggio utente:** «Il menù navigaz inferiore è onnipresente in tutte le schermate inutilmente».
- **Schermata / navigazione:** `#runtime-nav.quick-nav`, condiviso tra tutte le 13 schermate e montato in `career-r03.html`; `render()` e le viste hanno già CTA proprie.
- **Viewport:** Android landscape; dimensioni da verificare.
- **Screenshot:** feedback testuale in chat; nessuno screenshot salvato nella repository.
- **Com'è ora:** footer permanente INIZIO/SALVA/UFFICIO/PROSSIMA/RAPIDA 1985, spesso duplicato o non pertinente; sottrae 50px alle viste.
- **Come deve diventare:** non mostrare la navigazione inferiore nelle schermate; lasciare operative le CTA contestuali esistenti (es. UFFICIO ha SALVA e FORMAZIONE, AVATAR ha INDIETRO, GAME OVER ha NUOVA/CARICA, post-partita ha AVANZA). Il comando Fullscreen della PR #52, se presente dopo l'integrazione, deve restare autonomamente raggiungibile nella barra superiore e **non** riaprire il menu.
- **Componenti confermati:** `#runtime-nav`, `render()`, `gamebar`. Non eliminare il markup su branch in collisione con PR #52.
- **Impatto e vincoli:** preservare i percorsi, save/load, fullscreen nativo, layout portrait/landscape, 44px e canvas16:9. Non modificare logiche del controller.
- **File previsti:** `oronzo/assets/ui/career-r03.js` e `career-r03.css`, senza conflitti HTML con PR #52.
- **Dipendenza:** PR #52 (fullscreen ancora aperta), quindi verificare anche la combinazione prima dell'approvazione definitiva.
- **PR / commit:** da aggiornare alla pubblicazione.
- **Prove:** NON ANCORA ESEGUITE. QA HTTP/Chromium e verifica post-merge PR52 ancora necessarie.
- **Esito utente:** da confermare.

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
