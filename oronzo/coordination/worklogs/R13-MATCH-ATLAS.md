# Worklog persistente — R13-MATCH-ATLAS
**Owner:** AUTOMATION-R13. **Stato:** READY / non ancora avviato. **Directory esclusiva:** `oronzo/assets/players/r13-match/`.
**Branch previsto:** `automation/oronzo-r13-match-atlas`. **PR:** nessuna alla creazione.
**Dipendenza read-only:** identità canonica PlayerV2 e manifest ritratti R13 su main. Non modificare la PR #79.

## Registrazioni di ogni esecuzione
Ad ogni run inserire una sezione in cima con: data, HEAD, file/asset nuovi e relativi ID, frame prodotti/verificati, screenshot, test reali, errori, prossimo esatto ID/asset. Salvare SEMPRE questo file sul branch del task, non in un'altra PR.

## Prima tranche ancora da produrre
1. Leggere `TASKS.json`, manifest asset, motore 05 e sprite esistenti.
2. Produrre raster ORIGINALI modulari trasparenti (non primitive SVG/Canvas) per pose/direzioni e kit distinti in `r13-match/`. Definire anchor, dimensioni, frame, palette e mapping DNA.
3. Testare un primo set coerente con tavola sprite e tracciarne ogni ID nel worklog.
4. Procedere nelle esecuzioni seguenti dallo **stesso branch e worklog**. Non riscrivere il piano a ogni ora.
