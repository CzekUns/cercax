# ORONZO — Contratto tecnico condiviso v1 (AGENTI 5–9)

## Stato attuale e obiettivo
Il prototipo esistente è `oronzo/game.js`, una IIFE JavaScript monolitica. È una **demo**, non un motore consolidato. I nuovi agenti costruiscono moduli veri, autonomi, testabili, integrabili dall'orchestratore, senza toccare la IIFE. Il progetto usa HTML/CSS/JS browser-first, offline dopo caricamento, nessun backend obbligatorio, senza dipendenze esterne obbligatorie. Usa **ES modules** JS (`export`) nei moduli nuovi, con test `node:test` quando utile e demo HTML locale per i sistemi visuali.

**Gioco:** stagione 1985–86, provincia italiana, ruoli reali di allenatore e società, partita simulata ~90 secondi a velocità 1× con pausa e velocità 2×/4×/8×, panorama grafico landscape 16:9 logico 640×360 (1280×720 mockup), sprite rifiniti in arrivo dagli agenti 1–3; copy originale dall'agente 4. Mai introdurre UI portrait o restyling a cubetti.

## Proprietà dei moduli e perimetri ESCLUSIVI
- **Agente 5 — Movimento e match visual:** `oronzo/systems/match-view/`. RENDERING SOLO: snapshot -> sprite e interpolazione, palla, camera e indicatori.
- **Agente 6 — Motore calcistico:** `oronzo/systems/match-engine/`. SIMULAZIONE: posizioni, decisioni, possesso, passaggi, tiri, contatti, parate, eventi e risultato; unica fonte di verità.
- **Agente 7 — Carriera:** `oronzo/systems/career/`. Calendari, giornata, classifica, stagione, promozioni/retrocessioni, salvataggio, avanzamento e carriera del mister.
- **Agente 8 — Attributi:** `oronzo/systems/attributes/`. Calciatori, indicatori tecnici/fisici/mentali, crescita, fatica, allenamenti, salute, rischio, statistiche storiche.
- **Agente 9 — Allenatore e Società:** `oronzo/systems/coach-club/`. Decisioni mister, panchina, direttore sportivo, governance, presidenti, board, fiducia, negoziazione e bilancio.
- **Agente 4 — Copy:** `oronzo/content/`. Autore di nomi, archetipi originali, dialoghi e testi (in particolare `presidents.json`). Implementazione delle reazioni sociali e finanziarie SOLO all'agente 9.

Non modificare mai `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css`, i 5 file root CercaX o i file degli altri agenti; l'integrazione nel runtime è responsabilità dell'orchestratore. Ogni modulo deve avere `README.md`, test, un esempio eseguibile (anche HTML demo) e `integration-notes.md`. Non dichiarare integrazione nel prototipo finché non verificata. Ogni agente lavora su branch dedicato e crea PR verso `main`, senza auto-merge.

## Contratto dati interoperabile (v1)
**Coordinate match:** x,y in [0,1] (sinistra->destra, alto->basso); la squadra di casa attacca verso destra nel primo tempo, scambia lato all'intervallo. `t` è il tempo simulato in secondi [0,5400]; input del motore un `dt` in secondi di simulazione, applicato dal runner. Il renderer esegue solo interpolazione **visiva**, non avanza il tempo calcistico.

`PlayerV1`: `{id, name, teamId, age, positions:[], technical:{passing,shooting,control,tackling,positioning,decisions,goalkeeping}, physical:{pace,stamina,strength,durability}, mental:{composure,discipline,teamwork,confidence,morale,luck,character}, status:{fatigue,fitness,health,injuryDays,suspensionMatches}, appearance?}`.
Ogni attributo numerico è su 0..100; `luck` altera lievemente una probabilità, mai in maniera deterministica; gli attributi devono essere correlati a decisioni reali e osservabili.

`ClubV1`: `{id,name,divisionId,budget,wageBudget,boardTrust,seasonObjective,presidentId,players:PlayerV1[],staff?,reputation?}`. I bilanci devono essere coerenti, non denaro infinito; la società detiene la proprietà dei trasferimenti e dei contratti. Le singole carriere possono usare ID di calciatore e club evitando duplicare oggetti.

`CoachV1`: `{id, name, clubId, reputation, contract?, tactics:{formation,mentality,pressing,tempo,width,marking}, relationships?}`.

