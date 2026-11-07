# RAPPORTO AGENTE 06 — Motore partita e ordini individuali — ciclo R02 v0.2

**Identità:** `ORONZO-AGENT-06` · **Stato:** `PR_OPEN` · **Data:** 7 novembre 2026.  
**Branch:** `agent/oronzo-match-engine-r02` (creato dal main `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697`).  
**PR:** https://github.com/CzekUns/cercax/pull/35 · **Issue:** https://github.com/CzekUns/cercax/issues/8 · **Epic v0.2:** https://github.com/CzekUns/cercax/issues/25.  
**PR precedente:** #18 integrata; fix del cambio modulo #24 presente su main.  
**Commit di codice e test verificato:** `b20b8d4cd42a8dc6301041d21f6a3043fce5186b`.  
**Commit documentazione / CLI:** `6886ed19d2f1dc27b4065dccfc9ea1a2517624a5`.

## Realizzato

1. **QA su 100 seed** con `systems/match-engine/qa-100-seeds.mjs` e runner `cli-qa.mjs`: 90 minuti pieni, 22 giocatori iniziali, score da `goal`, verifiche su tiri/falli/possesso, bounds degli attori e della palla, ordine e unicità eventi, `fulltime`, sostituzioni, comandi e formazione 4-4-2 → 3-5-2 a t=600. Nessun teletrasporto immediato al comando; su riposizionamenti senza kickoff nel periodo osservato si misura il recupero delle nuove posizioni.
2. **Ordine individuale `shout`**: `commands.js` mantiene la compatibilità con i quattro toni di squadra V1; quando `payload.targetPlayerId` è presente, accetta solo `encourage`/`harsh` su giocatore attivo della propria squadra. Rifiuti espliciti, cooldown **120 secondi simulati per giocatore**, temporaneità **150 secondi simulati**, senza accumulare bonus. `orders.js` calcola `modifier` graduato da carattere, autocontrollo, disciplina, fiducia, leadership e geografia già fornita da PlayerV2/CoachV2 (nessuna generazione locale di nomi/dialetti). Il richiamo duro può avere esito prestazionale negativo o lievemente positivo a seconda del giocatore. Effetto inserito in `movement.js` e nei passaggi, dribbling, contrasti e tiri di `actions.js`; nessun gol prefissato.
3. **Nuovo evento `coach_shout`** univoco con `id,t,teamId,playerId,detail:{tone,accepted,affinity,temporaryEffect:{modifier,startedAt,expiresAt},persistentSuggestion:{playerTrustDelta,coachMoraleDelta},utteranceId?}`. Le variazioni durature sono **solo proposte di input** per l'Agente 09; il motore non cambia `coach.morale`, rapporti persistenti, ledger economico o punteggio all'accettazione dell'ordine.
4. **Bridge idempotente verso 09**: `coach-effects.js` esporta `collectCoachEffects(events, appliedEventIds, {matchId})`. Produce `effects` e `appliedEventIds` come valori puri, deduplicati per la chiave `matchId:event.id`. `matchId` persistente obbligatorio per non confondere partite di stagioni diverse. Il chiamante 09 deve validare delta, applicare e registrare ID **nella medesima transazione di salvataggio**. Nessuna persistenza eseguita dall'engine.
5. **Bilanciamento tiri**: calibrata in `actions.js` la scelta di concludere verso la porta dopo il primo campione, che aveva volume di tiri e gol elevato. È un valore preliminare di gameplay, non un dato calcistico certificato del 1979.
6. **Documentazione** aggiornata `README.md`, `integration-notes.md`, `package.json` (`npm run qa`) e aggiunti 8 test di regressione `tests/r02.test.mjs`.

## Verifiche effettivamente eseguite

