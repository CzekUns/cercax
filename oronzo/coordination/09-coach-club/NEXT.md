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
