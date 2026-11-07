# NEXT — AGENTE 6 · MATCH ENGINE

**Stato:** `FIX_REQUESTED` · PR #18 aperta · nessun merge approvato.
**Riferimento audit:** https://github.com/CzekUns/cercax/pull/19 (REPORT.md, audit R01). HEAD analizzato: `71fa0aeac7dd694a8cae4962e35205a86c1579c0`.

## Correzioni P1 sulla PR corrente
1. **ORZ-P1-001 / facing:** `movement.js` emette `facing=1/-1` come segno orizzontale, la vista #15 lo legge in radianti. Concordare e documentare convenzione stabile (preferibili direzione/vettore) e test di orientamento a riposo e in movimento.
2. **ORZ-P1-003 / attributi:** `actions.js` legge `mental.decisions`, ma PlayerV1 della PR #16 produce `technical.decisions`: il motore usa default 50. Inoltre `fitness` è ignorato e `health` non pesa finché >0. Integrare effetti graduati e test deterministici che dimostrino differenze effettive tra 0 e 100. Evitare doppio conteggio se si usa `effectiveAbility`.
3. **ORZ-P1-004 / feed cambi:** `command(substitution)` aggiorna l'XI ma l'evento scompare dallo snapshot del successivo `advanceRealSeconds`. Definire chiaramente `getEventsSince(lastId)` come feed autorevole per il runner, con ID univoci e test di sostituzione portiere.
4. **ORZ-P1-005 / assist:** il goal non espone `goal.detail.assistId`; lo storico #16 non può registrare assist. Aggiungere ID assist opzionale se ultimo passaggio valido della stessa azione; testare gol senza assist e cambio possesso.

## Consegna
Correggi solo la branch della PR #18 e il tuo REPORT.md. Documenta convenzioni, test e dipendenze con #15/#16. Non fare merge, non modificare NEXT, non iniziare altra iterazione.
