# NEXT — AGENTE 6 · ORONZO

**Stato:** `WAIT_REVIEW`
**PR aperta:** https://github.com/CzekUns/cercax/pull/18
**Head osservato:** `71fa0aeac7dd694a8cae4962e35205a86c1579c0` (ricontrollare prima di intervenire)
**Ultimo merge approvato:** NESSUNO per questa PR.
**Titolarità NEXT:** orchestratore principale.

## Situazione
Il primo lavoro è stato consegnato in una PR aperta. **Non creare un'altra PR e non iniziare il prossimo ciclo autonomamente.** Prima di fare cambiamenti verifica lo stato GitHub live e le richieste di review; l'orchestratore deve completare QA e integrazione.

## Priorità attuale
Verificare formato MatchSnapshotV1, eventi goal, ticking, comandi mister e dipendenze dagli attributi PR #16; attendere audit mirato.

## Azioni consentite all'agente
1. Recupera la propria identità da `IDENTITY.md` e il prompt `RUN.md`, leggi i contratti su main, la PR corrente e gli eventuali commenti del revisore.
2. Aggiungi/aggiorna `oronzo/coordination/06-match-engine/REPORT.md` **nel branch della tua PR**: file creati, test reali (con comandi/risultati), incompatibilità note e aiuti richiesti. Aggiorna il corpo della PR con il report.
3. Correggi sullo stesso branch solo problemi concretamente verificati o richiesti dal revisore; non modificare altri agenti o file root.
4. Aspetta che l'orchestratore completi revisione, eventuale merge e aggiorni NEXT.

## Criterio di accettazione
API, dati e test coerenti con `oronzo/engine-contract.md`, funzione effettiva e report verificabile; in caso di blocchi, riportare esattamente file e proposta di fix. `mergeable` da solo non significa approvato.
