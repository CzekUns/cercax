# AGENTE 8 — STATISTICHE, PERSONALITÀ, CRESCITA E ALLENAMENTI

Repository: `CzekUns/cercax`
Branch ESCLUSIVO: `agent/oronzo-attributes`
Issue: https://github.com/CzekUns/cercax/issues/10
Directory ESCLUSIVA scrivibile: `oronzo/systems/attributes/`

Prima di operare leggi davvero `oronzo/AGENTS.md`, `oronzo/README.md`, `oronzo/engine-contract.md`, `oronzo/game.js` (sola lettura), l'issue assegnata e i file degli altri agenti solo se utili alla compatibilità. Il progetto è un manageriale calcistico del 1985, smartphone **esclusivamente orizzontale 16:9**, grafica pixel art 1990–95 (NON cubetti provvisori come prodotto finale). Gli altri agenti producono sprite, scene e UI: non duplicare il loro lavoro né copiare asset di giochi/film. Implementa **codice eseguibile con test**, non soltanto descrizioni o storyboard. JavaScript ESM nativo senza backend né librerie obbligatorie. **Lavora unicamente nella directory assegnata**; non modificare `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` o i file root CercaX. L'orchestratore integrerà la tua PR. Se devi richiedere modifiche ad altri moduli, scrivile in `integration-notes.md`.


## MISSIONE OPERATIVA
Rendi davvero differenti i calciatori: un fenomeno fragile, un attaccante veloce ma emotivamente instabile, un portiere affidabile e poco spettacolare, il talento sfortunato, il giocatore carismatico che trascina lo spogliatoio. Tutto deve avere **effetti misurabili nel gameplay**, senza caricature deterministiche.

### Consegne obbligatorie
1. `player-model.js`: schema PlayerV1 con attributi `technical/physical/mental/status` (0–100), posizioni, età, piede, personalità e rapporti. Funzioni create/validate/normalize con clamp e ID stabili. Import da legacy `game.js` (`tech,speed,stamina,luck,character,confidence,health,morale,fatigue`) senza perdere dati.
2. `generator.js`: generatori seed-based di 100+ calciatori coerenti per categoria e ruolo (no tutti uguali), archetipi naturali non artificiali, posizioni e statistiche di portieri credibili. Squadra titolare/riserva composita.
3. `training.js`: allenamenti tecnici, atletici, tattici, riposo; carichi, accumulo fatica, recupero, forma, progressi settimanali, rischio sovraccarico, recupero salute; istruzioni del mister dall'agente 9.
4. `personality.js`: disciplina, autocontrollo, fortuna (effetto moderato sulla varianza), fiducia, ambizione, carattere e rapporti influenzano scelta/esecuzione istruzioni e resa sotto pressione. API pura `effectiveAbility(player,context)` e `applyTrainingWeek(...)`, senza eventi di punteggio inventati.
5. `career-stats.js` conteggia presenze, minuti, gol, assist, ammonizioni, infortuni, stagioni e crescita storica a partire da eventi reali del motore; `demo.html`, `README.md`, `integration-notes.md` e test di invarianti, distribuzione, infortuni, fatigue e seed.

### Bilanciamento
Statistiche osservabili/descrivibili; `luck` è una sfumatura delle probabilità, mai «fallisce sempre» o «si rompe sempre». Distingui predisposizione da evento certo, cura e fattori di salute senza rappresentazioni mediche sensazionalistiche. I cambi numerici rimangono limitati e giustificati; forma e affaticamento devono pesare davvero sull'efficacia tattica.

## CONSEGNA VINCOLANTE
Metti il codice effettivamente funzionante nella directory assegnata sul tuo branch, testalo, indica i comandi eseguiti, prepara una PR verso `main` e fornisci il link. Non limitarti a studi, testi o schemi; non dichiarare completate funzionalità solo abbozzate. Il runtime `oronzo/game.js` rimane all'orchestratore.
