# NEXT — ORONZO AGENTE 7 · CORREZIONI DA AUDIT R02

**Stato:** `READY`
**Incarico:** secondo ciclo, correzioni e test di compatibilità documentate dal Coerentizzatore.
**Origine:** [Rapporto Work R02](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/coerentizzatore/REPORT-R02.md), mergeto su main commit `7212806be066c971a5479df162a2e60816fb1fcd`.
**Precedente PR:** #14, merge `bb9e3847`.
**Scope modificabile:** `oronzo/systems/career/` e il tuo `REPORT.md`.

## Azioni autorizzate
Riparti dall'ultimo `main` in un nuovo branch di ciclo `agent/oronzo-career-r02`. Implementa e testa:
1. **R02-1: migra e assegna ad ogni club un `presidentId` canonico fra quelli del catalogo copy, con assegnazione deterministica per seed e stabile attraverso save/load e cambio stagione. Per >8 club documenta riuso di profili/istanze; non riassegnare a ogni avvio.**
2. **R02-2: mantieni obiettivo canonico persistito e aggiungi mapping esplicito compatibile con il board; le soglie della carriera non devono essere alterate dal fallback.**
3. **R02-3: assegna contratti ITL con `weeklyWage` non nullo e realistico per divisione/giocatore, verifica wageBudget e persistenza/migrazione delle rose esistenti.**
4. **R02-4: porta un `absoluteWeek` persistente attraverso le stagioni, sufficiente a distinguere i retry e garantire deduplicazione settimane tra stagione 1 e 2.**
5. **R02-5: preserva `employmentHistory`, `hiredSeason` e stato contrattuale del mister; evita round-trip perdenti tramite createCoach e schema coerente con agente 9.**

## Coordinamento
L'altro agente (07/09) lavora su API/contratto complementari. Non modificare il suo codice. Se serve un adapter condiviso, documenta precisamente input/output e proprietà dello stato in `integration-notes.md`; il runner centrale sarà costruito dall'orchestratore. Il catalogo `oronzo/content/presidents.json` è autorevole e già su main; non duplicare i presidenti.

## Verifica/accettazione
- Test nativi Node; includere almeno un test incrociato con **due stagioni** e salvataggio/ricarica.
- Presidenti stabili con ID esistente; board e testi dello stesso presidente; obiettivi equivalenti; payroll > 0 per club con contratti, niente spese negative; settimane del secondo anno accettate una volta sola; esonero senza TypeError dopo save/load.
- Conserva le API precedenti dove possibile, segnala breaking changes.
- Scrivi `oronzo/coordination/07-career/REPORT.md` sul branch, apri PR a main, **non fare merge**.
