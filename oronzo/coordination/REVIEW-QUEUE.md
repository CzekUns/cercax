# ORONZO — CODA DI REVISIONE DELL'ORCHESTRATORE

**Verifica GitHub:** 7 novembre 2026, seconda revisione oraria. Controllati gli endpoint REST diretti `GET /pulls/{n}` per PR #5,#6,#12,#13,#14,#15,#16,#17,#18,#19: **tutte `mergeable=true`, `mergeable_state=clean`**. L'endpoint sintetico `get_pr_info` restituisce `mergeable=false` per le stesse PR: il campo sintetico è incoerente e non va usato per diagnosticare conflitti. Nessun merge o test di codice eseguito in questa revisione.

| PR | Agente | Stato QA | Merge |
|---|---|---|---|
| [#6](https://github.com/CzekUns/cercax/pull/6) | 01 · Sprite | WAIT_REVIEW; QA grafica/palette/manifest non eseguita; REST mergeable=clean | NO |
| [#12](https://github.com/CzekUns/cercax/pull/12) | 02 · Cutscene | WAIT_REVIEW; QA frame, maschere, trigger non eseguita; REST mergeable=clean | NO |
| [#5](https://github.com/CzekUns/cercax/pull/5) | 03 · UI | WAIT_REVIEW; QA 16:9, touch, componenti non eseguita; REST mergeable=clean | NO |
| [#13](https://github.com/CzekUns/cercax/pull/13) | 04 · Copy | FIX_REQUESTED; manca presidents.json nel branch; REST mergeable=clean | NO |
| [#15](https://github.com/CzekUns/cercax/pull/15) | 05 · Match View | FIX_REQUESTED dopo audit R01; REST mergeable=clean ma incompatibilità P1 | NO |
| [#18](https://github.com/CzekUns/cercax/pull/18) | 06 · Match Engine | FIX_REQUESTED dopo audit R01; REST mergeable=clean ma incompatibilità P1 | NO |
| [#14](https://github.com/CzekUns/cercax/pull/14) | 07 · Career | WAIT_REVIEW; QA salvataggi/calendario non eseguita; REST mergeable=clean | NO |
| [#16](https://github.com/CzekUns/cercax/pull/16) | 08 · Attributes | WAIT_REVIEW; audit R01: ready for orchestrator QA, non ancora approvata; REST mergeable=clean | NO |
| [#17](https://github.com/CzekUns/cercax/pull/17) | 09 · Coach/Club | WAIT_REVIEW; QA economia/presidenti non eseguita; REST mergeable=clean | NO |
| [#19](https://github.com/CzekUns/cercax/pull/19) | Coerentizzatore | Rapporto R01 di sola documentazione; REST mergeable=clean; rapporto letto, non ancora mergiato | NO |

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
| ORZ-P1-007 | P2 (metadati) | **Rettificato:** l'endpoint sintetico riportava `mergeable=false`, ma REST diretto conferma `mergeable_state=clean` per tutte e 10 le PR, senza conflitti correnti | Agenti interessati/orchestratore | Non assegnare lavoro di risoluzione conflitti inesistenti. Rifare REST GET /pulls/{n} prima di ogni merge; QA codice e dipendenze ancora necessaria | RETTIFICATO: NO CONFLITTI REST |

**Nota ORZ-P1-007:** l'incoerenza è del campo `mergeable` restituito da `get_pr_info` rispetto all'endpoint REST diretto, non un conflitto del codice. Le 10 PR sono `clean` secondo REST (stato volatile). La PR #12 è ancora **draft**, e `clean` non significa pronta alla QA.

## Audit Work R01
Il rapporto è stato creato nella [PR #19](https://github.com/CzekUns/cercax/pull/19), branch `audit/oronzo-coerentizzatore-r01`, HEAD `041ad5dfae72b4409ff4a8a06fba34fc002f0031`. Test **riportati dal revisore Work**: Node 24.22.1, 39 passati/0 falliti, smoke cross-module; non rieseguiti dall'orchestratore in questa revisione. L'audit conclude `needs changes` per #15/#18, `ready for orchestrator QA` per #16, nessun P0 nel perimetro verificato. Nessuna verifica visiva smartphone.

## Procedura
1. Controllare file modificati, scope, dipendenze e test di ogni PR prima del merge.
2. Richiedere correzioni su branch esistente per i P1, aggiornare REPORT.md degli agenti; evitare duplicazioni.
3. Verificare di persona i test e il renderer reale; soltanto allora approvare e integrare. Per i conflitti usare **REST diretto** e non il campo sintetico.
4. Dopo merge registrare SHA e aggiornare NEXT.md su main con nuovo incarico.
5. Non avviare Work automaticamente; l'incarico R01 è già stato eseguito e la sua PR è in revisione. Non aprire audit duplicati.

## Revisione oraria R02 — rettifica conflitti e report
- REST diretto `GET /repos/CzekUns/cercax/pulls/{n}`: PR #5,#6,#12,#13,#14,#15,#16,#17,#18,#19 tutte `mergeable=true` / `mergeable_state=clean`; PR #12 è draft. Questo corregge il precedente falso allarme sulle sei PR conflittuali. Non è stato fatto alcun merge.
- I 9 `NEXT.md` sono presenti e coerenti con le richieste precedenti; nessuno dei 9 `REPORT.md` risulta presente **sul branch originale** al momento del controllo (404), quindi rimane obbligatorio consegnarli prima di approvare la PR.
- Nessun HEAD delle PR #14–#19 è cambiato rispetto alla revisione R01; per #5/#6/#12/#13 gli HEAD attuali sono rispettivamente `f87fafe9`, `c456f65e`, `d2c58d2c`, `8d215c53`. Le richieste P1 dell'audit R01 rimangono aperte in assenza di nuovi commit.
- PR #13: elenco diff ancora senza `oronzo/content/presidents.json`, difetto ORZ-P1-006 confermato. Tutte le PR limitano i file modificati a `oronzo/**` secondo la lista diff; non è QA di contenuto.

## Revisione R03 — 7 novembre 2026, controllo di sicurezza economica
- **ORZ-P1-008 — P1 · PR #17 / agente 09 / FIX_REQUESTED.** Esame statico del commit `e5ea061e90371ca507e91bd04169dd408093c71e`, file `oronzo/systems/coach-club/finance.js`: `book()` chiama `integer(amount)` ma non impone `amount >= 0`; un input `{type:'expense',amount:-100}` segue il ramo `paid=Math.min(amount,c.finance.cash)` e `c.finance.cash -= paid`, **aumentando** il denaro. Lo stesso vale per entrate negative e per parametri `bonus`/`otherIncome` e costi iniziali privi di guardia di segno. Evidenza: flusso del codice; **non è stato eseguito un test runtime**. Richiesto all'agente 09 sul suo NEXT: rifiutare importi negativi e verificare i limiti degli interi sicuri, aggiungere test regressione per `book`, `settleWeek`, `initializeFinances`. PR non mergiata.
- Le 10 PR (#5,#6,#12,#13,#14,#15,#16,#17,#18,#19) restano aperte e **gli HEAD sono invariati** rispetto a R02. #12 è draft. Tutti i nove `NEXT.md` riletti, nessuno dei nove `REPORT.md` presente sui branch delle PR. Le nove issue di agente #1,#2,#3,#4,#7,#8,#9,#10,#11 consultate. Non ripetere audit Work R01.
- Nessun merge, nessuna esecuzione di test runtime e nessuna modifica al codice di gioco durante R03. Prossimo passo: ricevere test e fix da agente 09 e da agenti 05/06, quindi verificare QA integrata prima del merge.
