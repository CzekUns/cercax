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
