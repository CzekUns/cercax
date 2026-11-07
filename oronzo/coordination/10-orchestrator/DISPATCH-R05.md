# ORONZO — DISPATCH COORDINAMENTO R05 · 7 novembre 2026
**Agente 10 · solo regole, priorità, contratti e review. Nessun codice di gioco modificato da 10.**
**Scopo:** chiudere R02 e permettere i due cicli d'integrazione separati di 07 (flow) e 03 (UI) quando le condizioni sono effettivamente superate. Non confondere autorizzazione in NEXT con avvio automatico delle chat.

## Fonte di verità
`PROTOCOL.md`, `GAME-VISION-v02.md`, `10-orchestrator/CONTRACT-v02.md`, `registry.json`, [audit R04 #36](https://github.com/CzekUns/cercax/pull/36), [Epic #25](https://github.com/CzekUns/cercax/issues/25), [Integration #26](https://github.com/CzekUns/cercax/issues/26). Alla verifica live, #34 è **MERGED** in `b8976cb2b0129de9ee6537e1d624abce9ff1402f`; #30/#32/#31/#35/#33/#28/#29 sono ancora **OPEN** e #12 è **OPEN/DRAFT**.

## Ordine di avvio, dipendenze e proprietari
| Fase | Agente / PR | Autorizzazione adesso | Deliverable / gate |
| --- | --- | --- | --- |
| 0 | **00** reviewer, nuovo REQUEST R05 | **READY PER NUOVO AUDIT** | Verificare HEAD correnti #30/#32 e test combinati Node; riferire PASS/FAIL e merge consigliati. Merge solo su mandato esplicito nella chat 00 per R05, non ereditare R04 |
| A | **07** #30, **09** #32 | **WAIT_REVIEW** (correzioni già pubblicate) | Gate anti-doppio pagamento V1/V2 e fixture payroll; test 104 club × due stagioni, corretta migrazione ledger e coach |
| B | **08** #31, **06** #35 | **FIX_REQUESTED / lavorare in parallelo** | Schema PlayerV2 e tone/trust/origin compatibili, effetto temporaneo unico 06, ledger persistente 09; suite incrociata con save/replay |
| C | **01** #29, **05** #28 | **HOLD / QA da completare** | browser con **PNG realmente caricati** (22 sprite), due camere, 640×360 e 844×390, arte leggibile e niente marcatori fallback |
| C | **03** #33 | **WAIT_REVIEW / completare gate** | Chromium emulato già eseguito su HEAD attuale con asset intercept; QA leggibilità 8–9px, reale HTTP/GitHub Pages e touch device se accessibile, senza spacciare test mock per hosting |
| D | **02** #12 draft | **HOLD** | rifiniture 5 cutscene, sei frame unici, gate artistico e browser, no merge di draft |
| D | **04** #34 merged | **DONE / BLOCKED** | 37 opening, 32 postmatch, 80 shouts disponibili su main. Aspetta stile dialoghi approvato dall'utente, niente nuova produzione R03 |
| E | **07**, futuro `oronzo/app/flow/` | **PREPARATO, NON AUTORIZZATO** | **Solo dopo #30+#32 merge e Node combinato verde**; realizzare mondo 1979, 20 offerte, controller/saves e consumatori #04/#06/#08/#09, rispetto gate shout #31/#35 |
| F | **03**, futuro UI runtime | **PREPARATO, NON AUTORIZZATO** | **Solo dopo #33 merge e adapter 07 disponibile**, compatibilità #31/#35 per gli ordini, QA browser; possiede `index.html`, `game.js`, `ui.css`, `partita-rapida.html` in PR *diversa* |

## Dati primo rilascio
**M1 = 100 piccoli comuni + 500 cognomi italiani distinti e verificati**. Ulteriore obiettivo 500/5000 non blocca M1. Ricerca delegata all'automazione oraria `ORONZO · Revisione oraria`, già attiva, in **una PR dati** `data/oronzo-world-research` sotto `oronzo/data/research/`. Il dataset non è considerato consegnato fino a PR, validazione fonti/licenze e import 07/08; niente scraping duplicato da agenti produttivi. Non inventare ranking di piccolezza/rarità non verificati.

## Accettazione del primo rilascio funzionante
Partenza 1979, nuova/carica, avatar e stats vere, 20 offerte seed-stabili con costo morale, presidente persistente e relazioni, 5 domande apertura e 2 postmatch, hub, rose e training, partita 11v11 con tattiche applicate e camera full/TV, salvataggi/ledger idempotenti anche su due stagioni, conseguenze reali e game over morale=0. Su telefono landscape 16:9 con test touch e asset reali. Demo standalone NON soddisfa l'end-to-end.

## Regole di gate
- **00** controlla e documenta, senza implementare feature né modificare NEXT; merge solo dopo test realmente eseguiti, scope/HEAD/CI controllati e autorizzazione eccezionale **nuova** per R05 data direttamente dall'utente nella chat 00. R04 era limitato alla sessione passata e non è riattivabile per deduzione.
- **07/09** non iniziano integrazione del flusso prima di review/merge del fix.
- **06/08** correggono ciascuno la propria PR senza toccare altri owner. Chiave univoca `matchId:eventId`; niente bonus temporaneo 06 + 08 duplicato.
- **03** non cambia file root nel ciclo UI-art; **05** non cambia motore o HTML root; **01** non cambia rendering, **02** non apre altra PR.
- Nessun report dichiara test su dispositivo/browser non eseguiti. I campioni di comuni/cognomi non diventano dataset validato senza prova.
