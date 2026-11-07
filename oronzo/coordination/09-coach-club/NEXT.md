# NEXT — ORONZO AGENTE 9 · CORREZIONI DA AUDIT R02

**Stato:** `READY`
**Incarico:** secondo ciclo, correzioni e test di compatibilità documentate dal Coerentizzatore.
**Origine:** [Rapporto Work R02](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/coerentizzatore/REPORT-R02.md), mergeto su main commit `7212806be066c971a5479df162a2e60816fb1fcd`.
**Precedente PR:** #17, merge `7309f1fe`.
**Scope modificabile:** `oronzo/systems/coach-club/` e il tuo `REPORT.md`.

## Azioni autorizzate
Riparti dall'ultimo `main` in un nuovo branch di ciclo `agent/oronzo-coach-club-r02`. Implementa e testa:
1. **R02-1: board/club devono risolvere `presidentId` canonico del club e rifiutare profili incoerenti nei verbali; non associare personaggi sbagliati.**
2. **R02-2: `seasonObjective` enum tradotti esplicitamente prima di `reviewMatch`, mai fallback nascosti o soglie diverse.**
3. **R02-3: payroll settimanale usa `contract.weeklyWage` dei giocatori forniti dalla carriera, controlla budget, arretrati e rifiuta importi non validi.**
4. **R02-4: riunioni, spese settimanali, promesse ed idempotenza usano `absoluteWeek` o chiavi anno/settimana, così rollover non blocca il secondo anno.**
5. **R02-5: `createCoach` deve preservare `employmentHistory`, `hiredSeason` e i campi contratto necessari al salvataggio e agli esoneri.**

## Coordinamento
L'altro agente (07/09) lavora su API/contratto complementari. Non modificare il suo codice. Se serve un adapter condiviso, documenta precisamente input/output e proprietà dello stato in `integration-notes.md`; il runner centrale sarà costruito dall'orchestratore. Il catalogo `oronzo/content/presidents.json` è autorevole e già su main; non duplicare i presidenti.

## Verifica/accettazione
- Test nativi Node; includere almeno un test incrociato con **due stagioni** e salvataggio/ricarica.
- Presidenti stabili con ID esistente; board e testi dello stesso presidente; obiettivi equivalenti; payroll > 0 per club con contratti, niente spese negative; settimane del secondo anno accettate una volta sola; esonero senza TypeError dopo save/load.
- Conserva le API precedenti dove possibile, segnala breaking changes.
- Scrivi `oronzo/coordination/09-coach-club/REPORT.md` sul branch, apri PR a main, **non fare merge**.


---

## DIRETTIVA DI PRODOTTO v0.2 — DA ESEGUIRE SOLO DOPO MERGE DEL FIX R02
Fonte [visione 1979](../GAME-VISION-v02.md) e [epic #25](https://github.com/CzekUns/cercax/issues/25). **Completa prima senza scope creep tutti i cinque fix R02 sopra:** ID presidente, obiettivi, salari, `absoluteWeek`, mister/save/esonero. Solo dopo review e merge l'orchestratore autorizzerà R03.

**Futuro ciclo R03, da autorizzare con nuovo NEXT:**
1. `CoachV2`: avatar con `hometown`, `region`, `macroRegion`, fortuna, leadership, autostima, pazienza e `morale` consumabile. Gestire bonus/malus presidente e clamp; **morale=0 game over** con causa persistente.
2. Valuta offerte generate da agente 07: stessa regione 0 costo, altra regione 1, altra macroregione 3 punti (ipotesi costi alternativi da rendere parametrica); autostima alta + cachet basso può amplificare fino a 2×, offerta ricca locale può dare bonus. UI espone delta prima di confermare; evita morale negativo e bonus infiniti.
3. Presidenti catalogati e persistenti, con proprietà **papponeria** distinta da disponibilità alla spesa e passione per il calcio; rapporto mister-presidente dipendente da compatibilità, risultati e ricavi reali, richieste accettate e respinte.
4. Indicatori relazionali distinti: fiducia presidente, spogliatoio e singolo giocatore, tifosi, reputazione stampa. Tutti esercitano pressioni motivabili sul morale coach. Variazioni partita/allenamento/risposte conferenza una sola volta per ID evento.
5. Prezzi biglietti determinati da papponeria e successi, condizioni stadio e divise, calciomercato e risultati influenzano tifosi; chiusura di conti per giornate, finestre mercato coerenti con 1979, nessuna spesa duplicata.

**Proprietà confine:** l'agente 04 fornisce testi/stampa; 06 effetti TEMPORANEI sul campo; 08 stati calciatori; 07 geografia/calendario. Agente 09 applica effetti relazionali ed economici persistenti. Tali formule sono proposte da bilanciare e non decisioni definitive dell'utente. Non iniziare R03 prima del merge R02.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
**Aggiornamento successivo al primo controllo:** il branch `agent/oronzo-coach-club-r02` ha ora **6 commit propri** e risulta divergente dal `main` di coordinamento. File modificati: `club.js`, `coach-model.js`, `finance.js`, `presidents.js`; nuovi `objectives.js` e `period.js`. **Questa è lavorazione in corso, non consegna**: nessuna PR R02 né REPORT R02 aggiornato e verificabile rilevati.

**Osservazioni statiche preliminari:** è presente una normalizzazione esplicita degli obiettivi; `periodOf()` usa la chiave `absoluteWeek` o anno+settimana; `createCoach()` conserva `employmentHistory`/`hiredSeason`; il modulo finance richiede `weeklyWage`, campo che il branch dell'Agente 07 non ha ancora fornito. Nessun test Node eseguito dall'orchestratore: non dichiarare risolti i cinque P1.

**Prossima azione obbligatoria dell'agente 09:** completare test regressivi e cross-module con una fixture aggiornata dell'agente 07; pubblicare REPORT R02 (file, API, SHA, comandi/pass/fail, limiti) e PR. Prima della review verificare che `initializeFinances` preservi correttamente cash/ledger dei vecchi salvataggi e che paghe, riunioni e promesse possano usare l'identica chiave di periodo del 07. Nessun mercato/papponeria/relazioni V2 prima del merge R02.
