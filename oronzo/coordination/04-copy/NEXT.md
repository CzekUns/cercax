# NEXT — AGENTE 04 · COPY, STAMPA E DIALETTI · VISIONE v0.2
**Stato:** `READY` per ciclo contenutistico indipendente R02 dopo PR #13 MERGIATA (065dc4ee7e59e26612b14c471b9c2be99f43cad1).
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-copy-r02` dall'ultimo main.
**Scope:** `oronzo/content/` e proprio REPORT.

## Task
1. Aggiungi un pacchetto JSON originale per **conferenza di avvio** (pool almeno 30 domande contestuali con 3 o più risposte) che consenta 5 domande seeded senza ripetizioni. Aggiungi conferenze **postpartita** con almeno 20 domande orientate a vittoria/pareggio/sconfitta e opzioni di risposta.
2. Popola almeno 12 giornalisti grotteschi e 8 emittenti TV private fittizie, con nomi anni '70-'80, evitando nomi registrati o persone effettive. Le risposte indicano delta semantici per morale coach, tifosi, reputazione media e rapporto presidente, usando uno schema JSON dichiarato e verificato; l'agente 09/10 realizza applicazione degli effetti.
3. Prepara battute di incoraggiamento e rimprovero a singoli giocatori: italiano standard completo e prime varianti regionali **solo** dove lessico verificato / revisione competente. Non inventare parole attribuendole a un dialetto. Specifica intensità e fonte linguistica quando applicabile.
4. Scrivi validator con determinismo e compatibilità dei JSON preesistenti; non alterare gli 8 `presidents.json` o altri ID senza motivazione verificata.

## Gate
Solo contenuto/JSON e demo di lettura nella tua directory. Il comportamento economico, tifosi, morale e engine è proprietà degli agenti 09/06 e dell'integratore 10. Non modificare root runtime. REPORT con file/test, PR senza merge.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
Il branch `agent/oronzo-copy-r02` mostra **1 commit avanti a main**, limitato a `oronzo/content/press-media.json`. È evidenza di lavoro iniziato ma **non di consegna**: nessuna nuova PR né REPORT R02 rilevati. Completa question bank, controlli degli ID e validazione prima di chiedere review. Il runtime degli effetti è proprietà 09/07/03: non assegnarlo al coordinatore.