- **Esecuzione JavaScript in V8 Code Mode su codice letto dal branch, non semplice esame statico**: **25/25 test superati**, 17 del ciclo precedente più 8 del nuovo (API, input non validi, toni, cooldown, affinità, temporaneità, movimento osservabile, seed, bridge senza duplicati, campione 100 seed).
- **100/100 gare** raggiungono `fulltime` a t=5400; **10/10 replay** dei seed iniziali riproducono stesso score/log; **100/100 ordini individuali** accettati e **100/100 sostituzioni** applicate e registrate; goal sempre coerenti con eventi e contatori.
- **Modulo dinamico:** nessun mutamento istantaneo delle coordinate al comando; 99/99 finestre senza kickoff nel periodo osservato recuperano gli ancoraggi del 3-5-2; passo massimo non interrotto osservato **5,892 metri/secondo simulato**. Un caso escluso dal confronto di ancoraggi perché è comparso un kickoff durante la finestra.
- **Metriche 100 seed, entrambe le squadre/90 minuti:** media **3,07 gol** (range **0–9**); **35,32 tiri**, **855,68 passaggi**, **7,61 falli**, **9,07 fuorigioco**; possesso medio casa **45,756%**; totali **7 infortuni e 10 cartellini rossi**.
- **Prima della calibrazione** il primo campione R02 su 100 seed presentava 4,43 gol e 48,45 tiri medi, quindi il problema è stato quantificato e migliorato con la medesima procedura.
- **Vincolo ambientale:** il contenitore locale dispone di Node v22.16.0 ma non può risolvere `github.com` (`git ls-remote` ha restituito `Could not resolve host: github.com`); i file remoti sono stati controllati e i test eseguiti in un ambiente JS V8 con import/export adattati e assert compatibili. **Non** dichiaro eseguito localmente `node --test` o uno smoke browser Android. I file test nativi Node sono versionati per il QA successivo.
- La PR #35 modifica esclusivamente `oronzo/systems/match-engine/**` e il presente `oronzo/coordination/06-match-engine/REPORT.md`; nessun `NEXT.md`, file dei colleghi o runtime HTML/CSS modificato.

## API e integrazione

**Contratti precedenti preservati:** `createMatch(input)`, `step(dt,commands?)`, `snapshot()`, `getEventsSince(lastEventId)`, `command()`, `setPaused()`, `setSpeed()`; vecchi `shout` di squadra ancora ammessi.

**Nuovo comando:**
```js
{
  type:'shout',teamId,
  payload:{
    targetPlayerId:'player-id',tone:'encourage'|'harsh',
    utteranceId:'copy-id',
    coachOrigin:{regionId:'campania',macroRegion:'south'},
    playerOrigin:{regionId:'campania',macroRegion:'south'},
    coachTraits:{leadership:50},
    playerTrust:50
  }
}
```
Le regioni e valori numerici in questo esempio sono dati illustrativi, non estratti dal dataset. L'engine privilegia `player.origin` canonico quando presente. Nuovo evento `coach_shout` nel feed `getEventsSince(lastId)`; `collectCoachEffects` richiede `matchId` per derivare proposte persistenti una sola volta.

- **Agente 03 (runtime):** il runner `oronzo/partita-rapida.html` su `main` usa già `match.step(quickMatchSimDelta(dt,speed))`, con 1× circa **15 minuti reali**. Questa PR **non** tocca il clock né l'HTML; NON chiamare in aggiunta il legacy `advanceRealSeconds()` (rapporto storico 60×), che rimane compatibile solo per vecchi client. UI dei nuovi comandi da collegare nel ciclo runtime autorizzato dell'Agente 03.
- **Agente 05 (render):** leggere snapshot prima/dopo e usare feed ID unico `coach_shout` per feedback; camera full/TV non modifica lo stato dell'engine.
- **Agente 07 (flow):** fornire ID persistente univoco del match e passare origin/coach traits via adapter; deduplica effetti da transazione persistente del 09.
- **Agente 08 (attributi):** fornire `origin.regionId/macroRegion`, tratti e `relationshipWithCoach` reali; nessun generatore o `effectiveAbility` duplicato dal motore.
- **Agente 09 (coach-club):** ricevere solo gli eventi `coach_shout` filtrati per cursor e `collectCoachEffects`; decidere e applicare il delta relazionale/morale in transazione con `appliedEventIds`, con clamp/0=game over propri del dominio carriera.
- **Agente 04:** mappare `utteranceId` a testi originali verificati linguisticamente, senza incorporare dialetto non verificato nel motore.

## Mancante, problemi e limiti

- Le formule di risposta, durata e cooldown sono **proposte iniziali tecniche** v0.2, soggette a design balancing dopo test Android. I 35,32 tiri medi restano un possibile eccesso rispetto a competizioni storiche; dati reali 1979 non verificati in questo ciclo.
- L'interfaccia esistente **non dispone ancora dei nuovi controlli individuali** integrati: funzionalità del modulo PR #35, non del runtime già pubblicato.
- Persistenza coach morale, fiducia e game over spettano all'Agente 09; questa PR non produce mutazioni a lungo termine.
- Rimesse, rigori e regole complete della gara sono ancora semplificate come nella PR #18.
- Non è stato fatto alcun merge né nuove modifiche a `main`.

## Proposte ciclo successivo (solo su NEXT autorizzato)

1. QA `node --test` su checkout completo e smoke Android con Agenti 03/05/09; verificare che una seconda visualizzazione/event replay non raddoppi relazioni dopo reload.
2. Confrontare tiri, possesso e gol con dati storici verificati per calibrazione definitiva, senza intaccare determinismo.
3. Eventuale estensione di ordini personali/ruoli di reparto solo dopo gate d'integrazione e revisione v0.2.
