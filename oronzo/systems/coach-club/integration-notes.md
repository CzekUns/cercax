# Integration notes · Agente 9

**Nessun file esterno a oronzo/systems/coach-club/ modificato.** Il modulo ESM non importa la IIFE di game.js e non modifica le cartelle di altri agenti. L'orchestratore è responsabile del collegamento al runtime.

## Consumer e flussi

**Career / Agente 7** conserva club, coach e i loro ID; passa week e matchId; invoca endClubWeek una sola volta per settimana, reviewMatch una sola volta per gara terminata, salva board/finance/market. Quando dismissed=true, svolge la procedura di esonero e nuovi ingaggi senza resettare la stagione.

**Match Engine / Agente 6** riceve selection.xi/bench/tactics da prepareMatchday e command da coachCommand. Deve emettere accepted/reason/effects a sua volta e imporre sostituzioni storiche. Passa snapshot phase='fulltime', t>=5400, score reale, con homeClubId e awayClubId; l'agente 9 registra, mai inventa gol.

**Attributes / Agente 8** usa coach.trainingPlan come piano, applica lui crescita, infortuni e fatica. Il sistema societario varia player.mental.morale entro limiti e legge player.contract.weeklyWage (nuova estensione serializzabile). Non far pagare uno stipendio inesistente se i dati non sono stati importati: prevedere adattatore salariale.

**Copy / Agente 4** fornisce presidents.json con almeno otto PresidentProfileV1. La demo prova a caricarlo e in sua assenza usa fixture chiaramente non canonici. Gli eventi ClubEventV1 supportano effetti boardTrust/presidentTrust/morale (interi tra -15 e +15) ed expense/sponsorIncome (interi 0..1.000.000 lire); altri effetti sono rigettati. Una scelta narrativa non può alterare direttamente match.score.

**UI / Agente 3** rappresenta cassa, arretrati, trattative, comunicazioni, deadline promesse e boardTrust con la propria direzione artistica. La demo dell'agente 9 è solo harness funzionale orizzontale, non nuovo stile UI definitivo.

## Regole di interoperabilità

- CoachV1 è esteso con appearance e trainingPlan. Appearance non fornisce bonus. ClubV1 ha board, market, finance. PlayerV1 può avere contract.weeklyWage.
- Importare da './systems/coach-club/index.js' da un modulo orchestratore; non importare gli agenti da percorsi non concordati.
- Scegliere i seed da stagione+club+settimana+action ID in modo stabile; gli input devono essere serializzati per riprodurre il salvataggio.
- wageBudget è cap settimanale, budget liquidità in ITL. Parametri demo non sono cifre d'archivio del 1985.
- Il prototipo monolitico attuale prevede cinque cambi e Math.random: nessuno dei due viene adottato automaticamente. rules.maxBench e i cambi del match engine richiedono verifica normativa storica per lega.
- Le promesse finanziarie richiedono confirmedContributions assegnato dal sistema di carriera su contributi **realmente disponibili**, non denaro creato dal nulla.
- I risultati forniti dalla demo sono **input di prova** precompilati, non partite simulate da questo modulo.
- Per espandere la logica: testare condizioni economiche, fiducia e stagionalità, senza dare al copy né alla UI il diritto di forzare i gol.

## Stati persistenti

proposed -> approved / rejected -> negotiated -> completed per acquisti. Una richiesta rifiutata è registrata, non cancella il calciatore altrui.

Club.board.notices conserva media, richieste, risposte e motivi fiduciari; club.board.results conserva i match già registrati; club.board.promises conserva pledged/honored/broken; club.finance.transactions mantiene l'audit di ogni movimento. La stagione rimane JSON-serializzabile.

## QA

Comando riproducibile nella directory del modulo: node --test. Usare anche la demo HTML da un server statico su localhost, mantenendo landscape 16:9. Vedi README per i limiti distinti fra implementato e ancora da integrare.
