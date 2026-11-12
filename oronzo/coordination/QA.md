# ORONZO · Gate delle AUTOMAZIONI ricorrenti

> **Solo per le consegne dei worker automatici.** Le chat manuali continuano a seguire il proprio protocollo e le istruzioni specifiche; non sono obbligate a usare `TASKS.json` o a far approvare i loro incarichi da questo registro.

## Stati automatici
- `READY`: task orario assegnato ma non ancora avviato.
- `WORKING`: tranche in corso sullo stesso branch/PR con checkpoint nel worklog.
- `WAIT_REVIEW`: pronta da verificare; non scegliere un'altra funzione.
- `FIX_REQUESTED`: correggere la PR esistente e ripetere i test.
- `BLOCKED`: dipendenza o errore tecnico riproducibile; non simulare progressi.
- `PARKED`: task sospeso, non riavviarlo.
- `MERGED`: HEAD integrato su `main`, verifica il deployment.
- `DEPLOYED`: Pages SUCCESS per il commit distribuito; link giocabile con cache busting.

## Gate per il worker ORONZO R13
1. Verificare task, branch, PR e worklog precedenti prima di modificare codice.
2. Asset originali **raster illustrati** con veri file PNG/WebP trasparenti; non primitive SVG/Canvas mascherate da raster.
3. Manifest, palette, alpha, pivots, frame, più kit/portiere; test del set completo e tavola visiva di esempio.
4. Se viene modificato il runtime o una schermata, Node e Chromium HTTP nelle viewport 640×360, 800×360, 844×390, 960×400, salvataggio/caricamento e asset load. La prova demo isolata va distinta da quella nella carriera reale.
5. Non toccare la PR manuale #79 o i suoi asset concorrenti; se i file richiesti sono contesi, segnala la dipendenza invece di dettare nuovi incarichi al suo autore.
6. Merge: solo della PR **propria dell'automazione** e soltanto nei limiti dell'autorizzazione vigente e con gate verdi. Mai merge automatico di PR di agenti manuali.
7. Rilascio: GitHub Pages `SUCCESS` sull'esatto `main` verificato. Non confondere PR aperta e gioco pubblico.
8. Fine run: worklog sul branch con ultimo ID fatto e primo rimasto, HEAD, test, screenshot e prossimo passaggio.

## Regola di qualità
Ogni run deve continuare il **medesimo** incarico senza creare nuovi microtask. Se il runtime non permette di produrre asset veri o di interagire con GitHub, dichiarare il blocco e conservare il checkpoint, senza costruire report fittizi.
