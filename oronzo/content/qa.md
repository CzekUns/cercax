# QA · Agente 4 — ORONZO Copy · correzione PR #13

**Stato:** correzione FIX_REQUESTED completata sul branch `agent/oronzo-copy` (merge demandato all'orchestratore).
**Perimetro:** `oronzo/content/`. Ambientazione: provincia italiana, stagione 1985–86.

## Conteggi verificati sul HEAD remoto (7 novembre 2026)

| Dato | Prima | Ora | Minimo |
| --- | ---: | ---: | ---: |
| Personaggi | 16 | **23** | 12 |
| Presidenti PresidentProfileV1 | 0 | **8** | 8 |
| Eventi totali | 57 | **73** | 40 |
| Eventi con `presidentId` | 0 | **20** (16 nuovi + 4 originali protetti) | 16 |
| Microcopy | 144 | **144** | 80 |
| Dialoghi | 26 | **42** | 20 |
| Dialoghi con `presidentId` | 0 | **22** (16 nuovi + 6 originali protetti) | 12 |
| Varianti dialoghi | 52 | **84** | — |

Tutti gli otto presidenti hanno un archetipo differente, biografia, obiettivo, contraddizione privata, rapporto col mister, almeno tre battute, sette valori `traits` interi nel range 0–100 e due `behaviorTriggers` che puntano a eventi esistenti. `gaetano_venturi` mantiene il proprio ID storico. Gli altri sette presidenti sono presenti anche in `characters.json`. Ogni presidente dispone di almeno due nuovi eventi e due nuovi dialoghi.

## Validazioni realmente eseguite

1. Letti via connettore GitHub i file `characters.json`, `presidents.json`, `events.json`, `microcopy.json`, `dialogues.json`, `narrative-engine.js`, `validate.mjs`, `demo.html` dal branch.
2. Eseguito `JSON.parse` per tutti e cinque i JSON, senza errori.
3. Valutato l'ESM `narrative-engine.js` in un runtime JavaScript V8 (rimuovendo soltanto i token `export` per l'esecuzione isolata).
4. Eseguita la **logica reale di `validate.mjs`** in V8 sostituendo soltanto le API Node di lettura filesystem con oggetti caricati da GitHub: esito `ORONZO COPY: OK`, nessun errore. Output: 23 personaggi, 8 presidenti, 20 eventi e 22 dialoghi presidenziali, 73 eventi, 144 microcopy, 42 dialoghi, 84 varianti e 83 riferimenti a futureEffects.
5. Verificati ID univoci, speaker e relazioni esistenti, metadati `PresidentProfileV1`, campi numerici e limiti UI, scelta evento, random campionato una sola volta, cooldown, trigger ignoti rifiutati, mutazione evitata, statistiche clamp e classifica non modificata.
6. Per ciascuno degli 8 presidenti, costruito uno stato di prova con `club.presidentId` e contesto narrativo, verificato che **almeno due eventi risultino eleggibili**, che nessun evento di altri presidenti sia presente e che un dialogo collegato sia selezionabile.
7. Il codice JS del `<script type="module">` della demo passa la compilazione sintattica come AsyncFunction, con rimozione della sola istruzione `import`.

**Non eseguiti e non dichiarati:** `node oronzo/content/validate.mjs` in una vera checkout locale, test visuale/touch su telefono, E2E browser, import diretto dalla PR #17 dell'Agente 9. Il codice Node è stato testato per la sua logica in V8 con input equivalenti, non come processo Node con filesystem reale. Comando che l'orchestratore può riprodurre su una checkout:

    node oronzo/content/validate.mjs

## Proprietà narrative e controllo qualità

- **Stile:** dialoghi originali con voce distinta (presidente formale, intermediario, industriale, visionario, ex calciatore, notabile, imprenditrice, tribuno). Tensione reale e comicità distribuite, nessuna battuta riconoscibile di film o giochi citati come ispirazione.
- **1985:** mercato attraverso società/direttore, uso di carta, telefonate e radio; il copy non usa social/VAR/smartphone. Le notizie di risultati sono condizionate allo stato realmente disponibile.
- **Selettore:** senza `presidentId` attivo, gli eventi e dialoghi specifici del presidente non scattano; nemmeno quelli di Venturi all'interno del nuovo sistema. Questo evita la comparsa simultanea di presidenti di club differenti.
- **Economia:** le condizioni di cassa leggono lire nominali dello stato reale; i `futureEffects` restano inattivi. I vecchi `clubCash` astratti non possono essere passati all'Agente 9 come importi ITL senza un adattatore.
- **Risultati:** eventi, personaggi e microtesti non modificano mai direttamente score, goal, infortuni o classifica. Le due correzioni storiche al vecchio game.js (due punti per vittoria; limite cambi) restano fuori scope.

## Dipendenze e limiti per integrazione

- Agente 9 (PR #17): `loadPresidents(fetchJson)` accetta l'involucro `{presidents:[...]}`, `validatePresident` richiede i sette tratti e il profilo base. I campi extra `behaviorTriggers`, `lines`, `relations`, `coachRelationship` restano proprietà narrative; non sono input comportamentali automatici del suo `presidentBehavior`.
- Orchestratore: deve associare un solo `ClubV1.presidentId` alla società attiva e fornire `narrativeContext.lossStreak/marketRequest/derbyWeek/cupWeek` da dati veri di risultati, richieste e calendario, oltre a `club.boardTrust` e `club.finance.cash`.
- I tre calciatori ricorrenti con nomi narrativi richiedono binding a `PlayerV1` della rosa reale; nessuna rinomina automatica dei salvataggi.
- Il pacchetto è ancora isolato dal gioco `game.js`. Demo ed ESM sono per l'orchestratore; nessun merge effettuato.

## Esito

**Controlli strutturali e smoke test V8: PASS.** QA browser/manuale e integrazione transmodulare: da eseguire da orchestratore. Nessun conflitto di proprietà con gli altri agenti.
