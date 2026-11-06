# CONTRATTO NARRATIVO — AGENTE D / COPY & COMEDY

**Titolo interno:** Oronzo. **Ambientazione:** Italia calcistica di provincia, stagione 1985–86, smartphone landscape 16:9, estetica UI 1990–95.
**Obiettivo:** un gioco gestionale di calcio credibile con comicità sistemica, piccoli dettagli ricorrenti e caratteri che si incontrano e si scontrano. Il giocatore è l'allenatore (non gestisce il calciomercato direttamente).

## Direzione del tono
Ispirazione generale alle commedie italiane popolari degli anni Ottanta e all'umorismo amministrativo/surreale di Theme Hospital: annunci assurdi, cartelli, burocrati, dirigenti, miserie quotidiane, contraddizioni tra ambizione e mezzi, personaggi memorabili, umorismo contestuale. **Ispirazione di atmosfera, non citazioni né riproduzione di battute, dialoghi, personaggi, grafiche o scene.** Ogni nome, testo e personaggio deve essere nuovo.

La comicità è asciutta, osservativa, con tempi precisi. Evitare spiegare la barzelletta, battute ogni 2 secondi, dialetto inventato, doppi sensi ripetitivi, stereotipi contro gruppi protetti, anacronismi e umorismo genericamente “AI”. I tocchi divertenti devono poter essere ignorati senza interrompere tattica/partita. Valorizzare variazioni di carattere e situazioni emergenti.

## Canali di testo e limiti UI
Tutto è leggibile in LANDSCAPE. Fornire versioni corte quando serve.
- `notice`: avviso/annuncio, max 110 caratteri.
- `ticker`: scorrimento rapido, max 65 caratteri.
- `headline`: titolo di giornale, max 55 caratteri.
- `subhead`: sommario, max 140 caratteri.
- `commentary`: telecronaca/avviso panchina, max 110 caratteri.
- `dialogue`: battuta parlata, max 180 caratteri.
- `choice_label`: pulsante scelta, max 38 caratteri.
Fornire testo italiano naturale, punteggiatura semplice, nessuna frase predefinita che finga di essere originale del film.

## Modello dei dati (JSON)
File nella sola `oronzo/content/`, validi e staticamente importabili nel browser, senza dipendenze:
- `characters.json`: almeno 12 personaggi (presidente, vice, medico, preparatore, magazziniere, autista, capo-tifosi, giornalista, procuratore, amministrativo, ecc.); id stabile, ruolo, tono, difetto, obiettivo, relazioni, battute brevi, eventuali motivazioni.
- `events.json`: almeno 40 eventi con scelta, trigger, pesi/cooldown, effetti numerici e logici e testo breve; coprire allenamenti, malanni, superstizioni, fiducia, mercato *mediato dalla società*, arbitraggio, trasferte, cassa, avversari, pressione, stampa. Nessun evento obbligatorio che forzi risultato di un match o inventi una lesione grave senza modello di rischio.
- `microcopy.json`: almeno 80 frasi brevi distinte e contestuali per `notice`, `ticker`, `headline`, `commentary`, tooltip, loading, risultato, staff, stampa, pubblico, tabelloni. Fornire 4-8 alternative per ogni evento ripetibile se possibile.
- `dialogues.json`: almeno 20 dialoghi brevi (2–5 battute) con `speakerId` e situazione; umorismo di personaggio e conseguenze di gameplay.
- `README.md`: guida per motore e integrazione; `qa.md`: verifica humour/copyright/coerenza e duplicati; opzionale `demo.html` che mostri scene in landscape usando solo file della cartella.

Schema indicativo per evento:
```json
{
  "id": "ev_presidente_premio",
  "channel": "dialogue",
  "title": "Il premio partita",
  "body": "Il presidente ha promesso un premio. Non ha specificato se in denaro.",
  "triggers": { "weekMin": 2, "teamMoraleBelow": 65 },
  "weight": 8,
  "cooldownWeeks": 4,
  "choices": [
    {"id":"a","label":"Pretendi chiarezza","effects":{"morale":1,"presidentTrust":-2}},
    {"id":"b","label":"Rimanda la discussione","effects":{"morale":-1,"presidentTrust":1}}
  ],
  "tags": ["presidente","economia"]
}
```
Tutti gli `id` unici; nessuna chiave non documentata. Gli effetti numerici sono piccole variazioni, mai risultati garantiti. Valori per attributi 0–100, delta di default -3..+3; cambiamenti più grandi richiedono giustificazione. `presidentTrust` e finanze non sono ancora nel motore e vanno marcati come **estensioni future** oppure accompagnati da un effetto attualmente supportato. Riutilizzare gli attuali `morale`, `fatigue`, `confidence`, `health`, `luck` solo quando appropriato; il motore attuale espone gli attributi dei calciatori nell'oggetto state, ma **non** un sistema eventi strutturato.

### Esempi di microtono ORIGINALE, non battute da copiare come contenuto finale
- «Il presidente conferma piena fiducia nel mister. Fino al prossimo pareggio.»
- «Il magazziniere ha contato undici maglie. Due hanno lo stesso numero.»
- «Per la trasferta la società ha prenotato il pullman. Mancava l'autista.»
- «Il centravanti vuole più palloni. Il custode preferirebbe riavere quelli di martedì.»
- «La tribuna stampa non ha riscaldamento. I giudizi saranno più freddi.»

## Frequenza e correttezza della simulazione
- Non ogni evento è comico: conservare una quota consistente di eventi neutri e significativi.
- Contro il grinding: cooldown, pesi, once-per-season, condizioni di stato.
- Il motore decide esiti/goal/lesioni: il copy **racconta gli eventi veri** e i mutamenti di probabilità consentiti; non inventare retroattivamente risultati.
- Il giocatore deve comprendere sempre cosa decide: etichette chiare, conseguenze coerenti, senza trappole nascoste arbitrarie.
- La stessa sfortuna deve avere effetti possibili, non deterministici.

## Proprietà intellettuale e accuratezza storica
- Non citare o parafrasare da vicino battute del film L'allenatore nel pallone o Theme Hospital; niente Oronzo Canà, Longobarda, Bi-zona, Aristoteles o nomi/impostazioni riconoscibili come copia nel materiale pubblico.
- Niente voce o volto di attori reali, slogan e marchi famosi, se non autorizzati.
- Ricerca di costume e lessico dell'Italia metà anni Ottanta: telefono fisso, fax se plausibile, gettoni, radio, carta carbone, giornali, allenamenti, trasferte in pullman, società dilettantistiche; evitare cellulari/VAR/social/streaming/concetti successivi. Indicare con nota ciò che non è verificato.
- Evitare di attribuire frasi inventate a personaggi celebri e di inventare autentici dialettalismi.

## Perimetro & consegna
Branch: `agent/oronzo-copy`; modificare **solo** `oronzo/content/`, nessun file HTML/CSS/JS dell'orchestratore e nessun asset altrui. Annotare i punti d'integrazione in `oronzo/content/README.md`; lasciare gli hook per l'orchestratore. Verificare JSON parse, limiti di lunghezza, conteggi, coerenza trigger/effetti, ID univoci, duplicati, assenza di contenuto protetto o anacronistico. Consegna reale via PR + breve antologia di 8 esempi riusciti nel commento di PR.
