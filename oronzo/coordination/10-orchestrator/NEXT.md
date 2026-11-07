# NEXT — ORONZO AGENTE 10 · ORCHESTRAZIONE v0.2
**Stato:** `WORKING` — il coordinamento e la visione sono stati formalizzati; l'integrazione completa non è ancora stata sviluppata.
**Fonte prodotto:** [Google Doc v0.2](https://docs.google.com/document/d/1k52clWWRcD3CMvD_HsX1ke7zdiVAY_AHp2MT9KfDEG0/edit) · [GitHub v0.2](../GAME-VISION-v02.md).
**Epic:** [#25](https://github.com/CzekUns/cercax/issues/25).

## Cosa esiste e resta valido
- `partita-rapida.html` con motore 11v11, renderer/sprite, comandi tattici, velocità 1× ~15 min. PR #24 di riposizionamento sprite mergiata; QA manuale smartphone ancora da verificare dopo correzione.
- 8 presidenti originali, sistemi base coach-club, career, attributes e pack copy già su main; grafica UI/mockup integrabile ma non completamente collegata.
- PR #12 cutscenes OPEN/DRAFT in attesa di QA artistica.
- Audit Coerentizzatore R02 documenta 5 P1 carriera/società. Agenti 07 e 09 autorizzati ai fix R02 prima della nuova espansione.

## Prossimi compiti dell'orchestratore
1. **Gate P0:** controlla nuovi PR 07/09, incrocia presidentId, seasonObjective, weeklyWage, absoluteWeek e CoachV1 persistente; QA Node 2 stagioni. Mergia solo dopo test.
2. Progetta e scrivi un **integration adapter** ESM che unisca career+coach-club+attributes+copy+match-engine e che gestisca i nuovi stati coach/fans/media/players. Entrambi gli engine condividono source of truth; niente salvataggi duplicati, niente goal fuori engine. Se R02 incompleto, costruisci uno slice isolato senza mentire sulla persistenza finale.
3. UI runtime sotto `oronzo/**`: pulsanti Nuova/Carica; scelta avatar con 4 parametri; 20 ingaggi; presidente; rosa; 5 domande; hub 1979, campionato/classifica, rosa/allenamento, tifoseria/stadio/media, ufficio presidente; formazione avversaria; partita; postmatch; save/load e game over a morale zero.
4. Integra agenti 03/05/06/08 in ordine gate, con camera full campo e TV e ordini individuali. Conserva la pagina Partita rapida indipendente finché il nuovo loop non passa i test.
5. Automatizza smoke test end-to-end: seed stabile, morale e delta, 5 Q, presidente legato al club, 20 offerte persistenti, cambio tattico fisico, score da eventi, data/turno/classifica, conferenza post, load, secondo anno, game over.

## Non ancora completato
Nessuna UI completa Nuova partita→campionato collegata alla carriera; mancano dataset verificati 500 comuni/5000 cognomi, camera TV, rapporti/morale user-facing, conferenze reali e mercato storico. Non dichiararli funzionanti finché non vi sono commit, PR mergiate e test.
