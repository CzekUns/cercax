# ORONZO — CODA DI REVISIONE DELL'ORCHESTRATORE

## AGGIORNAMENTO ORCHESTRATORE — 7 novembre 2026, post audit R02 e Partita rapida

**Questa sezione è lo stato più recente e prevale su tutte le tabelle storiche successive.** Integrate su main:
- [PR #20](https://github.com/CzekUns/cercax/pull/20) — Coerentizzatore R02, `7212806be066c971a5479df162a2e60816fb1fcd`, cinque P1 di carriera/società; incarichi assegnati negli [agenti 07](07-career/NEXT.md) e [09](09-coach-club/NEXT.md).
- [PR #15](https://github.com/CzekUns/cercax/pull/15) — renderer match 22 giocatori, merge `9dc68d21c6700d856104a1d3820b4dab1a00f83f`. Risolto ORZ-P1-009 (tutti i `facing` numerici sono angoli in radianti), verificato in V8 su orientamenti e intervallo.
- [PR #18](https://github.com/CzekUns/cercax/pull/18) — motore 11v11 deterministico, merge `d98a2226e74b6083e4b0d085bb4d2fca8eea9902`.
- [PR #21](https://github.com/CzekUns/cercax/pull/21) — schermata Partita rapida autonoma, merge `a0c2f9a89e76c301d1d834cc326d8e3bd1c25aac`; route `oronzo/partita-rapida.html`, pulsante nella home e sei test smoke allegati. **GitHub Pages deployment concluso con successo** per il commit. Browser/touch Android non ancora collaudati.

**Smoke orchestratore realmente eseguito in V8 su codice vero engine:** 22 giocatori, tacticChange e substitution accettate, pausa/velocità, 90 minuti completi, risultato 0–2 coerente con due eventi goal. **Non** equivale a test Node nativo su checkout o E2E browser. Fino a QA su smartphone la pagina è una **prima versione da collaudare**, non una release stabile.

**PR ancora aperta**: [#12](https://github.com/CzekUns/cercax/pull/12) cutscene (draft). Da rivedere prima del merge; la partita rapida usa overlay di fallback fino all'integrazione.

**R02 P1 aperti, assegnati a 07/09 (in corso):** stabilità dei presidentId canonici, enum obiettivi carriera/board, stipendi iniziali non zero, settimana assoluta attraverso rollover, preservazione employmentHistory del mister dopo save/load. Il primo match singolo può funzionare indipendentemente da queste incompatibilità.

**Coerentizzatore:** stato `COMPLETED_R02`, nessuna nuova sessione Work autorizzata.


**STATO CORRENTE — 7 novembre 2026, revisione manuale su GitHub (prevale sui resoconti storici sottostanti).**
La modifica dello stato di una PR è verificata dagli esiti della chiamata `merge_pull_request` con `expected_head_sha`. Sono stati esaminati scope e report degli agenti; per UI/sprite/cutscene sono stati aperti anche PNG reali. Le suite Node riportate dagli agenti non sono state tutte rieseguite dalla chat orchestratore a causa dell'accesso limitato al clone remoto. **Moduli mergiati in main ≠ funzionalità già cablate in `oronzo/game.js`.**

| PR | Agente | Stato corrente e gate QA | Merge |
|---|---|---|---|
| [#6](https://github.com/CzekUns/cercax/pull/6) | 01 · Sprite | Merge 3585b395; manifest/palette, QA agente, preview grafica esaminata; prossimo ciclo READY | SÌ |
| [#12](https://github.com/CzekUns/cercax/pull/12) | 02 · Cutscene | **OPEN DRAFT**, 5 strip, maschere, QA strutturale, preview visiva; richiedere review finale/chiusura draft, prova browser quando possibile | NO |
| [#5](https://github.com/CzekUns/cercax/pull/5) | 03 · UI | Merge ad84dd13; 8 schermate PNG reali, tre viste controllate; serve separazione layer dinamici nel ciclo successivo | SÌ |
| [#13](https://github.com/CzekUns/cercax/pull/13) | 04 · Copy | Merge 065dc4ee; 23 personaggi, 8 presidenti, 73 eventi, 42 dialoghi, JSON controllati; audit integrazione Work R02 in attesa | SÌ |
| [#15](https://github.com/CzekUns/cercax/pull/15) | 05 · Match View | **OPEN FIX_REQUESTED**: bug nuovo `resolveFacing(±1)` vs `facing` in radianti da PR #18; commento pubblicato su PR #15 e NEXT aggiornato | NO |
| [#18](https://github.com/CzekUns/cercax/pull/18) | 06 · Match Engine | **OPEN WAIT_REVIEW**: fix P1 descritti dall'agente e 17 test V8 dichiarati passati; serve un test reale combinato con PR #15 dopo correzione | NO |
| [#14](https://github.com/CzekUns/cercax/pull/14) | 07 · Career | Merge bb9e3847; agente riporta 11 test Node PASS e salvataggio robusto; R02 Work verificherà integrazione con ClubV1 | SÌ |
| [#16](https://github.com/CzekUns/cercax/pull/16) | 08 · Attributes | Merge 389dce44; audit R01 pronto per QA e 15 test agente passati, storico non ancora collegato a partita | SÌ |
| [#17](https://github.com/CzekUns/cercax/pull/17) | 09 · Coach/Club | Merge 7309f1fe; fix importi/NaN con 9 nuovi test Node PASS riportati, rapporto 14 test V8 PASS; integrazione con carriera da verificare | SÌ |
| [#19](https://github.com/CzekUns/cercax/pull/19) | Coerentizzatore | Merge e3e1b85c; R01 archiviato su main, R02 preparato ma NON eseguito | SÌ |

## Bloccanti/priorità ancora aperti

- **ORZ-P1-009 — VISTA #15 / MOTORE #18, verificato staticamente:** engine `movement.js` emette `facing` in radianti (0,π,atan2) e il renderer `interpolation.js` tratta 1/-1 ancora come segni E/W. Test del renderer `compatibility.test.mjs` rispecchia convenzione obsoleta. Dovrà interpretare ogni `number` finito come radianti, verificare i vettori cardinali e cross-testare output reali. [NEXT agente 5](05-match-view/NEXT.md). Non mergiare #15 prima del fix.
- **ORZ-INT-001 — integrazione runtime NON COMPLETATA:** asset, dati e sistemi ora su main non sono automaticamente richiamati dal vecchio `oronzo/game.js`; pianificare un vertical slice con engine #18 + match-view #15, UI dinamica e contenuti, in commit esclusivi dell'orchestratore dopo QA.
- **ORZ-INT-002 — integrazione carriera/club/copy NON VERIFICATA:** possibili scarti `presidentId`, `seasonObjective`, modello mutabile e retribuzioni. L'incarico [Work R02](coerentizzatore/REQUEST.md) è stato preparato ed è in attesa di attivazione esplicita.
- **Cutscene #12:** PR ancora draft; non fare merge fino al gate di review finale. QA PNG/cutscene strutturale dichiarata; test Chromium su smartphone non completato.

## Archivio dei controlli precedenti (stato storico: prevale la tabella corrente)

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

## Revisione R05 — 7 novembre 2026, controllo di coerenza del registro
- Riletti i 9 NEXT su `main` e verificata l'assenza dei 9 REPORT.md sui branch degli agenti. Le PR #5,#6,#12,#13,#14,#15,#16,#17,#18,#19 risultano ancora aperte, con HEAD identici alla R03/R04; #12 è draft. Le 9 issue di sviluppo sono accessibili. Nessun nuovo fix consegnato.
- **Correzione documentale:** la riga PR #17 nella tabella di questa coda riportava ancora `WAIT_REVIEW` nonostante il NEXT dell'agente 09 fosse già `FIX_REQUESTED` per ORZ-P1-008 dalla R03. Ora allineata senza creare un nuovo difetto.
- Ispezione statica aggiuntiva di `career.js`, `league.js`, `progression.js`, `save.js` della PR #14 e `finance.js` della PR #17: nessun nuovo difetto con prova sufficiente da assegnare in questo ciclo; il bug finanziario già registrato resta aperto. Non sono stati eseguiti test runtime né controlli visivi, e non sono stati fatti merge o modifiche al gioco.

