# ORONZO — Visione di gioco v0.2

_Specifica di prodotto e criteri di accettazione · 7 novembre 2026 · Agente 10_

## Direttiva utente aggiuntiva — primo rilascio M1: 100 comuni / 500 cognomi (7 novembre 2026)
**Requisito vincolante per il primo rilascio giocabile:** bastano **100 comuni italiani verificati** e **500 cognomi italiani distinti e verificati**. I precedenti obiettivi **500 comuni / 5.000 cognomi** restano desiderati per l'espansione successiva e **non bloccano il primo rilascio**. Non presentare il catalogo iniziale come «100 meno popolati» o «500 cognomi più rari» senza una classifica con fonti verificabili. Preferire piccoli comuni e cognomi poco comuni dove la fonte lo consente; i dati certi sono obbligatori, i ranking non dimostrati non si inventano.

**Raccolta incaricata all'automazione oraria ORONZO già attiva:** lavorazione incrementale su branch dedicato `data/oronzo-world-research` e directory `oronzo/data/research/`, PR unica non mergiata automaticamente, con `municipalities.json`, `surnames.json`, `sources.json` e `STATUS.md` (o struttura equivalente già presente). Ogni record ha fonte/licenza/ID e geografia/anno verificabili, deduplica e tracciabilità; non include dati personali. Gli agenti **07** (comuni/mondo) e **08** (cognomi) validano e importano i dati **dopo review** della PR di ricerca, senza ricercarli nei rispettivi branch o creare archivi concorrenti. Una fonte attuale non certifica automaticamente geografia/popoli del 1979. I dati non sono da considerare presenti fino a conteggio, review, commit e import reali.

**Conseguenza sui gate:** gli agenti 07/08 possono completare il flusso con il catalogo M1 verificato; ulteriori 400 comuni e 4.500 cognomi sono fase di crescita e non devono ritardare l'end-to-end. Il requisito storico della sezione 03 descrive l'orizzonte finale.

## Premessa e ordine di precedenza

Specifiche fornite direttamente dall'utente il 7 novembre 2026. Questa visione v0.2 prevale sulle scelte incompatibili contenute nel concept v0.1: anno di avvio 1979 anziché 1985/86; avatar dotati di statistiche operative anziché puramente estetici; velocità di partita 1× pari a circa 15 minuti reali anziché 90 secondi; percorso narrativo e relazionale della carriera. Restano valide le istruzioni tecniche non confliggenti: smartphone esclusivamente landscape 16:9, estetica pixel art calcistica 1990–1995, controllo della gara da parte dell'allenatore e separazione tra simulazione e visualizzazione.

Questo documento distingue REQUISITI UTENTE (comportamenti richiesti) e PROPOSTE DI IMPLEMENTAZIONE (formule iniziali, test e parametri affinabili). Le formule quantitative non esplicitamente scelte dall'utente non devono essere presentate come approvate.

## 01. Flusso di gioco e creazione partita

REQUISITI UTENTE — All'apertura: NUOVA PARTITA oppure CARICA PARTITA. Nuova partita: scelta dell'avatar allenatore, visualizzazione dei suoi tratti e della città natale; generazione di 20 ingaggi casuali; accettazione di un ingaggio con costo/bonus morale; breve scena di presentazione con presidente grottesco random; accesso alla rosa; conferenza stampa di avvio con cinque domande casuali; ingresso nell'hub della stagione con data corrente e prossimo turno.

Ogni nuova carriera è un mondo persistente e deterministico per seed; le scelte iniziali non possono rigenerarsi arbitrariamente dopo salvataggio e ricarica. L'anno iniziale è 1979: data precisa del calendario da fissare dopo verifica delle stagioni e della documentazione storica.

## 02. Avatar allenatore e morale

REQUISITI UTENTE — Ogni avatar possiede città natale, regione/macroregione, quattro attributi caratteriali principali: fortuna, leadership, autostima, pazienza. Tali statistiche incidono realmente su partita, rapporti, reazioni e ingaggi. Il MORALE dell'allenatore è una risorsa consumabile, paragonabile a una currency. Quando arriva a zero: GAME OVER e nuova carriera (eventuale recupero solo tramite salvataggio precedente secondo regole da decidere).

PROPOSTA — Scala 0–100 per gli attributi e il morale, con valori iniziali bilanciati e cap esplicito. In partita leadership modula l'adesione agli ordini, fortuna produce variazioni marginali e verificabili senza predeterminare esiti, autostima influisce sulle richieste e sui costi di ingaggio, pazienza riduce la probabilità di reazioni avverse in tensione. L'effetto deve essere misurabile con test su seed identici.

## 03. Il mondo: 500 comuni e 5000 cognomi

