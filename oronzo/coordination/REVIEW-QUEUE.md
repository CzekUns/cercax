# ORONZO — CODA DI REVISIONE DELL'ORCHESTRATORE

**Verifica GitHub:** 7 novembre 2026, prima revisione oraria. Stato delle PR rilevato live; tutti gli HEAD devono essere ricontrollati prima del merge. Nessuna PR di produzione approvata o mergiata in questa revisione.

| PR | Agente | Stato QA | Merge |
|---|---|---|---|
| [#6](https://github.com/CzekUns/cercax/pull/6) | 01 · Sprite | WAIT_REVIEW; QA grafica/palette/manifest non eseguita; mergeable=false | NO |
| [#12](https://github.com/CzekUns/cercax/pull/12) | 02 · Cutscene | WAIT_REVIEW; QA frame, maschere, trigger non eseguita; mergeable=false | NO |
| [#5](https://github.com/CzekUns/cercax/pull/5) | 03 · UI | WAIT_REVIEW; QA 16:9, touch, componenti non eseguita; mergeable=false | NO |
| [#13](https://github.com/CzekUns/cercax/pull/13) | 04 · Copy | FIX_REQUESTED; manca presidents.json nel branch; mergeable=false | NO |
| [#15](https://github.com/CzekUns/cercax/pull/15) | 05 · Match View | FIX_REQUESTED dopo audit R01; mergeable=true ma incompatibilità P1 | NO |
| [#18](https://github.com/CzekUns/cercax/pull/18) | 06 · Match Engine | FIX_REQUESTED dopo audit R01; mergeable=true ma incompatibilità P1 | NO |
| [#14](https://github.com/CzekUns/cercax/pull/14) | 07 · Career | WAIT_REVIEW; QA salvataggi/calendario non eseguita; mergeable=false | NO |
| [#16](https://github.com/CzekUns/cercax/pull/16) | 08 · Attributes | WAIT_REVIEW; audit R01: ready for orchestrator QA, non ancora approvata; mergeable=true | NO |
| [#17](https://github.com/CzekUns/cercax/pull/17) | 09 · Coach/Club | WAIT_REVIEW; QA economia/presidenti non eseguita; mergeable=false | NO |
| [#19](https://github.com/CzekUns/cercax/pull/19) | Coerentizzatore | Rapporto R01 di sola documentazione; mergeable=true; rapporto letto, non ancora mergiato | NO |

## Difetti registrati (ID stabili)

| ID | Gravità | Verifica | Responsabile | Intervento | Stato |
|---|---|---|---|---|---|
| ORZ-P1-001 | P1 | Audit R01 riproduce `facing=1/-1` motore interpretato come radianti dalla vista: orientamento diagonale scorretto | 05+06 | Definire e testare direzione/vettore espliciti | FIX_REQUESTED |
| ORZ-P1-002 | P1 | Audit R01 riproduce interpolazione del portiere attraverso il campo tra 2699 e 2700 | 05 | Resettare blend al kickoff/cambio tempo, test anche dopo gol | FIX_REQUESTED |
| ORZ-P1-003 | P1 | Audit R01: `technical.decisions` ignorato perché il motore legge `mental.decisions`; fitness e health graduati non influenzano il risultato | 06, coordinamento 08 | Lettura schema corretta, modificatori effettivi, test deterministici | FIX_REQUESTED |
| ORZ-P1-004 | P1 | Audit R01: sostituzione presente nel log ma non nello snapshot successivo; keeper ID nella vista da aggiornare | 06+05, runner | Feed cursor `getEventsSince(lastId)` e aggiornamento portieri | FIX_REQUESTED |
| ORZ-P1-005 | P1 | Audit R01: `goal.detail.assistId` non emesso, storico #16 non registra assist | 06, coordinamento 08 | Assist opzionale tracciato per stessa azione, test | FIX_REQUESTED |
| ORZ-P2-001 | P2 | Audit R01: `energy` motore 0–100, vista clamp 0–1 | 05 | Normalizzare in renderer prima della UI | FIX_REQUESTED |
| ORZ-P1-006 | P1 | Verificato su HEAD PR #13: elenco file non contiene `oronzo/content/presidents.json` (404), obbligatorio nel narrative-contract | 04 | Aggiungere >=8 presidenti originali e integrazione con PresidentProfileV1 | FIX_REQUESTED |
| ORZ-P1-007 | P1 | 7 PR di produzione risultano `mergeable=false` (5,6,12,13,14,17; ricontare live): la causa precisa non è stata isolata | Agenti interessati/orchestratore | Verificare conflitti reali, aggiornare branch senza sovrascrivere altri agenti; nessun merge cieco | DA VERIFICARE |

**Nota ORZ-P1-007:** elenco corretto rilevato: **sei** PR (#5, #6, #12, #13, #14, #17), non sette. `mergeable=false` può dipendere da conflitti: la causa richiede diff/controllo ulteriore. Non trattare come prova di regressione del codice.

## Audit Work R01
Il rapporto è stato creato nella [PR #19](https://github.com/CzekUns/cercax/pull/19), branch `audit/oronzo-coerentizzatore-r01`, HEAD `041ad5dfae72b4409ff4a8a06fba34fc002f0031`. Test **riportati dal revisore Work**: Node 24.22.1, 39 passati/0 falliti, smoke cross-module; non rieseguiti dall'orchestratore in questa revisione. L'audit conclude `needs changes` per #15/#18, `ready for orchestrator QA` per #16, nessun P0 nel perimetro verificato. Nessuna verifica visiva smartphone.

## Procedura
1. Controllare file modificati, scope, dipendenze e test di ogni PR prima del merge.
2. Richiedere correzioni su branch esistente per i P1, aggiornare REPORT.md degli agenti; evitare duplicazioni.
3. Verificare di persona i test e il renderer reale; soltanto allora approvare e integrare.
4. Dopo merge registrare SHA e aggiornare NEXT.md su main con nuovo incarico.
5. Non avviare Work automaticamente; l'incarico R01 è già stato eseguito e la sua PR è in revisione. Non aprire audit duplicati.
