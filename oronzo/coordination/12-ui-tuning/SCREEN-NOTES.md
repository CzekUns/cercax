# ORONZO · Registro richieste UI da playtest — Agente 12

**Regola:** una richiesta per ID e schermata; conserva tutta la cronologia in GitHub. Questo Markdown **sostituisce il Layout Editor** nella fase di test: l'utente descrive, eventualmente annota uno screenshot, l'Agente12 registra e cambia CSS/HTML/JS di presentazione su PR dopo aver localizzato il componente.

## Registro sintetico

| ID | Schermata | Modifica richiesta | Viewport / dispositivo | Stato | PR / commit |
| --- | --- | --- | --- | --- | --- |
| — | — | In attesa del primo feedback reale dell'utente | Android landscape (dettagli da raccogliere) | `READY` | — |

**Stati:** `RICHIESTA` → `IN_LAVORAZIONE` → `IMPLEMENTATA_DA_VERIFICARE` → `REVISIONE_00` → `CONFERMATA_UTENTE`; oppure `BLOCCATA` / `DIPENDENZA`. Non segnare una nota come corretta senza prova sufficiente.

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
