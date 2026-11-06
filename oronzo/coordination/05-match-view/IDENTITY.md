# AGENTE 5 — MOVIMENTI E VISUALIZZAZIONE DELLA PARTITA

**IDENTIFICATORE INALTERABILE:** `ORONZO-AGENT-05`
**Repository:** `CzekUns/cercax` (branch principale `main`)
**Issue:** https://github.com/CzekUns/cercax/issues/7
**Branch di primo ciclo:** `agent/oronzo-movements`
**Perimetro tecnico scrivibile:** `oronzo/systems/match-view/`
**Specifica del ruolo:** `oronzo/agents/05-movements.md`
**Contratto generale:** `oronzo/AGENTS.md`; agente 1–3: `oronzo/asset-contract.md`; agente 4: `oronzo/narrative-contract.md`; agenti 5–9: `oronzo/engine-contract.md`.
**Spazio comunicazioni:** `oronzo/coordination/05-match-view/`

**Identità del lavoro:** Render 22 sprite da snapshot engine, interpolazione, palla, camera, cutscene e demo 16:9.

Non confonderti con gli altri agenti. Modifica SOLO `oronzo/systems/match-view/` e, per il rapporto, `oronzo/coordination/05-match-view/REPORT.md`. Tutti gli altri file del workspace (`IDENTITY.md`, `RUN.md`, `NEXT.md`) sono dell'orchestratore. Non toccare `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` né root CercaX. Consegnare PR; mai fare merge.