REQUISITI UTENTE — Costruire un archivio di circa 500 comuni italiani scelti fra i meno popolati. Ogni comune-club deve avere nome del comune, regione, macroregione Nord/Centro/Sud. Le squadre sono un universo calcistico provinciale originale; ogni partita può estrarne un sottoinsieme coerente con gironi e campionati. Costruire inoltre un archivio di circa 5000 cognomi italiani ordinati dai meno diffusi in su, per generare calciatori con cognomi credibili e stabili.

REQUISITO DI RICERCA — I comuni e i relativi livelli di popolazione vanno ricavati da fonti pubbliche verificabili (anno, fonte, licenza, eventuali fusioni comunali); la banca di cognomi necessita ugualmente di fonte e termini di riuso verificati. Non inventare dati demografici né presentare come statisticamente certificati cognomi non documentati. Usare nomi di comuni non concede automaticamente il diritto di utilizzare emblemi, nomi ufficiali di società sportive, loghi, tifoserie organizzate o marchi di terzi.

PROPOSTA DI COERENZA STORICA — Nel 1979 il campionato denominato Eccellenza non era ancora istituito: usare la Promozione o una denominazione storicamente compatibile per la prima categoria giocabile, salvo esplicita scelta di storia alternativa. Macroregioni di gioco: Nord, Centro, Sud; specificare esplicitamente a quale gruppo appartengono Sicilia e Sardegna, e mantenere la mappatura costante nel save.

## 04. Mercato degli ingaggi iniziali

REQUISITI UTENTE — La schermata presenta 20 proposte casuali di società; ingaggio, prestigio/valore economico e distanza geografica influiscono sul morale dell'allenatore. Cambiare REGIONE costa 1 punto di morale; cambiare MACROREGIONE costa 3 punti. Un ingaggio molto remunerativo nella regione natale può far aumentare il morale. Autostima alta e compenso basso, specie per un trasloco di regione/macroregione, possono amplificare il costo fino al doppio.

PROPOSTA DI FORMULA INIZIALE — costoBase = 0 se stessa regione; 1 se altra regione nella stessa macroregione; 3 se altra macroregione (costi ALTERNATIVI, non cumulati, in attesa di conferma). moltiplicatoreAutostimaCompenso ∈ [1,2], cresce con autostima e scarto fra cachet ricevuto e cachet atteso. costoMorale = arrotonda(costoBase × moltiplicatore). Bonus per offerta locale economicamente alta; evitare saldi in crescita illimitata. La UI anticipa esattamente il cambiamento e l'eventuale game over prima della conferma.

## 05. Presidenti grotteschi e società

REQUISITI UTENTE — Dopo l'ingaggio, presentazione breve e comica con un presidente generato casualmente. Ogni presidente modifica aspetti del mister: può potenziare un tratto e indebolirne un altro. Deve essere persistente e avere veri comportamenti decisionali: disponibilità alla spesa, attaccamento sportivo alla società, ricerca del profitto. Il parametro esplicitamente richiesto per quest'ultima disposizione è PAPPONERIA.

Il rapporto mister-presidente dipende da compatibilità dei caratteri, ricavi economici effettivi della società, risultati, richieste concesse o respinte e scelte del presidente. Un presidente a papponeria elevata tende a prezzi dei biglietti più alti e mercato più restrittivo, modulati anche dai risultati. Il rapporto e le decisioni vanno persistiti e non ricalcolati casualmente dopo reload.

PROPOSTA — Una sola identità presidentId canonica per club/salvataggio; catalogo narrativo dei presidenti e sistema economico condividono lo stesso ID. Definire compatibilità su tratti, obiettivi, eventuali bonus/malus reversibili e ledger dei ricavi. Separare guadagni della società dal cachet personale del mister; evitare doppie contabilizzazioni e valori monetari negativi.

## 06. Rosa, giocatori, caratteristiche individuali

REQUISITI UTENTE — La rosa è consultabile giocatore per giocatore. Ai valori classici fisici/tecnici si aggiungono fortuna, pazzia, spericolatezza e gli altri tratti caratteriali concordati (es.: autocontrollo, disciplina, coraggio, suscettibilità, ambizione). Il rendimento dipende dalle caratteristiche e dalle interazioni, incluse condizione e allenamento, e non da etichette puramente narrative.

Ogni calciatore riceve un cognome dal dataset, identità persistente, un'origine geografica con regione/macroregione, fiducia nel mister, morale individuale, condizione fisica e stato del contratto. Gli allenamenti incidono in modo misurabile e possono comportare affaticamento/infortuni. La fiducia del gruppo cresce soprattutto vincendo, ma le relazioni con i singoli evolvono anche per minutaggio, esclusioni, direttive e tono dei richiami.

## 07. Conferenze stampa e giornalisti

