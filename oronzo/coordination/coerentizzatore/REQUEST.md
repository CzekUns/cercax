# RICHIESTA ATTIVA — COERENTIZZATORE ORONZO

**Stato:** `COMPLETED_R01` — audit consegnato in PR #19, nessun nuovo audit autorizzato.
**Priorità:** audit R01 concluso. Il rapporto è in https://github.com/CzekUns/cercax/pull/19; le correzioni sono tracciate in REVIEW-QUEUE.md. Non ripetere la sessione senza nuovo incarico.
**Creato da:** orchestratore principale, 7 novembre 2026.

## Incarico unico
Verifica che le seguenti tre PR aperte possano essere integrate senza rompere il gioco, limitandoti a **compatibilità tecnica tra moduli**, non a una valutazione estesa di grafica, UI, carriera, testo, società o gameplay completo:
- **#18 Agente 6 / Match Engine**: https://github.com/CzekUns/cercax/pull/18 — branch `agent/oronzo-match-engine`, HEAD osservato `71fa0aeac7dd694a8cae4962e35205a86c1579c0`.
- **#15 Agente 5 / Match View**: https://github.com/CzekUns/cercax/pull/15 — branch `agent/oronzo-movements`, HEAD osservato `5558c89f5104b40e49f74158b868e53966612dee`.
- **#16 Agente 8 / Attributes**: https://github.com/CzekUns/cercax/pull/16 — branch `agent/oronzo-attributes`, HEAD osservato `9105014b569e3290ba86590f597c2202dbca846e`.
Se gli HEAD sono cambiati, registra i nuovi SHA nel rapporto prima di procedere. Tutte e tre NON erano ancora mergiate al momento dell'assegnazione.

## Verifiche mirate
1. Contratto `oronzo/engine-contract.md`: MatchInputV1, MatchSnapshotV1 e PlayerV1. Confronta **nomi veri degli export JS**, import, struttura dei dati, coordinate normalizzate, tick `dt`, tempi, eventi goal/substitution e seed deterministico. Chiediti se il renderer #15 può usare direttamente gli snapshot prodotti da #18 e se #18 può consumare gli attributi di #16 senza adapter ambiguo o campi mancanti.
2. Individua al massimo **5 problemi prioritari P0/P1**, con file e riga/commit, descrizione del fallimento e patch consigliata. Verifica test esistenti se possibile; segnala se test non eseguibili. Se non ci sono difetti bloccanti, descrivi esattamente come collegare i tre moduli, incluse eventuali conversioni strettamente necessarie.
3. Produci una **matrice di interfaccia breve**: Origine -> Destinazione -> compatibilità (OK / INCOMPATIBILE / NON VERIFICATO) -> intervento/agente responsabile. Distinguere difetti effettivamente riprodotti da ipotesi.

## Limiti per risparmiare Work
- **Non esaminare tutte e nove le PR**; esamina solo #15, #16, #18 e i file di contratto necessari.
- Niente riscritture complete, niente ricerca storica, niente generazione immagini. Una sola passata mirata, poi fermati.
- **NON fare merge, non modificare il gioco, i branch degli agenti, i 9 NEXT, ORCHESTRATOR o REVIEW-QUEUE.**
- Se puoi scrivere GitHub, salva soltanto il rapporto in `oronzo/coordination/coerentizzatore/REPORT.md` sul tuo branch di audit e apri una PR di sola documentazione, senza merge; altrimenti consegna rapporto in chat.
- La decisione delle correzioni e degli eventuali merge appartiene alla chat orchestratore principale.

## Output richiesto
Rapporto conciso: SHA analizzati, massimo cinque P0/P1 con prove, matrice delle interfacce, priorità di intervento per agenti 5/6/8 e verdetto **ready for orchestrator QA** oppure **needs changes** (NON 'mergiato'). Fermati qui.
