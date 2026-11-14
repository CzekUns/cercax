# ORONZO 1979 · Roadmap delle AUTOMAZIONI

> **Ambito esclusivo: automazioni programmate.** Questa roadmap instrada soltanto i worker ricorrenti. **Non assegna incarichi né modifica la tabella degli agenti manuali** (01–12, 07-bis, R13-TER o orchestratore 10-bis). Per le chat avviate dal proprietario continuano a valere i loro prompt, `registry.json`, `PROTOCOL.md` e i rispettivi `NEXT.md`.

## Decisione di coordinamento del 14 novembre 2026 — AUTOMAZIONE SOSPESA

**La grafica R13 non viene più prodotta automaticamente ogni ora.** L'automazione `AUTOMATION-R13` è stata disabilitata; task `R13-MATCH-ATLAS` nello stato `PARKED`, PR #82 **Draft conservata**, branch e worklog intatti. **Zero frame approvati**. Questa decisione non rende l'opera completata.

Il proprietario ha scelto **chat esecutive manuali per il lavoro artistico complesso**, con più interventi nella stessa chat e GitHub come checkpoint. Gli ingressi facoltativi sono [#85 — pixel spuri/maglie e compositing dei ritratti](https://github.com/CzekUns/cercax/issues/85) e, successivamente, [#86 — recupero sprite dalla PR #82](https://github.com/CzekUns/cercax/issues/86). Gli agenti manuali rimangono indipendenti da questo router.

**Nessuna ripresa oraria, auto-merge o nuova assegnazione automatica** senza nuovo mandato del proprietario. La sezione successiva descrive il vecchio flusso storico, al momento NON operativo.

## Obiettivo storico dell'automazione ORONZO (attualmente PARKED)
**R13-MATCH-ATLAS — creazione progressiva di veri sprite raster modulari per la partita.**

- Worker: `AUTOMATION-R13` (automazione oraria già esistente).
- Branch persistente attivo: `automation/oronzo-r13-match-atlas`.
- Directory di produzione attuale: `oronzo/assets/players/r13-match/**`.
- Progressi per ogni esecuzione: `oronzo/coordination/worklogs/R13-MATCH-ATLAS.md` **sullo stesso branch**.
- Task, proprietà e criteri di chiusura: `TASKS.json`; snapshot del worker: `STATE.json`.
- La vecchia PR #75 sulla narrativa rimane in sospeso per questo worker. Non scegliere nuove funzionalità arbitrariamente.

## Come si procede fra le esecuzioni orarie
1. Prima esecuzione: costruire asset disegnati originali, manifest/ancoraggi, primi frame e tavola PNG; aggiornare worklog e PR.
2. Esecuzione successiva: leggere ramo e worklog, continuare dal primo frame non verificato, completare pose/direzioni/kit/portiere con test reali.
3. Esecuzioni successive: finire atlante, validare palette/alpha/mapping PlayerV2, verificare gli asset nel browser e consegnare la stessa PR.
4. **Solo dopo la chiusura verificata** un coordinatore o una nuova istruzione del proprietario assegna all'automazione un'altra fase (eventuale integrazione degli sprite, campo, camera) in un perimetro disponibile. Non si prenotano automaticamente le attività degli agenti manuali.

## Rapporti con gli agenti manuali
Le PR e i file di agenti manuali sono **riferimenti esterni da non sovrascrivere**. Esempio: la PR manuale #79 R13-TER è stata integrata su `main` come test sperimentale delle figurine; l'automazione può leggerne palette e DNA ma **non governa quella chat né ne modifica i file**. Un agente manuale può lavorare secondo il proprio mandato; in caso di conflitto reale il worker sospende la modifica ai file contesi e segnala il problema.

## Risultato verificabile
Un task automatico può essere dichiarato completato soltanto con asset/codice reali, HEAD, test, immagini di prova, PR e stato preciso di merge/Pages. Le esecuzioni che non producono miglioramenti devono dichiararlo, non sostituirli con una nuova roadmap.