REQUISITI UTENTE — Prima del campionato: conferenza con CINQUE domande casuali e risposte selezionabili che determinano il morale iniziale della tifoseria. Giornalisti generati con nomi casuali, emittenti televisive private inventate, comiche e provinciali. Dopo OGNI partita: breve conferenza con conseguenze sul rapporto con i media, i tifosi, la società e l'allenatore.

PROPOSTA — Question bank originale con contesto di risultati, avversario, posizione, mercato e rapporti. Domande e risposte debbono avere effetti espliciti e testabili e mostrare conseguenze sintetiche al giocatore. Evitare nomi reali di emittenti/marchi e battute cinematografiche protette.

## 08. Hub principale e navigazione

REQUISITI UTENTE — Hub con data concreta a partire dal 1979, stato morale e relazioni. Menu CAMPIONATO > PROSSIMA GIORNATA (prepartita, gara), CLASSIFICA; menu ROSA > SQUADRA (schede calciatori), ALLENAMENTO; menu TIFOSERIA > STADIO (condizioni, biglietti/prezzo), COSA DICONO I TIFOSI, COSA DICONO I GIORNALI; menu UFFICIO DEL PRESIDENTE > rapporti, richieste, mercato e decisioni societarie. Il calendario avanza per giornate e mostra tempo/data coerenti.

PROPOSTA — Dashboard compatta del morale allenatore, fiducia presidente, fiducia spogliatoio, umore tifosi e reputazione stampa, ognuna con spiegazione delle variazioni recenti. Ogni menu deve usare dati persistiti e funzioni eseguibili, niente sezioni fittizie cliccabili prive di contenuto. Landscape 16:9 da telefono, con pulsanti touch leggibili.

## 09. Prepartita e partita diretta in tempo reale

REQUISITI UTENTE — Prima del calcio d'inizio: formazione, panchina, sostituzioni eventuali, tattiche e visione della formazione avversaria. Partita 11v11 già esistente da evolvere con DUE VISTE: (a) FULL CAMPO, attuale campo intero dei test; (b) TELEVISIVA, camera più vicina che segue il pallone con scrolling fluido. Il giocatore non muove direttamente i calciatori: invia ordini alla squadra e singoli.

Durante la partita: modulo e cambi tattici modificano realmente le posizioni/decisioni degli sprite; sostituzioni, pressing, mentalità, indicazioni ai singoli e incoraggiamenti/rimproveri modificano morale e prestazione con limiti e trade-off. La velocità 1× attuale è 90 minuti simulati in circa 15 minuti reali; 2×/4×/8× e pausa restano facoltative. La camera televisiva non modifica fisica, tattica o esito della gara: usa lo stesso snapshot del campo completo.

REQUISITI UTENTE — Possibilità di motivare o demotivare un singolo giocatore con tono gentile oppure duro; imprecazioni e invettive originali dell'avatar nel proprio dialetto regionale. Efficacia mediamente maggiore con calciatore della STESSA REGIONE, secondariamente stessa macroregione; dipende anche da temperamento, rapporto e situazione. Lessico dialettale da verificare con fonti affidabili e revisione madrelingua; prevedere intensità linguistica configurabile.

## 10. Tifoseria, stadio, quotidiani e società

REQUISITI UTENTE — L'umore dei tifosi risponde a vittorie/sconfitte, condizioni dello stadio e delle divise, mercato fatto o negato, prezzo dei biglietti, atteggiamento della dirigenza e dichiarazioni dell'allenatore. Il prezzo si consulta in STADIO ed è influenzato dalla papponeria del presidente e dall'andamento sportivo. Il pubblico genera ricavi del club e pressioni sul presidente e sul mister.

Il presidente, i giocatori, i tifosi e i giornalisti possono ciascuno contribuire a diminuire il morale allenatore quando il rapporto diventa conflittuale. Gli effetti hanno cause registrate nel diario della carriera e non si applicano duplicati al ricaricamento.

## 11. Economia, mercato e calendario

REQUISITI UTENTE — Mercato disponibile solo nei periodi consentiti dalle regole temporali impostate. L'allenatore presenta bisogni e proposte all'ufficio del presidente; la società decide se spendere. Preferenze e papponeria del presidente determinano offerte, condizioni, rifiuti e conseguenze relazionali. Stipendi e bilancio esistono realmente e sopravvivono al cambio di stagione.

PROPOSTA — Per il 1979 usare un calendario e finestre di mercato verificati storicamente, oppure dichiarare esplicitamente una regola fittizia del gioco. Gestire l'avanzamento con una data assoluta e una chiave di periodo univoca; pagamento stipendi, entrate stadio, costi e revisioni del board una sola volta per periodo. Eventi di mercato non disponibili fuori finestra con motivazione UI.

