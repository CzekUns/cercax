# ORONZO — AGENTE 08 · PRIORITÀ M1: SHOUTS COMPATIBILI + 500 COGNOMI

**STATO: `P0_SHOUT_AND_SURNAME_M1` — 8 novembre 2026.** [Roadmap R10](../10-orchestrator/ROADMAP-R10-ACCELERAZIONE.md). La **PR #31 è OPEN** e non passa ancora il contratto incrociato con #35 (PlayerV2 origine `{comune,regione,macroregione}`, `relationships.coachTrust`, toni `gentle|hard` vs engine `encourage|harsh`). Correggere **solo sulla #31**, insieme ai test incrociati su PlayerV2 reali e prevenzione doppio effetto shout; 06 possiede l'effetto temporaneo, 09 il delta persistente. Test di retry, seed, serializzazione e relazione; REPORT con API precise.

**Sblocco dati M1 (non aspettare 5000):** nel branch ricerca [#40](https://github.com/CzekUns/cercax/pull/40), `oronzo/data/research/surnames.json` ora contiene **600** cognomi distinti documentati da fonte Bergamo2021 (CC0, frequenza locale), non integrati. Verifica SHA snapshot più recente e fonti/diritti, poi integra nel generatore almeno **500** record reali e ID stabili, conservando i save precedenti e documentando che non sono una classifica nazionale né certificazione di etimologia italiana. Per evitare conflitti con automazione #40, importare uno snapshot versionato nell'ambito di08 **senza scrivere su #40**; coordinare il gate con 10, preferibilmente dopo chiusura fix sulla #31 o in un commit ben isolato nella stessa PR se testabile. Niente nuovo ramo concorrente #31, niente 5000 come P0, nessun merge autonomo.

---

## ARCHIVIO — NEXT PRECEDENTI

# NEXT — AGENTE 08 · PERSONAGGIO GIOCATORE, REGIONALITÀ E NOMI · VISIONE v0.2
**Stato:** `FIX_REQUESTED` — prevale la direttiva R05 in fondo al documento; lavoro R02 nella PR esistente.
**Precedente:** PR #16 MERGIATA (389dce444a7f7c19254381bfda2205acc4268f51).
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-attributes-r02` da ultimo main.
**Scope:** `oronzo/systems/attributes/` e proprio REPORT.

## Attività
1. Mantieni `PlayerV1` compatibile; estendi in modo esplicito e validato con tratti giocatore `pazzia`/impulsività, `spericolatezza`, fortuna e mentalità storiche già concordate, insieme a comune/regione/macroregione di origine. Tratti su scala stabile e con effetti numerici testabili in allenamento, fatica, risposta a incoraggiamento/rimprovero; non aumentare artificialmente le abilità calcistiche per etichetta.
2. Prepara pipeline per **500 cognomi italiani verificati per M1**, scalabile fino a **5000 nell'espansione**, con fonte reale, anno/licenza, duplicati/varianti e ranking documentati. Non fabbricare frequenze; se non è disponibile una fonte che permetta il riuso, consegna loader/generatore con dataset campione verificato e segnala il limite invece di dichiarare 5000 completati.
3. Generatore seed-based che mantiene identità, cognome, regione e tratti dopo save/load, senza collisioni di ID; evitare associare cognomi reali a biografie inventate di persone riconoscibili.
4. Concorda import di attributi temporanei col motore e del rapporto individuale con agente 09 tramite dati/adapter; nessuna scrittura fuori scope. Test di regressione e demo reali.

## Gate
Contratto coach/avatar e MORALE coach appartengono all'agente 09. Tu modelli **calciatori**, non le finanze o l'intero campionato. REPORT, PR, no merge autonomo.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
Il branch `agent/oronzo-attributes-r02` è identico a main e il REPORT disponibile è del ciclo 01. **Stato READY** per tratti e origini, 5000 cognomi verificati o pipeline con limiti espliciti, QA dei tratti e interfacce. Nessuna modifica a CoachV2, morale dell'allenatore o UI; report e PR prima di richiedere merge.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#31](https://github.com/CzekUns/cercax/pull/31). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** QA compatibilità con shout del 06: 08 usa regione/macroregione e gentle/hard, 06 usa regionId/macroRegion e encourage/harsh. Non contare due volte effetti né spacciare 20 cognomi demo per 5000.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #31**, stesso branch `agent/oronzo-attributes-r02`. **Priorità P1 dopo #30/#32**. R04 **R04-3/4**: origini e fiducia hanno forma diversa da 06, e `08.applyShout` può sommare morale/fiducia e bonus 180s a quello del motore 06 (150s). Il doppio effetto nel runtime finale è un rischio **inferito**, non ancora osservato in un gioco integrato.
**Correzioni dell'08, coordinate con 06/09:**
1. Documentare come **fonte canonica PlayerV2**: `origin:{comune,regione,macroregione}`, `relationships.coachTrust`, tratti mentali e origine ignota `null`. Concordare il mapping testabile verso input 06: nomi italiani regione/macroregione, tono `gentle/hard` versus `encourage/harsh`. Non fabbricare origini per save legacy.
2. Rimuovere l'ambiguità di `applyShout`: **non** applicare un secondo bonus temporaneo a un evento `coach_shout` già risolto dal 06. Se l'API resta disponibile per eventi non di partita, esplicitarne lo scope; esportare, se utile, un'applicazione persistente *solo dei delta già decisi*, con `eventId` stabile, coordinata con 09 e senza ricalcolare. Niente modifica del morale allenatore dentro 08.
3. Test incrociati sulle stesse fixture reali usate dal 06, fiducia/affinità/tone e due snapshot/reload; verificare che durata e rapporti non si raddoppino.
4. **Dataset MVP aggiornato dall'utente:** **500 cognomi italiani distinti e verificati** sono sufficienti alla prima release; **5.000** restano obiettivo successivo. La ricerca spetta all'**automazione oraria** nel branch `data/oronzo-world-research`, `oronzo/data/research/`. L'08 deve preparare/importare/validare, dopo review/merge della PR dati, il catalogo con fonte/licenza/ID e deduplica: non ricercarlo su un branch concorrente e non spacciar per 500 i 20 comuni cognomi campione della PR attuale. Rarità solo se ranking verificato.
5. Aggiornare REPORT e PR #31 esistente. Rimanere nello scope 08, no merge e no nuovo ciclo autonomo.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**Iniziare ORA sulla PR #31 esistente insieme al 06**; HEAD iniziale `979cde10412d0b67aab616653616205e444de8fa`, il blocco R04-3/4 non è ancora stato chiuso. Rendi espliciti e testati i campi canonici persistenti `origin:{comune,regione,macroregione}`, `relationships.coachTrust` e tono `gentle|hard` più mapping verso `encourage|harsh`; supporta origine ignota `null`, senza inventare biografie. Non riapplicare `applyShout` come secondo bonus temporaneo se l'engine 06 ha già risolto `coach_shout`: 06 calcola l'effetto 150s, 09 applica delta permanenti/idempotenza (no 180s aggiuntivi). Test su stessa fixture reale di 06, trust estremo, regione/macro, retry e reload, report con contratto univoco e API verso flow 07.
**Dati M1:** 500 cognomi italiani verificati bastano al primo rilascio (5000 solo espansione). L'automazione oraria scrive la PR dati incrementale `oronzo/data/research/`; NON duplicare raccolta/scraping né spacciare il campione 20 per 500. Prepara l'importatore, poi dopo merge della PR dataset aggancia 500 voci con fonte/licenza/ID, senza rigenerare identità persistenti. REPORT aggiornato e **stessa PR #31**.
