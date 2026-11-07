# ORONZO · Conferenze, emittenti e richiami · Pacchetto R02

**Owner:** ORONZO-AGENT-04. **Scope:** `oronzo/content/`. **Visione prevalente:** `coordination/GAME-VISION-v02.md`; la carriera inizia nel **1979**. Gli altri contenuti dei presidenti, personaggi, eventi, dialoghi e microtesti rimangono immutati.

## Consegna

| Percorso | Dato / funzione |
| --- | --- |
| `press-opening.json` | **37** domande per conferenza iniziale, 3 risposte ciascuna; `requestedQuestions:5` |
| `press-postmatch.json` | **32** domande postpartita, 3 risposte ciascuna; `requestedQuestions:2` |
| `press-media.json` | **12** archetipi di cronisti (due ID canonici preesistenti), **8** TV private completamente inventate, pool per i nomi |
| `individual-shouts.json` | **80** frasi italiane originali per singoli giocatori, su 10 situazioni e due intenti |
| `press-kit.js` | ESM puro: selezione seeded, anagrafiche, sessione persistibile, deduplica risposte, selezione battute |
| `press-demo.html` | Demo interattiva landscape che **simula** i delta su indicatori locali, senza applicarli al gioco |
| `validate-press.mjs` | Validator e stress test con 400 sessioni seeded |
| `PRESS-R02.md` | Questo contratto d'integrazione |

## Formati JSON

**Domanda:** `{id,phase,topic,text,when,weight,answers:[{id,label,text,effects:{coachMorale,supportersTrust,mediaReputation,presidentTrust}}]}`. I quattro campi `effects` sono **delta semantici interi -3..+3**, non operazioni sullo stato. Ogni domanda ha almeno **tre** risposte, con etichette fino a 38 caratteri e battute fino a 180; `text` domanda fino a 180. I due file sono indipendenti; `opening` ha 30 domande generiche e sette condizionate, per avere sempre almeno cinque domande eleggibili. `postmatch` contiene domande generiche e specifiche su win/draw/loss, più condizioni fattuali.

**Cronista:** `{id,fixedName?,characterRef?,nameGender,role,tone,motivation,beats,questionOpeners,traits}`. Raffaele Corsi e Piero Masi riutilizzano gli ID e i nomi già presenti in `characters.json`; gli altri dieci archetipi ricevono nomi generati deterministici dai pool. Le TV hanno `{id,name,kind,style,tagline,tone,period,fictional:true}`; marchi immaginari da verificare comunque prima di commercializzare il gioco: la generazione non garantisce disponibilità legale.

**Battuta singolo:** `{id,target:"single_player",situation,intent,tone,intensity,language:"it-IT",text,hint,cooldownActions}`. `hint` **non** è una formula di rendimento; il motore partita e il sistema relazionale decidono come trattare le reazioni del calciatore secondo le sue caratteristiche. `regionalVariants:[]` è volutamente vuoto: le localizzazioni regionali sono bloccate da `releaseAllowed:false` in attesa di fonte linguistica e revisione competente. Non si attribuiscono termini inventati ai dialetti.

## API pubblica di press-kit.js

- `seedHash(seed)`, `seededRng(seed)`, `seededShuffle(items,seed)`: casualità ripetibile e senza `Math.random()`.
- `buildPressRoster(media,seed)`: restituisce 12 cronisti originali con nome unico e `broadcasterId`, mantenendo i due giornalisti canonici. È stabile a parità di seed/club. Usare una volta e persistere gli ID.
- `matchesPressContext(when,context)`: non ammette chiavi sconosciute né considera vero un attributo non disponibile.
- `selectConferenceQuestions(catalog,phase,context,seed,excludeIds=[])`: estrae senza ripetizioni, cinque domande iniziali distribuite su argomenti diversi e due postpartita; **almeno una** postpartita è esplicitamente legata all'esito finale effettivo.
- `createPressConference({catalog,media,phase,context,careerSeed,sessionKey})`: crea sessione serializzabile con `sessionId`, domande e firme di cronisti. Per `postmatch` richiede `context.matchFinal===true`, `result` in `win|draw|loss` e `sessionKey===context.matchId`; il risultato deve essere derivato dal match engine, non inventato da copy.
- `answerPressConference(session,questionId,answerId)`: funziona una sola volta per domanda, restituisce `{accepted,session,selection,semanticEffects,effectTransactionId}`. Non modifica né club, coach, score o altri oggetti. Una seconda chiamata sulla sessione **aggiornata** restituisce `accepted:false,reason:"already_answered"` e **nessun nuovo effetto**.
- `pickIndividualShout(catalog,{situation,intent,tone?,seed,usedIds=[]})`: seleziona battuta singola in italiano standard con esclusione esplicita delle recenti; nessuna applicazione di bonus/malus, che compete agli Agenti 06/09.

