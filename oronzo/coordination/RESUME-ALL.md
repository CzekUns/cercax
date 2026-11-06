# PROMPT UNIVERSALE DI RIPARTENZA — DA INVIARE IN TUTTE LE 9 CHAT ORONZO

> Incolla esattamente il blocco seguente in ognuna delle nove chat originarie (stesso testo, senza cambiare il numero o il nome dell'agente). Usalo **dopo** la revisione Work breve e l'eventuale aggiornamento di NEXT da parte dell'orchestratore. Questo prompt non avvia altre chat automaticamente.

```text
RIPRENDI ORONZO. Sei lo stesso agente a cui ho assegnato questa chat all'inizio: ricava il TUO numero (1–9) e ruolo dal prompt originale di questa chat; non scegliere né cambiare agente.

Repository: CzekUns/cercax, branch di riferimento main.

Leggi nell'ordine: oronzo/coordination/PROTOCOL.md, oronzo/coordination/registry.json, la TUA cartella oronzo/coordination/NN-*/ con IDENTITY.md, RUN.md e NEXT.md su main, la tua issue, la tua PR aperta se esiste, gli eventuali commenti di revisione, il report precedente se esiste, AGENTS.md e i contratti pertinenti.

Verifica cosa è già stato fatto, cosa è in main e cosa è solo nella PR. Non rifare lavoro completato e non cancellare cambi di altri agenti. Obbedisci a NEXT.md e allo stato live della PR: se WAIT_REVIEW, aggiorna REPORT.md e risolvi solo fix richiesti sulla stessa PR; se FIX_REQUESTED, esegui le correzioni; se READY, parti dall'ultimo main in un nuovo branch di ciclo e sviluppa il blocco successivo; se WORKING, termina il primo incarico; se BLOCKED, rendiconta il blocco.

Produci lavoro concreto, verificato e integrabile solo nel tuo scope. Scrivi oronzo/coordination/NN-*/REPORT.md nel TUO branch con file, test realmente svolti, bug, dipendenze e proposta prossimi passi. Aggiorna o apri PR verso main soltanto se appropriato, senza fare merge e senza avviare Work. Concludi riportando PR, risultato verificato, problemi residui e cosa aspetti dall'orchestratore. Se la tua identità non è recuperabile dalla chat, chiedimela prima di fare modifiche.
```

## Note per l'orchestratore
- Le PR #5, #6, #12, #13, #14, #15, #16, #17, #18 risultavano tutte aperte prima della revisione Work e vengono trattate come in revisione, salvo indicazioni più recenti su GitHub.
- La revisione Work breve attiva è in `oronzo/coordination/coerentizzatore/REQUEST.md` e riguarda solo i contratti dell'engine (#18), del movimento (#15) e degli attributi (#16).
- Dopo il rapporto Work, la chat principale aggiorna i `NEXT.md` pertinenti e decide se richiedere fix/merge; soltanto poi si invia il testo sopra alle nove chat.
