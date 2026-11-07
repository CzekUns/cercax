# NEXT — AGENTE 08 · PERSONAGGIO GIOCATORE, REGIONALITÀ E NOMI · VISIONE v0.2
**Stato:** `WAIT_REVIEW` — PR R02 consegnata, revisione/merge affidati a Work 00 su mandato R04.
**Precedente:** PR #16 MERGIATA (389dce444a7f7c19254381bfda2205acc4268f51).
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-attributes-r02` da ultimo main.
**Scope:** `oronzo/systems/attributes/` e proprio REPORT.

## Attività
1. Mantieni `PlayerV1` compatibile; estendi in modo esplicito e validato con tratti giocatore `pazzia`/impulsività, `spericolatezza`, fortuna e mentalità storiche già concordate, insieme a comune/regione/macroregione di origine. Tratti su scala stabile e con effetti numerici testabili in allenamento, fatica, risposta a incoraggiamento/rimprovero; non aumentare artificialmente le abilità calcistiche per etichetta.
2. Prepara pipeline per un set fino a **5000 cognomi italiani dei meno diffusi**, con fonte reale, anno/licenza, duplicati/varianti e ranking documentati. Non fabbricare frequenze; se non è disponibile una fonte che permetta il riuso, consegna loader/generatore con dataset campione verificato e segnala il limite invece di dichiarare 5000 completati.
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
