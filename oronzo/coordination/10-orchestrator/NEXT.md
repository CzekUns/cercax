# NEXT — ORONZO AGENTE 10 · SOLO ORCHESTRAZIONE
**Stato:** `WORKING` (coordinamento attivo; non sviluppo del gioco).
**Specifica utente:** [GAME-VISION-v02.md](../GAME-VISION-v02.md) · [Google Drive](https://docs.google.com/document/d/1k52clWWRcD3CMvD_HsX1ke7zdiVAY_AHp2MT9KfDEG0/edit).
**Epic:** [#25](https://github.com/CzekUns/cercax/issues/25) · **integrazione delegata:** [#26](https://github.com/CzekUns/cercax/issues/26).

## Prossimi passi del coordinatore (SOLO governance)
1. Sorvegliare REPORT/PR degli agenti e verificare incarichi, dipendenze e stato effettivo. Distinguere READY da una sessione realmente attiva.
2. **Prima priorità:** agenti 07 e 09 devono chiudere, testare e consegnare i fix R02 su ID presidente, obiettivi, stipendi, settimane assolute e persistenza mister. Non aprire ora nuova integrazione che presupponga moduli non corretti.
3. Agente 03 consegna prima kit UI dinamico nel suo scope attuale `oronzo/assets/ui/`. Dopo merge del ciclo artistico e dopo gate R02, autorizza un ciclo separato per la **UI runtime** (`index.html`, `game.js`, `ui.css`, `partita-rapida.html`), che sarà di sua esclusiva competenza. La UI consuma gli adapter, non duplica la logica.
4. Agente 07, dopo merge R02, riceve un nuovo ciclo per il **game-flow e gli adapter** in `oronzo/app/flow/` oltre alla propria career, con nuovo campo di proprietà esplicitato in contratto/IDENTITY/NEXT. Non farlo partire prematuramente.
5. Invia a 04,05,06,08,09 i requisiti necessari alla carriera morale/1979/società/telecamera/ordini; verifica compatibilità degli schemi, documenta cause dei rifiuti e richiedi correzioni prima del merge.
6. Valuta il primo percorso completo Nuova/Carica→avatar→20 ingaggi→presidente→rosa→5 domande→hub→match→stampa→morale→save/load usando i test e screenshot consegnati dagli agenti. Se manca una prova, segna il gate come aperto.
7. Aggiorna issue, NEXT, registro e stato delle PR. **Non scrivere codice del gioco**.

## Stato riscontrato
Partita rapida separata disponibile, PR #24 integrata; PR #12 cutscene in draft; cinque P1 R02 non ancora confermati come risolti nell'ultimo controllo; visione v0.2 documentata ma non implementata completamente. Evita affermazioni di avvio automatico dei nove agenti.
