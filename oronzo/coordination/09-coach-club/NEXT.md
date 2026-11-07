# ORONZO — AGENTE 09 · NEXT ATTUALE: MORALE E OFFERTE V0.2 (CICLO MIRATO R03)

**Stato: `WAIT_REVIEW` — R03 consegnato, in attesa audit #38+#39.
**Precedente ciclo R02 concluso:** [PR #32](https://github.com/CzekUns/cercax/pull/32) MERGED `5b1dcd7c71435709d8b2c62d5455720b73691eb8` e [PR #30](https://github.com/CzekUns/cercax/pull/30) MERGED `aab48f0be77f022dbb7d915ab44187037d96b5f0`. Le direttive `WAIT_REVIEW/FIX_REQUESTED` R02/R04/R05 elencate sotto sono **ARCHIVIO**.
**Nuovo branch da ultimo `main`:** `agent/oronzo-coach-club-r03-morale` e nuova PR; non riaprire #32.
**Scope:** `oronzo/systems/coach-club/` e il tuo `REPORT.md`. Non modificare la carriera/flow/HTML degli altri agenti.

## Incarico singolo necessario alla carriera 1979
Realizzare il **contratto di morale del mister e la valutazione degli ingaggi** che il 07 consumerà da `oronzo/app/flow/`. Resta su questa funzionalità; **papponeria estesa, market e shouts persistenti avanzati saranno attività distinte quando i loro gate lo richiederanno**.

1. Estendere `createCoach`/lo stato persistente con città, regione/macroregione e quattro tratti **fortuna, leadership, autostima, pazienza** per gli avatar. I numeri hanno effetti espliciti, parametrizzabili/testabili e non sono etichette vuote. Preservare `employmentHistory`, `hiredSeason`, `contract.until`, presidente e vecchi save 1985.
2. Introdurre `morale` del mister come risorsa persistente con min/max e delta tracciabili; **morale=0 → game over** (stato terminale che il flow 07 e la UI 03 possono rilevare). Il valore iniziale ed i moltiplicatori sono impostazioni di bilanciamento **da documentare come proposta**, non presentare come formula definitiva richiesta dall'utente. Evitare che una promessa di recupero o un reload aggiri il game over in un singolo evento già contabilizzato.
3. Esportare una **funzione pura e documentata** `previewOfferMorale(coach,offer,club)` → `{baseDistanceCost,selfEsteemMultiplier,finalMoraleDelta,reasons}` per le **20 offerte seed-stabili dell'Agente 07**, e un'applicazione mutante/immutabile idempotente per offerta accettata con chiave univoca `eventId` persistita. Il 07 sceglie il club e salva; **solo 09** calcola/applica costi/bonus morale, senza duplicate charge.
4. Preparare API minime di variazione morale/rapporti per conferenze stampa iniziale (5 domande) e postmatch, con effetti dichiarativi dei testi originali 04 e clamp unico; stesso `eventId` applicato una volta anche dopo save/load. Relazioni presidente/tifosi/media/spogliatoio da rappresentare senza inventare narrazione. Nessuna simulazione di partite o cambio classifiche dal 09.
5. Comunicare nel REPORT entro la nuova PR una **interfaccia compatibile per l'Agente 07**, con import/export e shape esatti; verificare che gli errori, quando manca una località o un contratto, siano espliciti e non inventino dati. **Non attendere l'integrazione UI del 03 per testare queste API.**
6. Preservare i gate anti-doppia paga R04 e tutto il precedente ledger `{week,absoluteWeek,seasonYear}`: i nuovi eventi di morale non devono violare l'idempotenza delle finanze. Il sistema di shout 06/08 (`matchId:eventId`) resta fuori dal ciclo finché #31/#35 non sono compatibili.

## QA e consegna
Test Node realmente eseguiti: preview pura; stessa offerta/seed → medesimo delta; due avatar con tratti o regioni diverse → differenze coerenti; pagamento morale una volta anche dopo reload; morale a zero → stato game-over; eventi press ripetuti ignorati, ledger salari/board e due stagioni non regressivi. Nessuna modifica a `index.html`/UI. Aggiornare REPORT e aprire una PR nuova su main, senza merge. Se il primo batch è incompleto, privilegiare preview/apply morale e game over verificabili e indicare con precisione gli altri blocchi.

## Coordinamento essenziale
Leggi [`CONTRACT-v02.md`](../10-orchestrator/CONTRACT-v02.md) e [`GAME-VISION-v02.md`](../GAME-VISION-v02.md). **07** genera offerte/stato e integra API nel flow, non deve ricalcolare morale; **04** fornisce il bank dei testi senza applicare effetti; **03** presenterà anteprime e differenze, senza regole economiche; **06/08** shouts in altro incarico. Il 1979 è l'anno iniziale per NUOVI giochi, non una modifica retroattiva a vecchi salvataggi.

---

## ARCHIVIO — ISTRUZIONI PRIMA DEI MERGE #30/#32
# NEXT — ORONZO AGENTE 9 · CORREZIONI DA AUDIT R02

**Stato:** `WAIT_REVIEW` — decisione corrente R05-1, prevale su note R04 storiche.
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
**Aggiornamento successivo al primo controllo:** il branch `agent/oronzo-coach-club-r02` ha ora **almeno 9 commit propri** e risulta divergente dal `main` di coordinamento. File modificati: `board.js`, `club.js`, `coach-model.js`, `finance.js`, `index.js`, `negotiations.js`, `presidents.js`; nuovi `objectives.js` e `period.js` (ultimo controllo, branch in aggiornamento). **Questa è lavorazione in corso, non consegna**: nessuna PR R02 né REPORT R02 aggiornato e verificabile rilevati.

**Osservazioni statiche preliminari:** è presente una normalizzazione esplicita degli obiettivi; `periodOf()` usa la chiave `absoluteWeek` o anno+settimana; `createCoach()` conserva `employmentHistory`/`hiredSeason`; il modulo finance richiede `weeklyWage`, campo che il branch dell'Agente 07 non ha ancora fornito. Nessun test Node eseguito dall'orchestratore: non dichiarare risolti i cinque P1.

**Prossima azione obbligatoria dell'agente 09:** completare test regressivi e cross-module con una fixture aggiornata dell'agente 07; pubblicare REPORT R02 (file, API, SHA, comandi/pass/fail, limiti) e PR. Prima della review verificare che `initializeFinances` preservi correttamente cash/ledger dei vecchi salvataggi e che paghe, riunioni e promesse possano usare l'identica chiave di periodo del 07. Nessun mercato/papponeria/relazioni V2 prima del merge R02.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#32](https://github.com/CzekUns/cercax/pull/32). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** GATE P0: cinque fix R02 con 07 in checkout unificato; Node due stagioni, save/load, cassa/arretrati/settledWeeks absoluteWeek, coach persistente. Nuove relazioni V2 vietate finché non autorizzate.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #32**, stesso branch `agent/oronzo-coach-club-r02`. **Priorità P0, NON MERGIARE ora.** Audit R04 **R04-1** conferma doppio payroll quando un ledger con `settledWeeks:[1]` passa alla nuova chiave `a:1`. **R04-2**: suite combinata Node **50 PASS / 1 FAIL**; fixture `compat-r02.test.js` assume 1.600 ITL mentre il nuovo Career 07 genera realmente 472.000 ITL (aspettativa obsoleta, non prova di bug nel payroll nuovo).
**Correzioni assegnate a 09:**
1. `period.js`, `finance.js`, board/eventi: definire **un unico dominio del periodo** (absoluteWeek o anno+week) e guardia all'ingresso che respinga ledger legacy non migrati prima del pagamento/riunione. Mai pagare di nuovo un periodo già registrato. L'07 migra i dati sorgenti; il 09 valida e preserva idempotenza.
2. In `compat-r02.test.js` eliminare l'importo fisso 1.600 e calcolare l'atteso dai contratti reali del nuovo Career con `weeklyPayroll`. Non gonfiare/ridurre contratti o modificare gameplay per far tornare il test.
3. Eseguire con 07 **suite Node combinata** 2 stagioni, 104 club o fixture significativa, save/load, storico preservato, obiettivi/presidenti corretti, cash/arrears non negativi, periodo `{week,absoluteWeek,seasonYear}`, migrazione V1/V2 e doppio evento respinto.
4. Aggiornare il REPORT R02 e la PR #32, non aprire un ciclo indipendente. Nessun CoachV2, papponeria o nuovo saldo morale prima del merge R02.
**Futuro 09 R03** conserva ownership degli effetti persistenti degli shouts (un solo event ledger `matchId:eventId`), ma **non avviarlo** finché i fix R02 non sono approvati.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**Correzioni R04 consegnate nella stessa PR #32; attendere gate indipendente Work 00 R05.** HEAD `89bb4944e6c6fc78ad9164c8e0d899355ec9d67f`: guard `period_migration_required` su ledger misti, test payroll reali (non più asserzione fissa 1600), nuovi test `period-r04.test.js`, report dichiara 41/41 V8 e Node parziale. Rimane obbligatoria la suite Node **completa combinata** con HEAD #30 aggiornato. Se fallisce, correggere direttamente #32, senza cambiare la PR di 07. Niente merge autonomo.
**ITERAZIONE FUTURA NON AUTORIZZATA:** dopo merge 07+09, CoachV2 (morale risorsa a zero gameOver), compatibilità ingaggi e avatar, presidenti con papponeria, rapporti coach/board/tifosi/stampa/calciatori, prezzi biglietti e conti, applicazione persistente *una sola volta* degli eventi shouts `matchId:eventId` con delta e ledger salvati atomici (06 effetto temporaneo). Test due stagioni, no formule hardcoded come se fossero approvate. Nuovo NEXT separato solo da 10.

## ESITO R05 — NESSUN NUOVO FIX RICHIESTO AL 09 (7 novembre 2026)

**Stato operativo: `WAIT_REVIEW` sulla PR #32**. Nella [PR audit #37](https://github.com/CzekUns/cercax/pull/37) il verificatore ha eseguito con i due HEAD #30/#32 la suite Node completa: **76 passati / 1 fallito**, localizzato al **test obsoleto del 07** `career/tests/r02-cross.test.mjs` che usa `{week}` invece del periodo moderno. `finance.js`, migration guard e test della #32 risultano superati nei casi eseguiti. **Non modificare la #32 per risolvere un test del 07**. Attendere soltanto nuovo HEAD #30, rerun combinato e decisione di merge; R03 di CoachV2 rimane separato e non ancora autorizzato.

## STATO AGENTE 09 — CONSEGNA R03 E AUDIT R06 (7 novembre 2026)
**PR #39 OPEN, HEAD `80df15139d37c4ee36103001d6a24528037daed4`, lavoro R03 CONSEGNATO**, non più READY da iniziare. API CoachV2, preview/applier offerte e press, test mirati 9/9 Node dichiarati nel REPORT. Suite Node combinata con #38 non ancora dichiarata passata. **Stato operativo attuale: `WAIT_REVIEW`**. Attendere review indipendente 00 R06 delle sole #38/#39, senza merge né modifica preventiva a #39. L'adapter di collegamento con flow e stato `awaiting_agent09` competono al controller 07, a meno di un difetto documentato nelle API 09.