## Collegamenti necessari (proprietari dei moduli)

### Agente 07 — carriera / game-flow
1. Nella **nuova carriera** dopo scelta ingaggio e presidente persistente, costruire `context` dell'opening dalle offerte realmente salvate (`offerDistance`: `same_region|other_region|other_macroregion`; `offerPayBand`: `low|mid|high`; `clubObjective`: `salvezza|metà_classifica|promozione`; `president.traits`, e indicatori dell'allenatore). Chiamare una volta `createPressConference` con seed carriera **persistente** e `sessionKey:"start"`.
2. Memorizzare `sessionId`, `questions`, `journalistId`, `broadcasterId`, `answers` e `completed` in salvataggio versionato. **Non richiamare createPressConference su save/load**: ricaricare direttamente la sessione serializzata; altrimenti un cambio delle relazioni modificherebbe la banca ammissibile.
3. Dopo **ogni** gara `phase=fulltime`, derivare `result` e `matchId` canonico dallo snapshot e passare `context.matchFinal:true`. Fornire solo fatti reali (derby/coppa, ospiti, espulsione, infortunio, gol finale, tiri e fischi). Attributi non disponibili si omettono: non inventarli. `sessionKey=matchId` unico per gara impedisce confusione fra giornate.
4. Salvare risposta e `effectTransactionId` nello stesso passaggio che richiede al sistema di relazioni l'applicazione una sola volta; se il salvataggio viene ricaricato, non contabilizzare di nuovo un effetto già registrato.

### Agente 09 — morale coach, tifosi, media, presidente
- Mappare **esplicitamente** `coachMorale` sulla risorsa del mister (scala 0–100; `0` causa GAME OVER come da v0.2), `supportersTrust` sull'umore della tifoseria, `mediaReputation` sulla reputazione stampa, `presidentTrust` sul rapporto individuale con la presidenza. Non equiparare automaticamente `presidentTrust` a `boardTrust` senza contratto deliberato.
- Clamparli e registrarli in ledger/diario con `effectTransactionId`. Scegliere politiche temporali e quantità persistite dell'Agente 09; `press-kit.js` **non** applica mai i delta.
- Gli otto presidenti originali restano identici; i giornalisti non sono presidenti né possono approvare trasferimenti o modificare budget con una risposta stampa.

### Agente 03 — interfaccia runtime (ciclo successivo autorizzato)
- Renderizzare pannelli in 16:9 e tre pulsanti scelta leggibili, speaker e broadcaster presi dalla sessione. Mostrare gli effetti sintetici prima della conferma. Lato UI non estrarre altre domande né assegnare punteggi.
- `press-demo.html` è una **demo contenutistica separata**. I valori dimostrativi vengono clampati in browser a titolo di esempio: **non è** la logica di morale/relazioni del gioco e non sostituisce la futura schermata grafica.

### Agente 06 — partita, ordini e interventi individuali
- Selezionare `individual-shouts.json` in base a un fatto di gioco realmente emesso dal motore (`after_error`, `nervous`, `late_match`, ecc.), a tone/intensity e alla storia dei richiami.
- Calcolare i trade-off caratteriali e la durata degli effetti nel proprio modulo (esito non garantito); copy restituisce soltanto testo, intent e hint. Nessun evento narrativo forza gol, sostituzioni o esito.

## Test e demo

Da checkout della repository:

    node oronzo/content/validate-press.mjs
    python3 -m http.server 8000

Aprire `http://localhost:8000/oronzo/content/press-demo.html` in landscape. La demo può riprendere le domande già risposte da localStorage, ma questa persistenza **è dimostrativa**; il salvataggio ufficiale appartiene all'Agente 07.

**Nota storica:** v0.2 comincia nel 1979 e prevale sui commenti 1985/86 del pacchetto precedente. Nessuna domanda usa VAR, cellulari, social network o marche radio/TV reali. I due punti per vittoria dipendono dal ruleset ufficiale del campionato, non da frasi calcolate dai dati.
