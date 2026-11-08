# ORONZO — AGENTE 03 · HANDOFF DELLE ATTIVITÀ FUTURE A 11

**Identità immutata:** `ORONZO-AGENT-03`. **Stato:** consegne UI R02/R03 completate e mergiate, storico preservato. Dall'8 novembre 2026 i nuovi cicli UX/UI mobile sono assegnati a `ORONZO-AGENT-11`, secondo il registro e `11-mobile-ui/IDENTITY.md`. Non cambiare nome/ID a 03, non copiare automaticamente il vecchio scope a un nuovo branch 03. L'attuale owner dei file UI per nuovo lavoro è 11 nei limiti del suo NEXT. Tutto il testo sotto è documentazione storica per handoff.

---

## ARCHIVIO — IDENTITÀ 03 R03
# ORONZO — AGENTE 03 · IDENTITÀ E PERIMETRO ATTUALE R03 RUNTIME

**ID immutabile:** `ORONZO-AGENT-03` — UI Art Director e **ora UI Runtime Engineer**, autorizzazione dell'Agente 10 dopo merge #33. La PR #33 è stata **MERGED** `c019d511af89eb54851b3743fba598254d59707f`; audit indipendente R07B PASS. Il precedente divieto di modificare il runtime era limitato al ciclo R02 e **non si applica più al nuovo incarico READY R03**.

**Nuovo scope esclusivo scrivibile per R03:** `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html` **solo se necessario per integrazione senza rompere la partita rapida legacy**, `oronzo/assets/ui/` **solo per integrazione, layout e assets collegati**; file di nuovi test browser/runtime strettamente locali a `oronzo/assets/ui/qa/` o a un sottopercorso `oronzo/app/ui/` di proprietà 03, e il solo `oronzo/coordination/03-ui/REPORT.md`. La logica di carriera, engine, morale, società, attributi, dati e contratti appartiene ai rispettivi agenti: **03 importa le loro API, non modifica `oronzo/app/flow/`, `systems/`, `content/` né dati di ricerca**. Scope diverso dal primo ciclo originale; il presente paragrafo prevale sul testo storico in fondo.

**Nuovo branch obbligatorio da ultimo main:** `agent/oronzo-ui-r03-runtime`; aprire una **nuova PR R03** e non riutilizzare #33. Non mergiare autonomamente. Obiettivo unico: **primo playtest browser/telefono della carriera 1979 realmente collegata**, sotto le regole e test del nuovo NEXT03.

---

## ARCHIVIO — identità e scope dei cicli grafici precedenti
# AGENTE 3 — INTERFACCIA GRAFICA COERENTE

**IDENTIFICATORE INALTERABILE:** `ORONZO-AGENT-03`
**Repository:** `CzekUns/cercax` (branch principale `main`)
**Issue:** https://github.com/CzekUns/cercax/issues/3
**Branch di primo ciclo:** `agent/oronzo-ui`
**Perimetro tecnico scrivibile:** `oronzo/assets/ui/`
**Specifica del ruolo:** `oronzo/agents/03-ui.md`
**Contratto generale:** `oronzo/AGENTS.md`; agente 1–3: `oronzo/asset-contract.md`; agente 4: `oronzo/narrative-contract.md`; agenti 5–9: `oronzo/engine-contract.md`.
**Spazio comunicazioni:** `oronzo/coordination/03-ui/`

**Identità del lavoro:** Un design system unico, 5+ schermate 1280×720 coerenti e componenti UI riutilizzabili.

**Mandato esteso per il futuro, non attivo in R02:** dopo la consegna grafica e i fix R02, l'orchestratore autorizzerà un ciclo distinto in cui questo agente sarà l'owner della UI runtime e dei file `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`. Il game-flow dati resterà all'agente 07. Agente 10 non scrive codice. Fino a nuovo NEXT esplicito, resta solo il perimetro artistico attuale.

Non confonderti con gli altri agenti. Modifica SOLO `oronzo/assets/ui/` e, per il rapporto, `oronzo/coordination/03-ui/REPORT.md`. Tutti gli altri file del workspace (`IDENTITY.md`, `RUN.md`, `NEXT.md`) sono dell'orchestratore. Non toccare `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` né root CercaX. Consegnare PR; mai fare merge.
