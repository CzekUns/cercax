# NEXT — AGENTE 4 — Copy, personaggi e comicità

**Stato:** `FIX_REQUESTED`
**A cura di:** orchestratore ORONZO
**Ultima verifica parziale:** 7 novembre 2026 (elenco PR e dati strutturati, NON QA completa)
**Ultimo merge approvato:** NESSUNO
**Issue:** https://github.com/CzekUns/cercax/issues/4
**PR in corso:** https://github.com/CzekUns/cercax/pull/13

## Verificato
La PR #13 presenta `characters.json` con 16 personaggi, `events.json` con 57 eventi, `microcopy.json` con 144 voci e `dialogues.json` con 26 dialoghi. I file si aprono come JSON. Non è ancora stato verificato tutto lo schema, la qualità narrativa o l'integrazione browser.

## Correzione obbligatoria PR #13
**Manca `oronzo/content/presidents.json` nell'elenco dei file della PR.** È richiesto dal contratto narrativo e `PresidentProfileV1`: creare almeno 8 presidenti originali distinti con tratti numerici 0..100, ID, background, archetype, goal, voice, relazioni e carattere. Collegare 16+ eventi e 12+ dialoghi ai presidenti come da `oronzo/narrative-contract.md`, verificando gli ID senza stravolgere i contenuti già presenti. Se ci sono vincoli d'integrazione, dichiararli in README.

Aggiungere `oronzo/coordination/04-copy/REPORT.md` nello **stesso branch e PR #13** con elenco file, test veri, limiti, API di caricamento e prossimo passo proposto. **Non aprire una nuova PR** prima della revisione e merge di #13, non modificare `NEXT.md` (gestito dall'orchestratore).

## Accettazione
Dati validi, testo originale, no citazioni protette, anacronismi controllati, presidenti distinti e con campo compatibile con agente 9, test riproducibili, report in PR. L'orchestratore farà QA e solo allora il merge.

## Dopo il merge
Il prossimo ciclo sarà scritto qui dall'orchestratore indicando commit SHA approvato e priorità successive. La chat riparte usando il medesimo `RUN.md`.
