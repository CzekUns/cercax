# ORONZO — GAP ANALYSIS V0.2 E PIANO DI ACCELERAZIONE R10

**Verifica GitHub:** 8 novembre 2026 · **Owner:** Agente10 (orchestrazione).  
**Fonte requisiti prevalente:** [GAME-VISION-v02.md](../GAME-VISION-v02.md), §§01–16. È il progetto originale operativo più recente; per conflitti prevale su concept v0.1/README alpha del 1985. **Dopo decisione del proprietario:** niente Layout Editor, sostituito da [Agente12](../12-ui-tuning/HANDOFF.md) e [registro per schermata](../12-ui-tuning/SCREEN-NOTES.md).  
**Regola:** stato **MERGED** e codice su main = disponibile; stato **PR_OPEN** = sviluppato ma NON disponibile al giocatore; API esistente senza UI = **NON GIOCABILE**. Un test dell'autore o un parser JS non è audit indipendente.

## 1. Stato corrente verificabile — cosa abbiamo davvero

| Blocco di visione | Stato su `main` / evidenza | Gap da chiudere | Priorità |
| --- | --- | --- | --- |
| Nuova/Carica, 1979, avatar+quattro tratti, 20 offerte, presidente, 5 domande | **GIOCABILE** in `career-r03.js`, flow07 + coach09, PR #38/#39/#43 mergiate; 119 test Node e 16 percorsi Chromium prima di merge M01, audit R09C | Migliorare contenuti/presentazione nel feedback 12, non ricostruire questo loop | Fatto / P2 |
| Classifica e rosa 16/16, scheda giocatore, XI 1 GK, partita Engine06 22 attori, 2 domande post | **GIOCABILE** nel runtime, audit R08B/R09C; 1×≈15min, pausa e velocità | Aggiungere strumenti veri di allenatore durante match e vista TV, verificare Android fisico | **P0** |
| Morale mister, effetti ingaggio/stampa, game over, salvataggi e avanzamento settimana | **INTEGRATO** e auditato, non sono mock di punteggio | Completa il loop pluristagionale in browser e con maggiore profondità relazionale | P1 |
| Mobile landscape, safe-area, 44px CTA, conferenza scorrevole | [#48](https://github.com/CzekUns/cercax/pull/48) **MERGED**; R09C PASS indipendente sul HEAD esatto | Playtest Android fisico e correzioni per schermata con 12 | **P0 UI** |
| Fullscreen nativo | [#52](https://github.com/CzekUns/cercax/pull/52) **OPEN**, non auditato HTTP/Chromium sul gioco | Audit00 → eventuale fix stessa PR → autorizzazione merge | **P0** |
| Comuni reali | [#53](https://github.com/CzekUns/cercax/pull/53) **OPEN**, selettore 500 comuni attuali, mondi newGame; provenienza [#40](https://github.com/CzekUns/cercax/pull/40) | Audit00 end-to-end + validazione status/schema/attribution; province e anni demografici ancora null, 1979 NON attestato | **P0** |
| Cognomi verificati da fonte | [#40](https://github.com/CzekUns/cercax/pull/40) OPEN; ricerca **600 cognomi distinti** +500 comuni all'ultimo controllo (STATUS, `surnames.json`). Fonte Bergamo2021 CC0, frequenza comunale e non ranking nazionale | **NON integrati** nel generatore reale. 08 owner: import/versioning e persistenza ID, collegamento 07 dopo gate | **P0** |
| Telecamera televisiva follow-ball | [#28](https://github.com/CzekUns/cercax/pull/28) OPEN/HOLD; implementazione renderer su branch, test geometrici insufficienti con sprite fallback | Render 22 sprite PNG veri e campo FULL/TV via Chromium HTTP, audit visivo, merge, quindi collegare selettore UI12 | **P0** |
| Comandi tattici/individuali/sostituzioni durante la gara | Engine06 su main supporta `tacticChange`, `shout` di squadra e `substitution`; runtime R03 mostra **solo pausa/velocità/full/TV non disponibile**. [#31](https://github.com/CzekUns/cercax/pull/31) + [#35](https://github.com/CzekUns/cercax/pull/35) OPEN per tratti/origini e shouts individuali, con incompatibilità schema/toni e doppio effetto già riportate R04/R05 | Correggere #31/#35 **nelle stesse PR**, audit compatibilità 08↔06↔09, hook del flow07 e UI12 in fase successiva. Nessun comando finto | **P0** |
| Allenamento | Attributi08 ha `applyTrainingWeek` e piani in modulo, **ma UI R03 indica «MODIFICA ALLENAMENTO · NON DISPONIBILE»** e scheda in sola lettura | Collegare scelta piano a career07 con effetti misurabili, fatica e infortuni, poi interazione UI12 | **P1** |
| Tifoseria, stadio, prezzo biglietti, giornali | Hub R03 visualizza fans/media e valori, **non presenta stadio/prezzi o voci «cosa dicono» operative** | Regole09/07 + vista UI; ricavi/rapporti idempotenti e feedback narrativo 04 | **P1** |
| Presidente, papponeria, richieste e mercato | Hub R03 mostra nome, goal, fiducia, cash/arrears **in lettura**; nessuna richiesta o operazione di mercato in interfaccia | Finestra trasferimenti e decisioni presidente, biglietti e pressione economica; collegare dati già disponibili senza inventare | **P1** |
| Personalità calciatori, fisico, outfit persistente | Parte attributi08 + model/player projection su main, atlas sprite su main; nuove varianti in [#29](https://github.com/CzekUns/cercax/pull/29) OPEN/HOLD gate arte | QA finale 22 diversi con PNG veri e coerenza kit/volto tra scheda e partita; figurine NON gate M1 | P1/P2 |
| Cutscene laterali eventi (gol/parate/cartellini/infortunio) | [#12](https://github.com/CzekUns/cercax/pull/12) OPEN DRAFT/HOLD artistico, manifest runtime opzionale assente | Revisione artistica/codice e aggancio evento solo DOPO gate; no merge forzato | P2 |
| Copy giornalisti/TV e stampa | Copy04 [#34](https://github.com/CzekUns/cercax/pull/34) MERGED (37+32 domande, 12 giornalisti, 8 TV e battute); effetto stampa core integrato | Raffinamento comico e dialoghi dialettali verificati, sintesi conseguenze esplicite UI | P2 |
| 5000 cognomi, intero universo, storicità dettagliata 1979, grafica/cutscene finale, bilanciamento profondo | Desiderata di espansione / non completati | **NON BLOCCANTI per M1**: minimo concordato 100 comuni verificati e 500 cognomi verificati; niente ranking/anno storico inventati | P3 |

### Precisazioni importanti
- Le **500 località** della PR53 sono **un sottoinsieme di comuni contemporanei**, fonte ISTAT/RP92 e attribuzione CC BY4; **500 su500** hanno `provinceCode:null` e `populationReferenceYear:null`. Non si può rivendicare geografia/popolazione storica del1979. Schema app V2 ammette null espliciti. L'audit deve decidere se lo `reviewStatus:'approved'` per identità contemporanee è fondato e non fuorviante; no merge prematuro.
- I **600 cognomi** registrati nella ricerca #40 (snapshot più recente della precedente importazione PR53) non sono ancora nomi giocabili; non usarli per inferire rarità nazionale o autenticità etimologica italiana. Soglia M1=500 **distinti con provenienza**, non 5000.
- In partita il pulsante `TERMINA GARA` è un comando **QA** disponibile solo in modalità sintetica; l'utente normalmente attende 90 minuti simulati ≈15 minuti a1×. Non pubblicizzarlo come skip gara normale.
- Il campo 16:9 del canvas NON coincide con «tutte le schermate devono avere rapporti 16:9 rigidi»: stage landscape con safe-area, azioni sempre44px visibili.

## 2. Catena critica per il primo rilascio funzionale M1

**Un solo obiettivo:** percorso reale `Nuova partita → comune/cognomi con fonte → ingaggio/morale → stampa → hub → formazione → partita FULL/TV con ordini effettivi → postpartita → salvataggio/reload → seconda stagione`, testato su Android landscape. Niente feature senza prova di giocabilità; niente ricostruzioni CSS chiamate browser QA.

### Sprint A — CHIUDERE PR GIÀ PRONTE (parallelizzabile subito)
1. **A1: Audit indipendente 00 su [#52](https://github.com/CzekUns/cercax/pull/52) (F01 Fullscreen)**: checkout autentico, Chrome/Chromium HTTP, target44px, fullscreen nativo click e exit, effetti toolbar, conferenza, finish CTA, save/load, Node119. Se NEEDS CHANGES, stesso branch. Merge solo su consenso utente.
2. **A2: Audit indipendente 00 su [#53](https://github.com/CzekUns/cercax/pull/53) (D01 comuni)**: reale `newGame`/20 offerte/ingaggio/press/partita/save/reload e compatibilità V1, validare metadati null, fonti/attribuzione, niente fallback QA occulto. Stessa PR per fix. Merge su consenso e test, non dare status APPROVED se fonti non corroborate.
3. **A3: Prima di secondo merge**, test incrociato **#52 + #53 insieme** perché HTML/CSS e JS della stessa schermata interagiscono, più Android fisico dopo deploy. Nessun merge automatico. Prendere SHA e risultati prima di dichiarare main disponibile.
4. **A4: #40 ricerca** continua indipendentemente; per gli importatori fissare SHA di snapshot e prendere solo quota M1 necessaria, senza attendere 5000 cognomi.

### Sprint B — SBLOCCARE DUE FUNZIONI DI PARTITA (parallelizzabile con A, PR già aperte)
5. **B1 owner05 [#28](https://github.com/CzekUns/cercax/pull/28):** portare QA browser 22 sprite PNG reali, `assetState=ready`, FULL e BROADCAST su snapshot identici; coordinate/score invariati; richiedere review00 e merge autorizzato. **Owner01 [#29](https://github.com/CzekUns/cercax/pull/29)** deve chiudere gate qualità sprite senza creare nuove PR, ma la camera va testata già con gli asset di main.
6. **B2 owner08 [#31](https://github.com/CzekUns/cercax/pull/31) + owner06 [#35](https://github.com/CzekUns/cercax/pull/35):** contratto unico origini/coachTrust/toni ed effetti temporanei e permanenti; chiudere incompatibilità R04/R05 con test incrociati e 100 seed. **Non duplicare bonus shout**. Dopo PASS indipendente, merge autorizzato sequenziale e smoke-check.
7. **B3 owner08:** sfruttare il catalogo **600 cognomi** della ricerca #40 (scegliere snapshot >=500 distinti), validare fonti/licenza e importare 500 M1 persistenti in un ciclo compatibile con #31, senza nuova raccolta. Non rigenerare nomi su salvataggi. Implementare questa integrazione dopo chiusura del conflitto #31 o nella stessa PR se il diff resta controllabile e il gate lo verifica.

### Sprint C — UNIRE QUELLO CHE ESISTE, NON CREARE DUE SISTEMI
8. **C1 owner07** nuovo ciclo dopo merge #31/#35/#53: collega alla carriera le API comandi dell'Engine06, origine del mister/calciatori e gli effetti permanenti Coach09 con ledger senza doppi delta; integra piano allenamento08 con giorni/settimane veri. Non scrivere UI.
9. **C2 owner12** nuovo ciclo UI dopo gate A e B: collega selettore FULL/TV, formazione avversaria, tattica/motivazione/sostituzioni e piano allenamento alle API effettive; coordina col 07, non creare meccaniche finte. Continua correzioni layout da screenshot singola schermata in `SCREEN-NOTES.md` e mantieni M01.
10. **C3 owner00:** un solo audit E2E di tutte le nuove funzioni dopo merge isolati, incl. Android telefono reale da proprietario; save/reload, due stagioni e i casi limite. **Questo è il gate di prima versione giocabile**.

### Sprint D — GESTIONALE PROFONDO, DOPO CHE MATCH È INTERATTIVO
11. **Owner09**: presidente realmente operativo, `papponeria`, rapporti/ricavi/stadio/prezzo biglietti; periodi di mercato e autorizzazioni economiche; eventi persistenti non duplicati. **Owner07**: calendario/finestre e adapter; **Owner12**: menu reali Tifoseria/Stadio/Ufficio del Presidente. Fare un verticale stadio/prezzi→incasso→umore→morale, poi un verticale richiesta/mercato→decisione→bilancio→rosa, non tre dashboard vuote.
12. **Owner02 [#12](https://github.com/CzekUns/cercax/pull/12)** cutscene e owner01 arte finale solo dopo i gate reali di resa. **Owner04** miglioramenti satirici/dialetti quando approvati e verificati. 5000 cognomi e più comuni non bloccano gli sprint A–C.

## 3. Velocizzazione concreta e disciplina

- **Stop a duplicazioni:** niente nuove PR per funzionalità già in #12/#28/#29/#31/#35/#52/#53. Correzioni sulle PR esistenti, nuova PR solo per un reale innesto assente e owner unico.
- **Divisione lavoro:** in parallelo solo file non sovrapposti: 00 audit A, 05 renderer camera, 06 engine shout, 08 attributes/surname. UI12 si concentra su test e screenshot e assume integrazione soltanto dopo API stabili; 07 non interviene sul CSS. 11 standby, 03 storico.
- **Merge uno alla volta con `expected_head_sha`**, esito review+CI, prova main e browser; mai merge di questa roadmap o delle PR perché un elenco dice READY. L'utente autorizza ciascun merge.
- **Niente nuove ricerche fuori dalla dipendenza dati:** congelare snapshot di ricerca per M1; ricerca continua su #40 ma non modifica l'import eseguito.
- **Evidenza visibile:** rapporto test con commit, suite Node, Chromium HTTP vero, asset PNG reali; la prova Android fisico è distinta da emulazione touch. Un test che fallisce o manca è un blocco, non un PASS.
- **Scelte di game design aperte:** formule autostima/bonus stipendio, confini market1979, isole/regione, bilanciamento prezzi e imprecazioni dialettali non vanno inventate come decisioni utente; usare parametri e documentazione «assunzione di gioco» oppure demandare una specifica decisione al proprietario se veramente necessaria.

## 4. Regola di "release"

**Non dichiarare «ORONZO M1 finito» finché**: (a) 100+ comuni con fonte e500+ cognomi con fonte realmente usati; (b) ogni partita ha vista full+TV e ordini che modificano lo stato reale; (c) partita completa dal1979 a post-match, save/load e **seconda stagione**; (d) touch44px, safe-area e fullscreen supportato/negato correttamente; (e) riscontri del proprietario Agente12 + audit00 positivo. Lo stadio/mercato profondo e cutscene possono seguire nell'M2, ma devono restare chiaramente dichiarati non disponibili, non UI fittizia.

**Prossima azione dell'orchestratore:** monitorare gate #52/#53 e accelerare i lavori già esistenti #28/#29/#31/#35, senza rifare la base #38/#39/#43/#48. Registrare il progresso nei NEXT dei rispettivi owner e nell'epic [#25](https://github.com/CzekUns/cercax/issues/25).
