# ORONZO R12 — Registro rilasci

## 2026-11-11 · PR #73 — archi narrativi provinciali
- Gap E: introdotti eventi di serie positiva, serie negativa, imbattibilità e finale stagione, con due decisioni a effetti reali, selezione deterministica e salvataggio nel ledger esistente.
- HEAD `c61dc5d3310f3c9a7ab3e61c0d7c78728df15946` (precedente al presente registro).
- Node: test aggiunti, CI da verificare. Chromium HTTP: da verificare. Nessun test dichiarato PASS senza log.
- Merge: NO. Pages: NO. Residui: test browser di decisioni e save/load, CI verde e verifica deploy; nessuna modifica al CercaX esterno.

## 2026-11-11 · R12-BIS Chromium UI gate
- PR #73: test HTTP Chromium 4 viewport per scelta narrativa reale da pulsante, fiducia presidente, anti-doppia scelta, salvataggio IndexedDB e reload; workflow aggiornato.
- Ultimo commit prima del registro `2a60f2de70eb89855903305273e621e0de00d0a1`.
- Precedente HEAD `2463ef77747c02bf087bf79e5856f512e3a31c61`: tre workflow SUCCESS (42938787842, 42938787876, 42938787657). Nuovo gate browser: CI non ancora certificata.
- Main NO; Pages NO. Non mergiare senza SUCCESS sul nuovo HEAD e controllo browser specifico.

## 2026-11-11 · R12-BIS release gate
- PR #73 HEAD `a2e2fe347635f98e5320cf8cf225f7dba223f826`: workflow 42945940244, 42945940254, 42945940259 SUCCESS; Chromium provincial narrative executed in Postmatch workflow (four viewports).
- Fixed Pages smoke to verify provincial narrative independently of unmerged concurrent PR #70; commit `0940807ad9cbe438c40a7b60f77059b5929b4936`.
- New HEAD CI pending; merge NO, Pages NO until verified. Scope restricted to oronzo/** and dedicated workflow.

## 2026-11-11 · PR #74 — importazione carriera e ripresa fase
- Gap H / persistenza: import JSON riprende offers, conferenza, postpartita, stagione conclusa, disoccupazione e hub con routing condiviso col caricamento durevole; migrazione visuali e parametri tattici riallineati; SALVA accessibile in stagione/disoccupazione.
- Commit codice `5f6b637`, test Chromium `c4f64b4`, CI `660a78c`; browser HTTP 4 viewport aggiunto al workflow.
- Node/Chromium: CI ultimo HEAD non ancora disponibile al controllo. Merge NO; Pages NO; non dichiarare rilascio prima dei gate verdi.