`MatchInputV1`: `{seed,homeClub,awayClub,homeXI:string[],awayXI:string[],homeBench:string[],awayBench:string[],homeTactics,awayTactics,competitionRules?,environment?}`.

`MatchSnapshotV1`: `{t,minute,phase,score:{home,away},players:[{id,teamId,x,y,vx,vy,facing,action,energy,hasBall}],ball:{x,y,height,vx,vy,ownerId},stats:{home:{shots,shotsOnTarget,possession,fouls,corners},away:{...}},events:[],possessingTeamId}`. Gli `events` sono nuovi eventi dalla tick corrente, con `id,t,type,teamId?,playerId?,otherPlayerId?,detail?`. Tipi utili: `kickoff,pass,interception,tackle,dribble,shot,goal,save,foul,card,injury,substitution,corner,throwin,offside,halftime,fulltime`. **Il risultato cambia solo in seguito a un evento goal del motore**; niente gol inventati nel renderer o nel copy.

**Azioni panchina:** `CoachCommandV1` con `{type:'tacticChange'|'substitution'|'shout',teamId,t?,payload}`. Motore restituisce `{accepted:boolean,reason?,effects?}`, non ignora silenziosamente gli ordini. Cambi, cartellini e regole devono corrispondere al ruleset scelto e all'anno 1985 (non presumere regole moderne: verificare il numero di sostituzioni e il sistema punti storico; se non confermato, parametrize e documenta).

**Eventi società/narrativi:** `ClubEventV1` `{id,clubId,seasonWeek,trigger,options:[{id,label,effects}],cooldownWeeks,oncePerSeason?}`; effetti applicati da agente 9 con parametri validati e clamp 0..100, testi forniti dall'agente 4; eventi narrativi non sostituiscono il risultato della simulazione.

**PresidentProfileV1:** `{id,name,archetype,clubFlavor,traits:{authoritarianism,frugality,vanity,patience,interference,ambition,riskTolerance},voice?,goal?,background?}`. Tratti 0..100. L'agente 4 crea `oronzo/content/presidents.json` con MINIMO 8 personaggi ORIGINALI; l'agente 9 espone un `presidentBehavior(profile, state, seed)` deterministico a seed che modifica linee societarie, fiducia, richieste e interferenze, mai direttamente il punteggio. Se file copy non ancora presente, test con fixture sintetiche e documenta fallback.

### Separazione netta fra responsabilità
**Match-engine** produce posizioni e fatti di gioco, **match-view** rappresenta questi fatti con sprite e cutscene. **Attributes** produce valori e cambiamenti di calciatore, **match-engine** li legge senza riscriverli. **Coach-club** regola le scelte del mister e del presidente, **career** orchestra calendari e salvataggi, **copy** fornisce parole, nomi e storie. Tutti mantengono interfacce pubbliche documentate nel README e non si importano reciprocamente via percorsi hardcoded non concordati; usare contratti e dependency injection dove conveniente.

## Qualità e test obbligatori
- ESM JavaScript senza pacchetti obbligatori, no TypeScript transpilation necessaria.
- Stato e casualità riproducibili dato stesso seed, tempo e comandi; niente `Math.random()` dentro la logica deterministica. Fornire un PRNG locale seed-based (oppure un RNG iniettato) per i sistemi che richiedono casualità.
- Test di casi limite e invarianti (22 giocatori, 2 squadre, possesso, palla nei limiti, cronologia coerente, score da goal, ripresa pausa, salute/condizione clamp, leghe/calendari senza collisioni, bilancio e società senza acquisti magici).
- Verificare con `node --test` o ambiente standard; includere output o istruzioni che chiunque possa replicare. Se alcune feature non sono complete, distinguere chiaramente `implemented` da `planned`.
- Arte originale e caratteri originali; nessun IP cinematografico o di videogiochi ricopiato. Reference su Drive solo per analisi visiva: https://drive.google.com/drive/folders/1kfDVXXUYL1G7JemAhlWGTPmtAv0KKoCQ.

## Procedura di consegna
Ogni agente: controlla repo/issue/contratto, implementa un **vertical slice funzionante**, aggiunge test, descrive API e integrazione nella propria directory, esegue verifiche, commit sul branch, PR verso main, comunica link. Nessun lavoro fittizio. L'orchestratore verifica e connette gli agenti al gioco.
