# ORONZO — AGENTE 10-BIS · PRIMO CICLO DI ORCHESTRAZIONE

**STATO: `READY_ACTIVATION_AND_HANDOFF_R11` — 9 novembre 2026.** Nuova issue di coordinamento [#65](https://github.com/CzekUns/cercax/issues/65). Leggi `HANDOFF.md` e `IDENTITY.md` prima di consultare i vecchi file del 10. Non avviare sviluppo nel vecchio orchestratore. Non eseguire merge durante l'onboarding.

## Missione immediata: rimuovere il blocco per il playtest persistente
- [ ] Verifica live **[PR #63](https://github.com/CzekUns/cercax/pull/63)** e **[audit #64](https://github.com/CzekUns/cercax/pull/64)**; HEAD, test, stato merge, eventuali nuovi commenti. L'ultimo audit noto ha verdict **NEEDS CHANGES** (non sovrascrivere il report dell'auditor).
- [ ] Conferma a **07-bis** la sequenza: **P0-A stessa PR #63** corregge UI training salvata (Recupero 73% deve restare sui pulsanti/slider dopo reload) e avvisi espliciti in caso di salvataggio fallito; **P0-B PR backend distinta** risolve carriere standard > quota localStorage (due slot recuperabili, protezione legacy e failure atomico).
- [ ] Solo ai nuovi HEAD richiedi **Agente00** QA mirato: Node nativo + Chromium HTTP carriere standard, training, 2 stagioni 30/38, recupero dopo errori/quota, salvataggi e touch Android landscape; distingue bug originari, fix UI e backend. Stadio soltanto read-only se adapter assente.
- [ ] Dopo PASS verificabile, presenta al proprietario **ordine di merge e caveat**; non mergiare senza sua autorizzazione. Dopo merge verifica main e Playtest con12.

## Backlog che erediti integralmente
- [ ] Adapter **Stadio Career07-bis ↔ Coach09**, dati club.stadium dichiarati, prezzi/affluenza/incassi e ledger atomicamente una sola volta.
- [ ] Integrazione richieste presidente / mercato / finestre / seller release / trasferimenti / salari senza clone.
- [ ] Persistenza fiducia da ordini06 via09 una sola volta, no doppio bonus temporaneo.
- [ ] 600 cognomi realmente passati dalla nuova carriera a PlayerV2, preservare 500 comuni da fonte contemporanea.
- [ ] UI partita FULL/TV via renderer05 e comandi individuali/formation attraverso API reali; no toast fittizi.
- [ ] Sezioni Campionato/Presidente/Stadio/Tifoseria/Agenda/Formazione più ricche con 07-bis, 12 solo screenshot-fixer; nessun lavoro simultaneo in `career-r03.js`.
- [ ] Review PR #12 cutscene solo quando i blocchi giocabilità sono risolti.
- [ ] Mantenere TODO R11, registro agenti, protocollo e tutti i NEXT coerenti; nessuna duplicazione di issue/PR.

## Divieti e test
**10-bis non scrive codice di gameplay**, conserva ruoli degli autori; 07 originale e 10 originale sono storici/standby. Distinguere `OPEN`, `PASS`, `MERGED` e `PLAYABLE`. Nessun merge a prescindere dalla prova, nessuna modifica ai report dell'auditor come se fossero proprio lavoro. La chat 10-bis non è attivata automaticamente dai documenti.

**Output del primo turno attivo:** stato attuale dopo una nuova lettura GitHub, P0 assegnati, prossimo prompt da inoltrare al 07-bis o00 secondo il gate, eventuale documento NEXT/issue aggiornato. Evitare una roadmap generica: il primo obiettivo è **non perdere più la carriera dopo la settimana31**.
