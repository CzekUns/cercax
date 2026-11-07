# NEXT — AGENTE 04 · COPY, STAMPA E DIALETTI · VISIONE v0.2
**Stato:** `BLOCKED` — prevale la direttiva R05 in fondo al documento; lavoro R02 nella PR esistente.
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

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#34](https://github.com/CzekUns/cercax/pull/34). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** QA schema/selector/risposte, sample editoriale e storicità 1979; stile narrativo ancora in discussione con l'utente: non dichiararlo definitivo.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #34 VERIFICATA E MERGIATA** su `main` (HEAD `b74c376f1045e8b95c3cb4c5c21258a7df33087d`; merge `b8976cb2b0129de9ee6537e1d624abce9ff1402f`). Work 00 ha rieseguito i due validatori, e l'orchestratore ha verificato che cinque principali file content siano SHAs identici su main e branch.
**Ciclo R02 chiuso tecnicamente.** Non correggere la PR #34 già merged e non ricominciare da zero. I 37/32 quesiti, 12 giornalisti, 8 TV e 80 battute diventano API/contenuti disponibili agli altri agenti. **Stato BLOCKED per nuovi contenuti creativi**: l'utente sta scegliendo tono dialoghi e situazioni; non imporre uno stile come approvato. Eventuale ciclo R03 editoriale/integrazione contenuti si autorizza con un futuro NEXT dopo decisioni esplicite e QA del runtime. L'applicazione effetti è di 09, flow 07, rendering 03, non del coordinatore.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**Nessuna attività produttiva ora.** PR #34 è **MERGED** (`b8976cb2b0129de9ee6537e1d624abce9ff1402f`) e dati, question-bank e API sono su `main`. Questo è un risultato tecnico, non approvazione artistica definitiva. L'utente sta ancora discutendo qui lo stile comico (commedia italiana anni Settanta, personaggi ricorrenti, situazioni con conseguenze). **Aspetta la bibbia dialoghi approvata** prima di nuovo ciclo copy; non alterare contenuti già mergiati o creare PR R03. Se i consumer 07/09/03 riportano un bug negli ID/JSON, segnalare a 10 la proposta di fix isolato.
