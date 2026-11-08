# ORONZO — R08B · Rapporto conclusivo merge PR #43

**Esito: MERGED, verifica main PASS. Nessuna regressione rilevata nelle prove eseguite.**

Data: 8 novembre 2026, Europe/Rome. Mandato esplicito dell'utente: mergiare esclusivamente #43 dal preciso HEAD approvato, ripetere test e consegnare indicazioni Android.

## Merge verificato

- [PR #43](https://github.com/CzekUns/cercax/pull/43): prima del merge OPEN, mergeable=true, clean.
- HEAD live uguale all'approvato in REPORT-R08B: **`4d00fb5bb6f05465eec30e1b8d997865579d47d8`**.
- Main precedente: `82b5f5f629c3b2b5c41410053817512f4642e736`.
- Merge eseguito tramite expected_head_sha, metodo merge.
- **SHA di merge e main verificato:** [`241068d383a67c0be8513a2ef9b74b37eea58155`](https://github.com/CzekUns/cercax/commit/241068d383a67c0be8513a2ef9b74b37eea58155).
- Confrontati **134 file locali** con i blob del tree del main mergiato: **134 corrispondenze, zero differenze**. I test sono stati rieseguiti su questo albero verificato, non attribuiti al precedente run R08B.

Nessun altro merge, nessuna revisione di altre PR, nessuna modifica di codice o NEXT. Questo rapporto è proposto separatamente, senza auto-merge.

## Verifiche successive al merge

| Test realmente rieseguito | Risultato |
|---|---|
| node --check oronzo/assets/ui/career-r03.js | PASS |
| node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js | **97/97 PASS**, 0 fail, circa 51,5 s |
| node --test oronzo/systems/match-view/*.test.mjs | **22/22 PASS**, 0 fail |
| Chromium149 su HTTP locale reale, desktop/touch a 640×360, 800×360, 844×390 | **6/6 PASS** |
| Percorso completo 1979: avatar → 20 offerte → presidente → 5Q → 11 titolari/1GK → Engine06 fulltime → 2Q → avanzamento → save/reload | PASS nei sei percorsi |
| R08-1/2/3/4: 16 giocatori/schede, Allenamento consultabile, classifica completa, 44–45px effettivi, nuova carriera e vecchio save protetto | PASS nei sei percorsi |
| Geography_required senza catalogo | Rifiuto atomico, stato invariato |
| Riavvio del processo Chromium con profilo persistente | Stato identico, chiave legacy preservata |
| Ultima riga formazione selezionata/deselezionata con touch; home/partita rapida legacy | PASS prova supplementare |

Zero eccezioni JavaScript. Rimane il solo **404 facoltativo** per assets/cutscenes/manifest.json già noto e assente da main, gestito dal fallback. Non è una regressione del merge.

Nel percorso deterministico locale: score **2–0**, coerente con i due goal Engine06, due punti storici in classifica, morale finale **52**, cassa **9.063.000**, un unico pagamento salari **477.000** per `a:1`; nessuna duplicazione ad avanzamento/reload. Orologio 1× coerente col rapporto 6 secondi simulati per secondo reale.

## Pubblicazione e prova online

Il [run GitHub Pages 42461437540](https://github.com/CzekUns/cercax/actions/runs/42461437540) è **completed/success**, head_sha uguale al merge `241068d...`.

**URL pubblico aperto e provato realmente:**
https://czekuns.github.io/cercax/oronzo/assets/ui/career-r03.html

Nel browser remoto Chrome, su tale URL, verificati caricamento UI/immagini e percorso Nuova partita → otto avatar → venti offerte → ingaggio → presidente → cinque risposte → ufficio. Visibili i cinque menu, incluso Allenamento, e la classifica completa. Questa è una prova di hosting reale distinta dai sei percorsi completi eseguiti via HTTP locale. Il Chromium locale del test non raggiungeva il sito esterno (ERR_EMPTY_RESPONSE); il browser remoto ha aperto e interagito correttamente con lo stesso URL, senza bypass o modifiche al sito.

## Come provarlo su Android

1. Aprire il link pubblico nel browser del telefono e ruotare in orizzontale.
2. Premere **NUOVA PARTITA**, scegliere avatar/origine e lasciare attiva **Modalità TEST: luoghi sintetici**; quindi **20 OFFERTE** e accettare un ingaggio.
3. Proseguire con il presidente e le cinque risposte, poi **FORMAZIONE → CALCIO D'INIZIO**. La gara parte in pausa: premere **RIPRENDI**. A 1× dura circa 15 minuti; si può aumentare la velocità o usare **TERMINA GARA CON ENGINE06 (QA)** per verificare rapidamente il flusso completo.
4. Rispondere alle due domande postpartita e premere **AVANZA GIORNATA**. Usare **SALVA** fuori dalla gara; al successivo accesso, **CARICA PARTITA**, nello stesso browser/indirizzo.

È una **demo tecnica con località sintetiche**, non il dataset geografico definitivo. Senza modalità QA l'ingaggio è correttamente bloccato in assenza di catalogo. Allenamento è consultazione; TV e cutscene definitive restano fuori da questa consegna. Android fisico non testato dal revisore: il telefono dell'utente è il prossimo collaudo reale.

## Evidenze

[Log, harness e prova dei blob post-merge](https://chatgpt.com/library?file_id=libfile_2e89d9d373e8819180c72e956182d9f8&account_id=personal). SHA256 ZIP: `d52a928ef676cea84cec2c0e5e72ec951e6feeb760227b85ca4ac0b8c8d6b6c2`. I risultati dell'harness mantengono il campo HEAD originariamente approvato; il file merge43-main-proof.json ne documenta l'identità di tutti i file col nuovo main effettivamente testato.

**Incarico concluso.** Nessuna attività ulteriore avviata.
