# ORONZO — Contratto dati V2 proposto per visione 1979
**Stato:** proposta d'integrazione dell'Agente 10, 7 novembre 2026. Non sostituisce automaticamente le API V1 già presenti; ogni agente mantiene compatibilità e documenta la migrazione. Fonte: [Game Vision v0.2](../GAME-VISION-v02.md) e [epic #25](https://github.com/CzekUns/cercax/issues/25).

## Soglia dei dataset per M1 e filiera dati approvata
Decisione aggiornata dell'utente: **prima release = 100 comuni verificati e 500 cognomi italiani distinti verificati**, entrambi con provenienza/diritti di riuso. Obiettivo espansione **500 comuni e 5.000 cognomi**. Rarità/demografia vanno rivendicate solo con ranking verificabile, non inferite. La **raccolta** è dell'automazione oraria sul branch `data/oronzo-world-research` in `oronzo/data/research/`, senza codice engine né merge automatici; 07 importa/mappa i comuni e 08 importa i cognomi soltanto dopo QA dataset e approvazione della PR. Gli ID canonici non devono cambiare quando il catalogo viene ampliato; salvataggi/seed mantengono le identità già estratte.

## Chiusura bug R04 — ownership del periodo e degli effetti
- **07** migra V1/V2, incluso *ledger* transazioni, settledWeeks, board/meeting/promesse con anno originario verificabile; in casi ambigui segnala impossibilità di migrazione automatica e non consente addebiti duplicati.
- **09** rifiuta contabilizzazione con periodo misto o registro legacy non migrato, usa chiavi concordate `{week,absoluteWeek,seasonYear}`, salva una sola volta.
- **08** è fonte della struttura persistente PlayerV2 `origin:{comune,regione,macroregione}`, `relationships.coachTrust`; **06** legge/normalizza quella struttura nel comando partita. Tono API 06 `encourage|harsh`; etichette 08 `gentle|hard` mappate esplicitamente, mai passate senza conversione.
- **06** è unico responsabile degli effetti *temporanei* dello shout durante il match. **09** applica una sola volta gli effetti persistenti, con chiave `matchId:eventId` salvata atomicamente ai delta; **08** non ricalcola/riapplica bonus temporanei su un evento già risolto dal 06. TEST obbligatorio su stessi eventi e reload.

## Ruolo di coordinamento
Agente 10 **non scrive implementazioni**. Tutti gli schemi qui definiti sono contratti da recepire negli scope degli agenti. L'adapter `oronzo/app/flow/` sarà affidato all'agente 07 SOLO in un ciclo successivo al merge R02; il runtime HTML/CSS/JS sarà affidato all'agente 03 SOLO in un ciclo successivo alla consegna grafica e al gate R02. Non attribuire al coordinatore l'esecuzione di test, codice o asset.

## Convenzioni
- Solo il match-engine 06 modifica punteggio, fatti e coordinate. Solo career 07 avanzamento del tempo, classifiche, fixtures, mercato calendarizzato e save. Solo coach-club 09 bilancio, relazioni, morale coach e decisioni societarie. Attributes 08 produce caratteristiche dei calciatori. Copy 04 fornisce testi ed effetti descritti con ID. Match-view 05 legge snapshot e sceglie camera. 07 compone i dati/lo stato di carriera nell'adapter; 03 compone la UI runtime; 10 assegna e verifica le regole.
- Numeri affettivi/tratti 0..100, calcolo deterministico e clamp. Il morale del mister **è distinto** da tifosi, fiducia presidenza, gruppo, stampa e singoli. `coach.morale <= 0` crea stato game over persistito con causa/ID evento, applicato una sola volta.
- ID persistenti stabili per coach, giocatore, club, comune, presidente, giornalista, evento, offerta. Non usare `Math.random()` in gameplay; salvare seed e stato RNG o i risultati random già scelti. Snapshot non è la fonte del ledger.

## GeographyV2 (owner 07)
```js
{
  municipalityId: "ISTAT-code-string",
  municipalityName: "Comune di esempio",
  provinceCode: "XX",
  regionId: "region-slug",
  macroRegion: "north" | "centre" | "south",
  population: 123,
  populationReferenceYear: 2025,
  sourceId: "dataset-version-and-license"
}
```
`population` e `populationReferenceYear` sono ESEMPI DI CAMPI, non dati reali. 07 documenta origine/anno/licenza. Le isole vanno mappate esplicitamente e in modo stabile nella suddivisione a tre macroregioni richiesta. Geografia storica 1979 e comuni attuali possono divergere: segnalare la scelta dati.

## CoachV2 (owner 09, con campi di carriera preservati da 07)
```js
{
  ...coachV1,
  avatarId: "coach-avatar-id",
  origin: { municipalityId, regionId, macroRegion },
  traits: { luck: 50, leadership: 50, selfEsteem: 50, patience: 50 },
  morale: 50,
  relationships: {
    board: 50, squad: 50, fans: 50, media: 50,
    playerTrustById: { "player-id": 50 }
  },
  gameOver: null | { eventId: "event-id", reason: "morale_zero", date: "YYYY-MM-DD" },
  employmentHistory: [], hiredSeason: 1979
}
```
I valori 50 sono placeholder di schema, NON formule finali. `luck` dell'allenatore e `mental.luck` dei singoli sono diversi. Non perdere `employmentHistory` o `hiredSeason` attraverso factory/save; contratto storico R02 va chiuso prima di introdurre V2.

## ClubV2 (owner 07 per identità geografica, 09 per stato economico/sociale)
```js
{
  ...clubV1,
  municipalityId: "ISTAT-code-string",
  regionId: "region-slug",
  macroRegion: "north",
  presidentId: "canonical-profile-id",
  boardTraits: { papponeria: 50, fanAttachment: 50, spendingWillingness: 50 },
  supporters: { approval: 50 },
  stadium: { condition: 50, capacity: 0, ticketPriceITL: 0 },
  kits: { condition: 50 }
}
```
Un presidente viene estratto una sola volta alla creazione del mondo ed è persistito. `presidentId` deve risolvere il catalogo `content/presidents.json`; un profilo archetipico può essere riutilizzato senza confondere identità club. Bilancio/contratti utilizzano ITL interi non negativi e contabilizzazione una sola volta per partita/settimana.

## PlayerV2 (owner 08)
```js
{
  ...playerV1,
  surnameId: "surname-entry-id",
  origin: { municipalityId, regionId, macroRegion },
  mental: { ...playerV1.mental, madness: 50, recklessness: 50 },
  relationshipWithCoach: 50
}
```
Conservare i campi già validati, non rinominare `technical.decisions` o `mental.luck` dal v1. Il rapporto singolo persistente è contabilizzato da 09, 08 può inizializzarlo ed esporre modificatori stabili. Cognomi richiesti 5000, usare fonti verificabili e dataset versionati, non inventare frequenze.

## Contratto trasversale AppearanceV1 / KitV1 — requisito visivo approvato, pianificazione a richiesta (7 novembre 2026)

**Scopo:** lo **stesso calciatore** deve usare **la medesima identità cromatica e fisionomica** nella scheda da ROSA e ALLENAMENTO, negli 11v11, nelle cutscene e in una futura figurina/ritratto pixel art. **Fonte unica:** ID stabile del calciatore e dati cosmetici persistiti dal **08**; l'oggetto `appearance` del renderer si ottiene combinando dati cosmetici, divisa del club attivo e ruolo. Questo schema è **un contratto di prossima integrazione**, non si dichiara già implementato nei branch.

```js
// Sottostruttura serializzabile canonica del calciatore (08; 07 conserva dopo save/load)
player.visual = {
  skinToneId: "skin-tone-id",
  hairColorId: "hair-color-id",
  hairStyleId: "hair-style-id",
  facialHairStyleId: "none|moustache|goatee|short-beard|full-beard", // valore esemplificativo fra gli enum ammessi
  facialHairColorId: "hair-color-id",
  portraitAssetId: null // futura figurina/ritratto pixel art, opzionale
};

// Dati della divisa appartenenti al club e alla selezione kit, NON ai tratti del calciatore
club.visualKits = {
  home: {
    shirtA: "palette-id",
    shirtB: "palette-id",
    shirtPatternId: "solid|vertical-stripes|horizontal-stripes|band|halves",
    shorts: "palette-id",
    socks: "palette-id",
    trim: "palette-id"
  },
  away: { /* stessa shape: opzionale sino alla rispettiva iterazione */ },
  keeper: { /* palette e pattern del portiere, distinti dai giocatori di movimento */ }
};

// Proiezione (non una seconda fonte dati): resolveAppearance(player, club, kitId, role)
// -> {playerId, skinToneId, hairColorId, hairStyleId,
//     facialHairStyleId, facialHairColorId, shirtA, shirtB,
//     shirtPatternId, shorts, socks, trim, role, portraitAssetId}
```

- Le stringhe/enum negli esempi non rappresentano dati già presenti. I nomi effettivi vanno concordati in una sola interfaccia versionata prima dell'implementazione; il contratto non deve introdurre duplicati dei campi `origin`/trust oggi in correzione 06/08. Il `playerId` è la chiave autorevole; non rigenerare a ogni apertura o alterare dopo save/reload.
- La **fotografia di riferimento**, qualora venga fornita in futuro, alimenta la **figurina in pixel art** senza sostituire i dati visuali canonici: capelli, barba/baffi, pelle e kit devono coincidere. Asset/diritti di utilizzo da verificare prima di pubblicazione. Una figurina assente deve usare un placeholder pixel art coerente con i tratti.
- **Trasferimento/sostituzione kit:** cambiano colori e pattern, non viso/identità. Portiere distinto. Il sistema deve supportare 4–6 fantasie base alla prima release e restare estendibile; le micro-trame hanno fallback leggibile a 32×32.
- **Ownership:** 08 tratti/player ID; 07 persistenza e clubKit-ID nello stato di carriera; 01 sprites e maschere, 02 cutscene e maschere, 05 consumo da snapshot/render, 03 schede e ritratti/figurine UI. Nessun owner genera dati visuali divergenti in locale.
- **QA di accettazione futura:** stesso `playerId` e kit producono colori/tratti coerenti in scheda, formazione/match, cutscene, figurina; cambia club/kit senza cambiare barba, capelli o pelle; save/load mantiene `visual`; almeno due giocatori con capelli/barba/pelle diversi e due squadre con pattern diversi; casi portiere e dati visuali legacy assenti con default seed-stabile. Non forzare dettagli impossibili ai pixel senza intaccare la leggibilità.
- Questa direttiva **non riapre PR**, non chiede cambiamenti immediati al test `r02-cross.test.mjs` del 07 e non avvia un round di tutti gli agenti. Si applica ai cicli pertinenti quando 10 li autorizza.

## OfferV1 (owner 07 crea/offre, 09 valuta morale)
```js
{
  id: "offer-id",
  clubId: "club-id",
  coachWageITL: 0,
  advertisedPrestige: 50,
  generatedSeed: 123,
  expiresAtGameDate: null
}
```
07 genera esattamente 20 offerte iniziali senza duplicazione e le rende stabili. 09 fornisce funzione pura `previewOfferMorale(coach,offer,club)` che restituisce `{baseDistanceCost, selfEsteemMultiplier, finalMoraleDelta, reasons}`, e poi applica l'effetto una sola volta con event ID. Proposta configurabile: altra regione stessa macro 1, altra macro 3, massimo raddoppio da autostima alta/cachet basso, bonus locale ricco. Nessun coach morale calcolato da 07 o HTML.

## PressV1 (04 contenuto; 09 effetti)
```js
{
  journalists: [{ id, name, broadcasterId }],
  broadcasters: [{ id, name }],
  questions: [{
    id, phase: "season_opening" | "post_match", contextTags: [],
    text, answers: [
      { id, text, effects: { coachMorale: 0, fans: 0, media: 0, board: 0, squad: 0 } }
    ]
  }]
}
```
04 produce un question bank seed-safe e 5 domande iniziali senza ripetizioni, più conferenza dopo ogni match. Gli effetti sono delta semanticamente dichiarati, non applicati dal testo. 09 applica e valida clamp, 03 costruisce la UI, legge e visualizza le variazioni; 10 verifica la coerenza dei requisiti. Non obbligare ogni risposta a cambiare tutti gli indicatori.

## Match command individuale (06)
```js
{
  type: "shout", teamId,
  payload: {
    targetPlayerId: "player-id",
    tone: "encourage" | "harsh",
    utteranceId: "copy-id",
    coachOrigin: { regionId, macroRegion },
    playerOrigin: { regionId, macroRegion }
  }
}
```
L'engine con seed e stato calcola risposta TEMPORANEA alla direttiva; produce un evento unico `{id,type:'coach_shout',playerId,detail:{tone,accepted,temporaryEffect,...}}`. 09 consuma l'evento una volta per rapporti e morale persistente; 04 rende frase/localizzazione. Affinità: stessa regione > stessa macro > altra macro, ma dipende dal carattere e dal rapporto; evitare "magia" delle imprecazioni.

## Stato carriera e idempotenza (07 e 09)
```js
{
  gameDate: "1979-MM-DD",
  absoluteWeek: 1,
  seasonYear: 1979,
  seasonWeek: 1,
  rngState: "serialized-rng-state",
  offeredJobIds: ["offer-id"],
  appliedEventIds: ["stable-event-id"],
  coach, clubs, fixtures, standings, mediaState
}
```
I nomi campo sono PROPOSTE di interoperabilità; R02 richiede intanto `absoluteWeek` persistente. Non usare sola `seasonWeek` come chiave di paghe, riunioni, promise e biglietti dopo rollover. Test: due stagioni con almeno un save/load, evento ripetuto non produce doppi delta.

## Accettazione minima dell'integrazione delegata agli agenti 03 (UI) e 07 (flow)
1. A seed fisso e azioni fisse, stessa partita/ingaggi/stampa; due ricaricamenti non duplicano giornate, rapporti o spese.
2. Dati UI originali, carichi coerenti: 20 offerte, 5 domande iniziali, presidente dal catalogo, lista rosa e formazione avversaria, score da eventi goal, cambio modulo fisico.
3. Camera `full` e `broadcast` leggono stessi snapshot, senza ricalcolo.
4. Morale coach zero attiva gameOver e disabilita progressione: no corruzione del save.
5. I valori numerici ed esempi di schema saranno confermati solo dopo QA e feedback di gioco; le scelte storiche/licenze resteranno documentate.
