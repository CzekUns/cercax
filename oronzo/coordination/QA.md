# ORONZO · Gate di qualità, merge e pubblicazione
_Applicare insieme a PROTOCOL.md. Il task non è finito con il solo commit._

## Stati verificabili
- `READY`: task assegnato e scope libero.
- `WORKING`: codice/asset in sviluppo, PR e worklog riutilizzabili.
- `WAIT_REVIEW`: consegna completa per la tranche, prove raccolte; revisione artistica/tecnica pendente.
- `FIX_REQUESTED`: c'è un errore o limite che richiede correzione nella PR corrente.
- `BLOCKED`: dipendenza reale, responsabilità specificata.
- `PARKED`: sospeso per volontà del proprietario, non avviare.
- `MERGED`: commit verificato su main; non implica deployed.
- `DEPLOYED`: GitHub Pages SUCCESS per lo SHA di main e link verificabile.
Se serve, il report può segnalare separatamente PASS/NEEDS CHANGES/NON CERTIFICATO.

## Gate per ogni PR
1. **Ownership:** un solo task, scope non sovrapposto, branch/HEAD aggiornato.
2. **Consegna:** codice e asset reali; niente placeholder spacciati per finiti. Manifest, trasparenza/maschere e licenze per PNG/WebP; ricolorazione e DNA persistente.
3. **Test tecnici:** Node e regressioni pertinenti, salvo motivazione precisa; se cambi GUI, Chromium HTTP vero a **640×360, 800×360, 844×390, 960×400**. Salvare screenshot e log. Niente PASS dichiarato senza evidenza.
4. **Test funzionali:** per figurine usare almeno 20 combinazioni, 8 volti, barbe/capelli, kit chiari/scuri e transfer; in-game scheda, cambio calciatore e save/reload. Per match, 22 sprite, portieri, due kit, azioni e passaggio FULL/TV; niente regressioni di comandi, risultato, clock.
5. **Art review:** sulla grafica critica, confronto prima/dopo e verifica del proprietario se ha segnalato difetti. Un workflow verde **non** approva automaticamente occhi/barba/collo/spalle.
6. **Merge:** controllare HEAD, test e diff, evitare force-push. Merge da coordinatore o solo owner-automation con autorizzazione pregressa per **sua** PR completamente verificata; nessuna integrazione automatica della #79 di altra chat.
7. **Release:** verificare `main`, Pages build/deploy `SUCCESS`, link `https://czekuns.github.io/cercax/oronzo/assets/ui/career-r03.html?v=<SHA>`; annotare eventuale differenza tra Pages CI e test diretto sul sito.
8. **Handoff:** aggiornare worklog del proprio branch, PR, artefatti e stato; dopo merge aggiornare `STATE.json` su main tramite orchestratore.

## Regola anti-rituale
Non si aggiungono test e report solo per riempire un'esecuzione: prima produrre miglioramenti coerenti. Se l'ambiente non permette di disegnare o pubblicare PNG autentici, dichiarare il blocco invece di sostituirli con SVG/fillRect. Chiudere una run senza progressi è un esito esplicitamente insufficiente.
