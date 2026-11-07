# NEXT — AGENTE 9 · ORONZO

**Stato:** `FIX_REQUESTED`
**PR aperta:** https://github.com/CzekUns/cercax/pull/17
**Head osservato:** `e5ea061e90371ca507e91bd04169dd408093c71e` (ricontrollare prima di intervenire)
**Ultimo merge approvato:** NESSUNO per questa PR.
**Titolarità NEXT:** orchestratore principale.

## Situazione
Il primo lavoro è stato consegnato in una PR aperta. **Non creare un'altra PR e non iniziare il prossimo ciclo autonomamente.** Prima di fare cambiamenti verifica lo stato GitHub live e le richieste di review; l'orchestratore deve completare QA e integrazione.

## Priorità attuale
Verificare schema ClubV1/PresidentProfileV1, dipendenza dal presidents.json del copy PR #13, ed effetti sulla carriera #14.

## Azioni consentite all'agente
1. Recupera la propria identità da `IDENTITY.md` e il prompt `RUN.md`, leggi i contratti su main, la PR corrente e gli eventuali commenti del revisore.
2. Aggiungi/aggiorna `oronzo/coordination/09-coach-club/REPORT.md` **nel branch della tua PR**: file creati, test reali (con comandi/risultati), incompatibilità note e aiuti richiesti. Aggiorna il corpo della PR con il report.
3. Correggi sullo stesso branch solo problemi concretamente verificati o richiesti dal revisore; non modificare altri agenti o file root.
4. Aspetta che l'orchestratore completi revisione, eventuale merge e aggiorni NEXT.

## Criterio di accettazione
API, dati e test coerenti con `oronzo/engine-contract.md`, funzione effettiva e report verificabile; in caso di blocchi, riportare esattamente file e proposta di fix. `mergeable` da solo non significa approvato.

## Nuova correzione richiesta — revisione R03, 7 novembre 2026
**ORZ-P1-008 · Validazione importi finanziari (PR #17).** In `oronzo/systems/coach-club/finance.js`, `book()` valida `amount` con `integer()`, ma non rifiuta importi negativi. Un'operazione `type:'expense', amount:-100` può aumentare `finance.cash` invece di ridurlo, e un'entrata negativa può diminuirlo. Anche `settleWeek()` accetta `bonus` e `otherIncome` negativi; `initializeFinances()` accetta sponsor/costi negativi. Correggere sul **branch esistente** della PR #17 senza introdurre una seconda PR: rifiutare importi negativi per flussi monetari, controllare valori non negativi e interi sicuri anche nei totali e nei campi iniziali, e aggiungere test `node --test` per `book`, `settleWeek` e inizializzazione. Non cambiare la semantica delle spese obbligatorie che generano arretrati. Non mergiare.
**Stato specifico:** `FIX_REQUESTED` per questo difetto, ferma restando la QA completa e il REPORT.md richiesto.
