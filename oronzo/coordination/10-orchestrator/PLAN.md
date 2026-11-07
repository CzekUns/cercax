# ORONZO v0.2 — GAP ANALYSIS E ROADMAP
**Aggiornamento:** 7 novembre 2026. **Issue:** #25. **Fonte:** `../GAME-VISION-v02.md`.

| Area | Stato rilevato nella repo | Mancanza / modifica | Owner e gate |
| --- | --- | --- | --- |
| Entry flow Nuova/Carica | Prototipo `index.html`, pagina partita rapida separata | Scelta avatar, 20 offerte, presidente, 5 domande, hub, save | 10 integra; 03 UI e 04 copy |
| Avatar e morale consumabile | CoachV1 reputazione/relazioni, nessun loop completo user-defined | fortuna, leadership, autostima, pazienza, natalità, valuta morale 0 game over, delta | 09 dopo R02; 10 UI/runtime |
| 500 comuni e regione | Career attuale 104 club fittizi, 1985/86 | Dataset geolocalizzato verificato, 1979, 500 club, 20 offerte seed, costo regionale 1/3 | 07 dati dopo R02; 09 formula morale |
| 5000 cognomi e tratti | PlayerV1 generatore e carattere basilare | cognomi da fonte riusabile, pazzia/spericolatezza, origine regionale, risposte a shouts | 08 nuovo ciclo |
| Presidenti e finanze | 8 profili originali e board presenti | 5 bug R02 di incrocio con career; papponeria, compatibilità, prezzo biglietti e mercato date | 07/09 P0; poi 09 R03 |
| Spogliatoio, tifosi, giornali | Eventi/copy base, no relazioni complete col morale | fiducia individuale, prezzi/stadio/divise, effetto media e sostenitori, journal di effetti | 09 regole, 04 copy, 10 adapter |
| Conferenze | Copy generico presente | 5 Q iniziali e breve postmatch con giornalisti/emittenti random e risposte che incidono | 04 e 09, 10 integrazione |
| Gara 11v11 | Partita rapida in main con 1×15 min e cambio modulo fisico PR24 | ordini singoli con tono, verifica movimenti Android e bilanciamento | 06; 05 QA movimento |
| Due camere | Vista full field esistente | TV zoom ball-follow senza toccare stato engine | 05, 10 selector |
| Sprite e cutscene | Sprite #6 e UI mockup #5 su main; cutscene #12 draft | demo 22 player leggibili, asset UI dinamici, gate cutscene | 01/03; 02 in review |
| Save multi-stagione | Career save presente ma incompatibilità R02 | persistenza identità presidenti, salari, settimana assoluta, coach esonerabile | 07/09 R02 e QA 10 |

## Ordine eseguibile
**M0 — Contratto e bugfix:** v0.2 su Drive/GitHub; NEXT 01–09; test R02 su due stagioni e adattatori di confine. Stop se presidente/obiettivo/salario/anno/coach non tornano.

**M1 — Primo loop percorribile:** piccolo sottoinsieme del dataset ma schema definitivo; avatar→ingaggio→presidente→5 domande→hub→giornata→partita→conferenza post→variazioni morale→save/load. Campo full operativo, 1×15 min. Questo è il primo rilascio utile da testare, prima di aggiungere tutte le squadre.

**M2 — Profondità gestione:** report singoli giocatori, tifosi/stadio, papponeria/prezzi, mercato nei periodi consentiti, relazione giornalisti, coach e singoli. Camera TV, comandi individuali, asset artistici, cutscene dopo gate.

**M3 — Scala e rifinitura:** import verificato di 500 comuni e 5000 cognomi, gironi coerenti, progression/test due stagioni, QA visivo/touch Android; controllo licenze e marchi.

## Regole operative
- Non confondere assegnazione con implementazione.
- Ogni agente lavora solo nel suo scope e pubblica REPORT + PR; NEXT è dell'orchestratore.
- Non chiamare una categoria Eccellenza storica nel 1979; usare Promozione fino a scelta esplicita di universo alternativo.
- Le formule proposte per morale e trasferimenti restano configurabili, non dichiarate approvate.
- Eventi di cronaca e risultati escono dal motore vero, mai da mockup o renderer.