## 12. Vincoli di game design e persistenza

REQUISITI UTENTE — GAME OVER immediato al morale allenatore pari a zero. Altri indicatori non sostituiscono il morale: presidente, spogliatoio, tifosi e media agiscono da relazioni diverse che ne modificano il saldo. Gli esoneri e gli ingaggi devono rispettare tali indicatori; non devono azzerare la storia o cambiare il presidente dopo load.

PROPOSTA — Persistenza versionata comprensiva di seed e stato RNG, identità avatar/natale, elenco dei 20 ingaggi presentati, identità di tutti i club e presidenti, rosa, singoli rapporti, morale coach, fiducia collettiva, stato media/tifosi, stadio, prezzo biglietti, casse, contratti, obiettivi, calendario e data assoluta, stagione, risultati, tabellone, ordini dati ed effetti già applicati. Migrazioni e test per partite salvate precedenti; nessun doppio evento economico quando si ricarica.

## 13. MVP verticale che deve funzionare prima dell'espansione

Percorso completo, dimostrabile sul browser Android landscape: Nuova partita → avatar con quattro statistiche reali → venti ingaggi casuali e calcolo morale → presidente persistente e bonus/malus → rosa con tratti → cinque domande stampa → hub/data/classifica → prima giornata e formazione avversaria → partita 11v11 con camera full campo/televisiva e comandi che producono effetti visibili → conferenza postpartita → variazioni di relazioni/morale → salvataggio → caricamento → avanzamento giornata. Se il morale raggiunge zero, game over.

Si parte con numero di comuni/giocatori ridotto ma proveniente dal modello completo, senza codificare un prototipo incompatibile con il dataset finale di 500 comuni e 5000 cognomi. Indicatori verificabili: le scelte modificano lo stato, la simulazione è deterministica a parità di seed, campionato e classifiche sono persistenti, salvataggi attraversano due stagioni, UI touch su più risoluzioni.

## 14. Criteri di qualità e proprietà intellettuale

Il tono è satira calcistica provinciale italiana anni Ottanta. Presidenti, giornalisti, radio/TV, dialoghi e personaggi sono originali e dichiarati fittizi; niente copie di volti, nomi, sigle, tormentoni o musiche riconoscibili dei film o marchi di videogiochi. I nomi geografici e cognomi vanno utilizzati nel rispetto dei dati e delle licenze di origine. Titolo ORONZO è nome di lavorazione: la commercializzazione richiede verifica legale del nome e dei contenuti.

Non basta visualizzare pallini tattici: gli sprite devono raggiungere davvero le nuove posizioni. Non dichiarare integrate funzionalità che esistono solo come API scollegate o illustrazioni statiche. Nessuna PR entra in main senza verifica tecnica e visiva adatta alla sua natura.

## 15. Deleghe di sviluppo e responsabilità

Agente 01: qualità sprite e divise su campo reale; Agente 02: cutscene, QA artistico e integrazione solo dopo review; Agente 03: ritratti avatar e kit UI dinamici per le schermate; Agente 04: nomi/giornalisti/emittenti, conferenze, battute dialettali originali e varianti comiche; Agente 05: doppia camera televisiva/full campo, fedeltà sprite-snapshot; Agente 06: ordini individuali, motivazione durante match, logica tattica; Agente 07: 500 comuni, gerarchia/campionato storico, calendario, offerte iniziali e save; Agente 08: 5000 cognomi e attributi caratteriali, morale/fiducia giocatori e allenamento; Agente 09: caratteristiche avatar, gestione morale della carriera e relazioni con presidente/tifosi/media, papponeria e mercato. Agente 10 (orchestratore): contratti trasversali, hub e integrazione runtime, revisione e merge, test end-to-end.

Questo elenco è una destinazione di responsabilità. Gli agenti seguono in ogni caso NEXT.md e i gate già aperti: in particolare gli agenti 07 e 09 devono prima chiudere i fix cross-module R02, e l'agente 02 è ancora in review. Il solo aggiornamento dei documenti non avvia materialmente altre chat.

## 16. Decisioni di dettaglio ancora da testare o confermare

Sono ancora PROPOSTE, non requisiti finali: valore iniziale morale e cap massimo; costi regionali esclusivi o cumulativi; formula economica del cachet; numero di squadre per girone e scelta dei 500 comuni per ogni stagione; data precisa di inizio nell'anno 1979; trattamento delle isole nella macroregione a tre categorie; regole di mercato storiche o semplificate; intensità e opzioni linguistiche delle imprecazioni; curva di crescita tifosi e presidente; possibilità di salvare prima di un game over. L'implementazione deve rendere questi parametri configurabili, non hardcodarli come verità di design.
