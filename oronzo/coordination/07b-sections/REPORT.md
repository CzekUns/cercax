# ORONZO · AGENTE 07-BIS — REPORT FINALE U1–U9 (UNICA ESECUZIONE R11)

**Stato:** DELIVERY_COMPLETE_FOR_INDEPENDENT_AUDIT · PR APERTE · **NESSUN MERGE** · 9 novembre 2026.  
**Identità:** ORONZO-AGENT-07B (Agente 07-bis; sostituto tecnico Career07 come da NEXT aggiornato).  
**Mandato:** R11_SINGLE_DISPATCH_FULL_INTEGRATION, issue #62; responsabilità UI e adapter Career07, formule degli owner 05/06/08/09 inalterate.

## PR e HEAD (al completamento del codice)

| Sottosistema | PR | HEAD del codice | Stato |
| --- | --- | --- | --- |
| UI/sezioni/partita/nav e fix R11-QA-01 | [#63](https://github.com/CzekUns/cercax/pull/63) | `8fd4df94cc477d909f165cffecaeeb07f8871f81` | OPEN, no merge |
| Backend Flow07: salvataggi + stadio/09/mercato/fiducia | [#66](https://github.com/CzekUns/cercax/pull/66) | `575f8c56cf477833e0b8dbfced407a83e2265f2f` | OPEN, no merge |
| Checkout **combinato di QA** #63+#66 (non usare come PR per merge) | [#67](https://github.com/CzekUns/cercax/pull/67) | `b2209762cd600425b9311a610bb8c8f946ace9e4` | OPEN, DRAFT, no merge |

Main di confronto: `62c2e24b50c2189e952b628f1f0dbf1f38770e86`. La #63 è rimasta la PR UI esistente. La #66 nasce separata dall'ultimo main. La #67 serve solo a collaudare entrambi gli insiemi contemporaneamente, senza eseguire merge delle due PR.

## Prova indipendente dal solo codice sorgente: Node + Chromium VERI

**Workflow GitHub Actions eseguito:** [R11 Combined U1–U9, run #42711637028](https://github.com/CzekUns/cercax/actions/runs/42711637028), su HEAD combinato `b2209762cd600425b9311a610bb8c8f946ace9e4`.  
**Esito osservato: 64/64 Node PASS · 74/74 controlli Chromium HTTP PASS · 0 FAIL · CI SUCCESS.**  
**Screenshot + risultati + snapshot di due stagioni:** [Artifact #13715589317](https://github.com/CzekUns/cercax/actions/runs/42711637028/artifacts/13715589317). Il browser ha caricato la UI reale e i PNG da un server HTTP, non mock HTML.

Suite Node nativa sul checkout combinato:
- oronzo/assets/ui/sections-r11/sections-r11.test.mjs
- oronzo/assets/ui/qa/ui12-landing-nav.test.cjs
- oronzo/app/flow/tests/r11-integration.test.mjs
- oronzo/app/flow/tests/m1-contract.test.mjs
- oronzo/app/flow/tests/m1-live.test.mjs
- oronzo/systems/coach-club/management-r10.test.js

QA Chromium: 640×360, 800×360, 844×390 e 960×400, touchscreen emulato; bottoni visibili misurati in-browser; screenshot dell'apertura con computer, ufficio, allenamento, Rosa filtrata, Stadio; a 640×360 anche Presidente, Mercato, Calendario, Lavagna, partita FULL/TV, pannello tattico, Giornali, ritorno partita/conferenza e salvataggio di due stagioni.

**Attenzione alla precisione:** il percorso browser di partita e operazioni gestionali approfondite è stato eseguito a 640×360; gli altri tre viewport hanno verificato apertura, offerte, allenamento RECUPERO73, save/reload, Rosa filtro GK/forma, tab Tifoseria e touch. Non è stato eseguito il playtest su smartphone fisico né test hardware notch/safe-area non simulabile dalla normale viewport. I dati test QA sono sintetici; la grafica reale viene comunque caricata dai PNG del repository.

## Matrice di consegna U1–U9

| Funzione | Verdetto tecnico interno | Evidenza reale / caveat |
| --- | --- | --- |
| **U1 · Allenamento** | **PASS** | Cinque piani reali controller07; intensità 0–100; il caso RECUPERO 73% rimane marcato e mostra 73 dopo reload in **tutte quattro** le viewport; blocco pianificazione doppia; nessun delta prima di advance; feedback distinto se salvataggio fallisce |
| **U2 · Save/Load** | **PASS** | Nuovo IndexedDB A/B con envelope SAVE_VERSION2, checksum, sequenze, readback prima del puntatore active, concorrenza serializzata. Fallback legacy locale in sola lettura e JSON import/export. Node fake-IDB verifica migrazione/errore; **Chromium reale** ha scritto due snapshot standard di fine anno **entrambi sopra 4 milioni di caratteri**, corrotto volontariamente il record attivo, recuperato 1979 e ripristinato 1980, poi ricaricato dal menu pubblico. Non cancella i vecchi backup. |
| **U3 · Stadio** | **PASS** | Gli stadi nascono solo per carriere nuove con policy marcata `synthetic_gameplay_r11`, indicata visivamente come **ipotesi di gioco, non dato storico**. Prezzo biglietti impostato da UI tramite Career07→setTicketPrice09, senza finto ricavo. Dopo partita casalinga realmente recensita dal presidente, settleHomeAttendance09 liquida una volta nel ledger; Node verifica **15 liquidazioni autentiche per stagione standard**, 30 in due, senza fixture ripetute. Vecchi save senza stadio rimangono in sola lettura: non ricevono capienza inventata. |
| **U4 · Presidente e mercato** | **PASS** | Scheda Presidente e mercato in UI, richieste e decisioni reali, prezzi/cassa, mandato, finestre di gameplay dichiarate. Node verifica rifiuti fuori finestra e senza mandato, acquisto **effettivamente approvato** con spostamento di un solo ID dalla rosa cedente alla ricevente, addebito e accredito **entrambi** verificati, contratto e replay anti-doppione; analogo test di **cessione effettivamente approvata** fra due club e reload. Browser verifica la navigazione delle pagine; l'intero percorso multistep di trattativa non è stato automatizzato tramite click Chromium, pur essendo gli handler UI collegati agli adapter Node provati. |
| **U5 · Fiducia giocatore** | **PASS** | Engine06 genera coach_shout accettato, Flow07B chiama Coach09 persistShout/reconcile una volta su evento autentico, registro permanente `fixtureId:eventId`; Node verifica player.relationships.coachTrust, stato `applied`, storico e save/reload. Bonus temporaneo resta del solo Engine06. Per vecchi PlayerV2 privi di trust canonico si conserva il pending invece di attribuire successo falso. |
| **U6 · Cognomi/comuni** | **PASS** | UI `newGame({surnameCatalog:BUILTIN_SURNAME_CATALOG})` usa i **600 cognomi documentati** dell'08; 500 comuni integrati preservati; player ID, surnameId/source, salari e origini note sopravvivono al salvataggio. Nessuna attribuzione inventata del luogo di nascita. |
| **U7 · Camera e partita** | **PASS** | Renderer05 `view.setCameraMode('full'|'broadcast')` invocato realmente da UI, controllo di snapshot invariato; canvas Engine06 con asset originali; modulo/pressing, sostituzioni, ordini `encourage/harsh` trasmessi a `commandM1Match` con requestId unico, rifiuti dal motore e ledger. Browser HTTP ha attraversato partita FULL→TV→pannello comandi→conferenza. Le singole sostituzioni sotto ogni asset non sono state tutte verificate manualmente su dispositivo fisico. |
| **U8 · Rosa, formazione, calendario** | **PASS** | Scheda con dati del calciatore e visual originale solo quando canonicamente disponibile, ruolo/forma/fiducia/status; Rosa filtrabile GK/DF/MF/FW e ordinabile nome/forma/fiducia, verificata Chromium. Lavagna da `formationAnchors` originali 06, titolari/riserva, modulo, avversario e indisponibilità. Calendario e classifica da fixture veri. Node verifica **2 stagioni complete 1979→1981**, 30 match veri del mister e 8 bye-week senza gara propria per stagione, salari/report/avanzamento e checksum. |
| **U9 · Agenda, Tifosi, Giornali** | **PASS** | Agenda derivata da coachWeekStatus e ledgers reali: allenamento, partita/preparazione, conferenza, bye advance con expectedAbsoluteWeek, presidente, mercato e salvataggio. Tre sottosezioni Stadio/Tifosi/Giornali leggono supporters, trust e domande/risposte stampa realmente registrate; nessun articolo presentato come esistente se non salvato. Navigazione e scorrimento reali verificati in Chromium. |

**PASS = gate tecnico interno sull'insieme integrato, NON certificazione autonoma di idoneità al merge.** La revisione indipendente ORONZO-Agent00 e il consenso del proprietario restano necessari.

## Errori rilevati e risolti durante questa singola esecuzione

1. Audit preesistente #64: RECUPERO73 riapriva EQUILIBRATO50, corretto leggendo la selezione persistente M1; test browser successivo PASS.
2. Save storico localStorage quota sett.31, evitato tramite due slot IndexedDB e migration read-only; test browser con due stati reali maggiori di 4MB + corruzione e recovery PASS.
3. Primo run Actions fallito per sintassi in uno script QA; corretto, senza alterare motore/gioco.
4. Un vecchio test M1 pretendeva status pending dopo shout; ora 09 applica correttamente trust. Il test è stato aggiornato a verificare il trust persistente. 
5. Primo script Chromium contava `.first()` come tutte e tre le schede Tifoseria: corretta asserzione. 
6. L'aggiornamento Rosa ha richiesto l'adeguamento della fixture isolata UI12; CI finale PASS.

## File/API modificati

**PR UI #63:**
- oronzo/assets/ui/career-r03.js, career-r03.html
- oronzo/assets/ui/sections-r11/sections.js, sections.css
- oronzo/assets/ui/sections-r11/management-ui.js, league-ui.js
- oronzo/assets/ui/qa/ui12-landing-nav.test.cjs, r11-combined-browser.mjs
- oronzo/coordination/07b-sections/REPORT.md (questo documento)

**PR backend #66:**
- oronzo/app/flow/durable-save.js (nuovo manager IndexedDB)
- oronzo/app/flow/management-r11.js (adapter stadio/presidente/mercato e source policy)
- oronzo/app/flow/controller.js (aggancio stadio, liquidazione dopo fixture/review, fiducia post-match, export di adapter)
- oronzo/app/flow/tests/r11-integration.test.mjs
- oronzo/app/flow/tests/m1-live.test.mjs (aggiornamento contratto per port 09)

**Solo branch QA #67:** copia dei file UI e backend per eseguire tutto insieme + .github/workflows/oronzo-r11-combined-qa.yml. La PR #67 è **DRAFT e NON VA MERGIATA**.

Nessuna modifica ai calcoli/algoritmi degli owner 05, 06, 08, 09; il modulo 09 determina tutti gli esiti economici e di fiducia.

## Limiti non coperti dal PASS interno

- **NON PROVATO:** smartphone Android reale, notch e safe-area fisica, Play Store/PWA installabile. Le geometrie touch sono misurate solo in Chromium emulato; va eseguito playtest utente con Agente12 per eventuali correzioni visive.
- **NON PROVATO PUBBLICAMENTE:** GitHub Pages `main` attualmente non contiene questi branch. Un pass di QA su branch non equivale a rilascio disponibile online.
- **UI Mercato:** la disponibilità degli handler e delle transazioni è provata rispettivamente in sorgente/Node, la navigazione in Chromium; non è stato costruito un E2E Chromium che faccia approvare una trattativa multi-click completa. Il contratto di acquisto/cessione è invece provato end-to-end in Node reale.
- **Game-over UI e unemployment in browser:** i moduli esistenti sono preservati; questa suite aggiuntiva non ha ripetuto tutte le transizioni di game-over su Chromium.
- **Dati storici:** condizioni, capienze e finestre di mercato sono **regole sintetiche di gameplay** dichiarate, non ricostruzioni d'epoca.
- **Distribuzione:** se l'audit00 boccia un layout o un edge case, richiedere fix nella PR di proprietà corrispondente; non bypassare il gate.

## Richiesta unica ad AGENTE00 / ORCHESTRATORE 10-bis

Eseguire **una sola revisione indipendente finale** del checkout combinato PR #67, verificare i commit/CI/screenshot e i contratti U1–U9; controllare diff di PR #63 e #66 separatamente e per eventuali conflitti, inclusa la sicurezza dei salvataggi e il veto sui vecchi backup. Non approvare implicitamente il merge solo per il PASS interno. Dopo l'esito indipendente, l'orchestratore propone al proprietario l'ordine di merge; **Agente07B non ha effettuato merge**.
