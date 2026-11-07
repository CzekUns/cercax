# Handoff per orchestratore e Agente 5

## Nessun innesto nel prototipo

Non sono stati modificati `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` o cartelle degli altri agenti. Occorre sostituire il vecchio loop illustrativo con una chiamata a `createMatch(input)` e una proiezione di `snapshot()`; il modulo non deve importare codice dell'Agente 5.

## Collegamento minimale

1. Caricare ESM `match-engine.js`; predisporre MatchInputV1 usando club e PlayerV1 degli agenti 7/8, XI, panchine e tattiche dell'Agente 9.
2. All'avvio `const match=createMatch(input)`; nel loop reale chiamare `match.advanceRealSeconds(deltaRealSeconds)`. A 1× ogni 1 s reale avanza di 60 s simulati; pause con `match.setPaused(true)`; velocità `match.setSpeed(1|2|4|8)`.
3. Renderizzare `snapshot().players` e `snapshot().ball` a ogni frame: coordinate `x*logicalWidth`, `y*logicalHeight`, con campo logico 640×360, viewport 16:9 **landscape**. L'engine è l'unica autorità per coordinate, proprietà palla e punteggio.
4. Interpolare fra campioni (non inventare corse, tiri o risultati). `action` guida le sequenze sprite `idle/run/pass/dribble/tackle/shot/save`; `facing` è **in radianti**, compatibile con `resolveFacing()` di #15: est=0, sud=π/2, ovest=π, nord=−π/2. A riposo preserva l'ultimo angolo. Non trattare 0/π come 1/−1. La direzione del primo tempo è casa verso +x, ospiti verso −x; in secondo tempo è invertita.
5. Usare **`getEventsSince(lastId)`** come feed autorevole per replay, commento, cutscene, sostituzioni e UI; avanzare il cursore dopo il consumo. `command()` registra subito il fatto e lo ripropone una sola volta nel prossimo `step()`; evitare deduplicazioni basate su timestamp. L'evento `shot` precede un eventuale `goal`; `goal.detail.assistId` è opzionale, escluso su mancata ricezione, nuova azione o cambio possesso. L'Agente 8 può leggerlo per lo storico senza creare eventi sintetici. Nessuna cutscene deve modificare il risultato. `events` nello snapshot riguarda solo l'ultimo avanzamento e può contenere molti fatti quando `dt` è grande.
6. Per il coach usare `match.command({type,teamId,payload})`; mostrare `accepted` oppure `reason` per evitare ordini persi. Per sostituzione passare string ID dell'XI e della panchina. Leggere `substitution.detail.goalkeeper`: se true aggiornare gli ID portiere nella vista #15 tramite `setKeepers()`. Altrimenti la vista può usare il portiere precedente per le animazioni. L'ordine dei giocatori nella formazione è l'ordine dell'XI, a eccezione del GK portato allo slot zero.
7. A `match.isFinished()` consegnare a carriera score/stats e log di eventi; non applicare punti o compensi dentro il match-engine.

## Avvertenze interfaccia

`energy` del motore è [0,100], mentre #15 necessita di riscalarla in [0,1] per l'HUD (ORZ-P2-001, assegnato all'Agente 5). Il motore usa `technical.decisions`, `status.fitness`, `status.health` applicati una volta alle abilità grezze; niente doppio `effectiveAbility` senza coordinamento #16. La fisica avanza a unità intere di 1 s; per rendering realmente fluido usare interpolazione visiva o un piccolo buffer fra snapshot successivi. `height` palla è una quantità visiva astratta. Lo spostamento istantaneo a centrocampo dopo un gol o all'intervallo è una ripresa di gioco, non un movimento da interpolare: resettare le interpolazioni al `kickoff`.

I valori `phase` e `t` sono in tempo simulato. L'intervallo emette `halftime`, poi `kickoff` nel medesimo step senza pausa obbligatoria. Non mostrare un secondo intervallo di 15 minuti reali; per la cutscene si può sospendere lo step e riprendere dopo.

## QA per merge

Eseguire dalla directory `oronzo/systems/match-engine`: `node --test` e `node cli-demo.mjs 10`. Valutare su smartphone il pannello `demo.html` e il renderer dell'Agente 5 **soltanto dopo** l'integrazione. Verificare anche gli scenari con espulsione, infortunio, cambio del portiere, marcatura a uomo, tempi di gioco non multipli di uno e pausa sul background.

L'attuale demo/fixture usa club inventati e non richiede risorse dell'Agente 1 o dell'Agente 2.
