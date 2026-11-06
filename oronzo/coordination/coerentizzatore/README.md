# COERENTIZZATORE — Revisore Work su richiesta

Questo è il secondo punto di vista sul progetto ORONZO. Non è un agente 10 e non prende il comando dei 9 agenti. La chat principale rimane **orchestratore e unica autorità di merge/integrazione**.

**Uso parsimonioso di Work:** si attiva solo su richiesta dell'utente, per audit che richiedano davvero indagine trasversale o uso intensivo del computer/browser. Non effettua controlli programmati, monitoraggio continuo o salvataggi di sua iniziativa.

Documenti:
- `RUN.md`: un unico prompt permanente da incollare nella chat Work chiamata **Coerentizzatore**.
- `REQUEST.md`: incarico puntuale definito dalla chat orchestratore prima di ogni audit.
- `REPORT.md`: file da compilare **solo dopo un audit effettivo**, preferibilmente in una PR di solo report. Se assente, nessun report completato.
- `../ORCHESTRATOR.md`: memoria del progetto e ruoli; `../REVIEW-QUEUE.md`: coda delle PR.

**Permessi operativi:** sola lettura di codice/PR/issue/contratti; si possono proporre test e patch, ma nessuna modifica al gioco, merge, issue o `NEXT.md` senza una nuova autorizzazione esplicita. Può salvare report nella propria cartella di una branch di audit e aprire PR di documentazione, senza mergiarla.

Obiettivo: individuare incompatibilità tra sistemi, errori bloccanti e deviazioni dalle decisioni del progetto, con riferimenti esatti a file, commit e riproduzioni. Non basta una valutazione generica o un giudizio estetico non dimostrato.
