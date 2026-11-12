# ORONZO 1979 · Roadmap delle AUTOMAZIONI

> **Ambito esclusivo: automazioni programmate.** Questa roadmap instrada soltanto i worker ricorrenti. **Non assegna incarichi né modifica la tabella degli agenti manuali** (01–12, 07-bis, R13-TER o orchestratore 10-bis). Per le chat avviate dal proprietario continuano a valere i loro prompt, `registry.json`, `PROTOCOL.md` e i rispettivi `NEXT.md`.

## Obiettivo attuale dell'automazione ORONZO
**R13-MATCH-ATLAS — creazione progressiva di veri sprite raster modulari per la partita.**

- Worker: `AUTOMATION-R13` (automazione oraria già esistente).
- Branch di lavoro persistente previsto: `automation/oronzo-r13-match-atlas`.
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
Le PR e i file di agenti manuali sono **riferimenti esterni da non sovrascrivere**. Esempio: PR #79 R13-TER modifica ritratti, maschere e `portrait-r13.js`; l'automazione deve evitarne i file ma **non governa né blocca quella chat**. Un agente manuale può lavorare secondo il proprio mandato; in caso di conflitto reale il worker sospende la modifica ai file contesi e segnala il problema.

## Risultato verificabile
Un task automatico può essere dichiarato completato soltanto con asset/codice reali, HEAD, test, immagini di prova, PR e stato preciso di merge/Pages. Le esecuzioni che non producono miglioramenti devono dichiararlo, non sostituirli con una nuova roadmap.
