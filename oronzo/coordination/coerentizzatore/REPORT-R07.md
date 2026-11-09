# ORONZO — REPORT R07 · Gate UI PR #33

**Esito: NEEDS CHANGES — NO MERGE.** Due difetti riprodotti in Chromium reale. Nessun codice di gioco, NEXT o altra PR modificati. Responsabile delle correzioni: **Agente 03, nella stessa PR #33**.

- Data: 7 novembre 2026, UTC.
- Main letto e riconfermato: `730f7a22c3256f151bdc07d8bf6b368efb500c7e`.
- PR controllata: [#33](https://github.com/CzekUns/cercax/pull/33), HEAD `c38be80c392939d042dd998e6d1bf655c259804d`, ancora OPEN; REST: mergeable=true, mergeable_state=clean. Questo non equivale a QA superata.
- Scope: 31 file, esclusivamente `oronzo/assets/ui/` e `oronzo/coordination/03-ui/REPORT.md`.
- Merge eseguiti: **nessuno**. Verifica main dopo merge: non applicabile; il main riconfermato è invariato.

## Metodo e verifiche effettive

Letti RUN, REQUEST R07, PROTOCOL, GAME-VISION-v02, CONTRACT-v02, NEXT03, REPORT03, integrazione, manifest e sorgenti della demo; consultati anche i contratti e la memoria previsti dal RUN. Non riaperti R06B o altri audit.

File scaricati dal preciso HEAD della PR, senza modifiche. Verificati i blob Git dei 10 PNG e dei sorgenti HTML/CSS/JS. Esempi: JS `3bdb10678ff2810296385dc6937d851f48ddbcc8`, CSS `91ae682146b74f2c83d408c51572a0e840ef94cf`, HTML `4ce1b893f6ae56dd65ada5196a489d01300214f3`.

**Chromium 149.0.7827.0**, Playwright Node, esecuzione headless locale, deviceScaleFactor=1, locale it-IT. Binario ottenuto dal pacchetto npm `@sparticuz/chromium@149.0.0`; browser Playwright preinstallato assente. Demo servita da un **vero server HTTP statico 127.0.0.1**, su porta effimera: nessun set_content, data URI o route.fulfill. Richieste reali per HTML, CSS, JS e tutti i 10 PNG. Attesa esplicita di Image.decode prima delle catture definitive: nessun asset sostituito.

Eseguiti **sei percorsi browser**: desktop e mobile con hasTouch/isMobile, ciascuno a **640×360, 800×360 e 844×390**. Tap reali emulati, inclusi swipe tramite eventi touch CDP per la lista offerte. Prodotte 126 catture proprie; ispezione visiva personale delle viste e delle immagini alle tre risoluzioni, non solo consultazione degli screenshot dell'autore.

| Verifica | Risultato osservato |
|---|---|
| node --check demo-v02.js | PASS |
| python qa/check_assets.py | PASS: 10 PNG, dimensioni/formati, atlanti e manifest |
| Caricamento HTTP e decodifica PNG in Chromium | PASS in tutti i sei percorsi, zero errori console/JS/rete |
| 8 avatar, selezione e 4 statistiche DOM | PASS: otto profili distinti; setData con fixture 12/34/56/78 aggiorna testo e valori |
| 20 offerte e scroll touch, selezione ultima offerta | PASS; selezione/anteprima si aggiornano |
| Presidente e cambio fra quattro ritratti | PASS; ritratto reale, nome, spesa/attaccamento/papponeria |
| Cinque domande con tre risposte ciascuna, ingresso hub | PASS funzionale; FAIL sovrapposizioni descritte sotto |
| Quattro sezioni hub; pulsanti Squadra/Allenamento | PASS navigazione/feedback dichiarato; sono segnaposto, non vere viste rosa/allenamento |
| Prepartita, partita demo, full/TV | PASS navigazione e switch; stessi 22 marker e coordinate logiche |
| API createApp, setData, destroy e veto onIntent=false | PASS mirato: intento intercettato, navigazione mock impedita |
| Dimensione rettangoli DOM dei pulsanti | Almeno 44×44 nei controlli misurati; **non basta**: clipping e occlusione falliscono |
| Qualità grafica e testo | Atlanti/ufficio/campo reali; stile blu/oro e pixel art coerente. Testi piccoli leggibili nelle catture native salvo contenuti tagliati/coperti sotto |
| Gate complessivo | **FAIL: R07-1 e R07-2** |

La dicitura PASS dei sei percorsi riguarda le asserzioni funzionali, non approva il layout: i controlli geometrici e i tap senza auto-scroll hanno individuato i difetti seguenti.

## R07-1 · P1 · CARICA PARTITA tagliato e centro non toccabile a 360 px

**Verificato**, desktop e touch, sia 640×360 sia 800×360.

**File/funzione:** [demo-v02.js, renderEntry(), riga 63](https://github.com/CzekUns/cercax/blob/c38be80c392939d042dd998e6d1bf655c259804d/oronzo/assets/ui/demo-v02.js#L63); [demo-v02.css, riga 2](https://github.com/CzekUns/cercax/blob/c38be80c392939d042dd998e6d1bf655c259804d/oronzo/assets/ui/demo-v02.css#L2), selettori `.panel`, `.news`, `.v-stack`, `.hint-line`, overflow:hidden.

**Riproduzione:** aprire demo-v02.html via HTTP a 640×360, senza interazioni precedenti. Il pannello di sinistra taglia CARICA PARTITA: si legge appena una parte del testo. Toccare le coordinate centrali del bottone, senza locator.click/tap che può scorrere automaticamente gli antenati.

Misure Chromium:
- 640×360: bottone x=15, y=281.78125, larghezza=293.5, altezza nominale=44; bordo inferiore pannello y=306.
- Area interna visibile del bottone: circa **21.22 px**, invece dei 44 nominali.
- Centro (161.75,303.78125): elementFromPoint restituisce il pannello, non il bottone. touchscreen.tap al centro non apre il feedback di caricamento.
- 800×360: identico difetto, traslazione x di +80.
- 844×390: bottone interamente visibile e tap centrale funzionante; la nota sottostante resta tagliata.

**Atteso:** entrambe le azioni iniziali interamente leggibili e con 44 px effettivamente visibili/toccabili, senza scroll nascosto.

**Correzione proposta:** riorganizzare renderEntry con pannello a flex/grid e spazio riservato alle due azioni; ridurre/adattare il blocco decorativo o rendere esplicitamente scrollabile solo il contenuto narrativo. Non ridurre i pulsanti sotto 44 px. Verificare intersezione con tutti gli antenati che tagliano e hit-test al centro, prima di ogni scroll automatico Playwright.

Evidenze proprie: `touch-640x360-entry.png`, `touch-800x360-entry.png`; misure riprodotte separatamente dai test del percorso.

## R07-2 · P2 · Toast copre CTA e informazioni, intercetta tap

**Verificato alle tre risoluzioni.** Blocca il gate esplicito R07 “assenza di toast sovrapposti”.

**File/funzione:** [demo-v02.css, .toast, riga 2](https://github.com/CzekUns/cercax/blob/c38be80c392939d042dd998e6d1bf655c259804d/oronzo/assets/ui/demo-v02.css#L2): position:absolute, bottom:48px, z-index:10; [demo-v02.js, notify(), riga 62](https://github.com/CzekUns/cercax/blob/c38be80c392939d042dd998e6d1bf655c259804d/oronzo/assets/ui/demo-v02.js#L62), renderPress/renderHub e gestione answer.

**Riproduzione:** nuova partita → offerte → accetta → conferenza iniziale → cinque risposte rapide → hub. Toccare subito il centro della CTA dorata PROSSIMA GIORNATA. Per 2400 ms il toast di completamento la copre e intercetta il tocco: si resta nell'hub. Anche il menu inferiore del presidente e il valore UMORE TIFOSI durante la stampa risultano coperti in parte.

Misure a 640×360:
- Toast x=160,y=266,w=320,h=46.
- CTA x=340.53125,y=254,w=164.734375,h=44.
- Centro della CTA: elementFromPoint.id = `ui-toast`; tap fisico emulato → getScreen() resta `hub`.
- 800×360: stesso esito; 844×390: toast x=248.6484375,y=292,w=346.671875,h=50, stessa intercettazione.

**Atteso:** feedback leggibile senza coprire etichette, indicatori o azioni e senza ritardare la navigazione.

**Correzione proposta:** area status dedicata nel layout, con altezza riservata e testo adattivo; in alternativa posizione che non intersechi controlli. pointer-events:none evita l'intercettazione ma **da solo non risolve l'occlusione visiva**. Conservare il fix già presente in changeScreen che elimina toast precedenti: quel fix è passato, non è il difetto qui segnalato.

Evidenze proprie: `touch-640x360-hub-toast.png`, `touch-800x360-press-3.png`, `touch-844x390-hub-rosa.png`.

## Riproduzione automatica minima dei due difetti

Da checkout della PR al relativo HEAD, servire la cartella con `python -m http.server 8765 --directory oronzo/assets/ui`. In un ambiente Playwright con Chromium installato eseguire il seguente codice Node (il browser può richiedere executablePath nell'ambiente del revisore):

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const [width,height] of [[640,360],[800,360],[844,390]]) {
    const context = await browser.newContext({
      viewport:{width,height}, isMobile:true, hasTouch:true
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8765/demo-v02.html');
    const load = await page.locator('[data-action="sample-load"]').boundingBox();
    await page.touchscreen.tap(load.x+load.width/2,load.y+load.height/2);
    console.log(width,height,'load feedback',
      await page.locator('#ui-toast').isVisible());
    await page.locator('.quick-nav [data-value="avatar"]').tap();
    await page.locator('#ui-screen [data-value="offers"]').tap();
    await page.locator('[data-action="accept-offer"]').tap();
    await page.locator('[data-value="press"]').tap();
    for(let i=0;i<5;i++) await page.locator('.answer-grid button').first().tap();
    const next=await page.locator('#ui-screen .gold-btn[data-value="prematch"]').boundingBox();
    const center={x:next.x+next.width/2,y:next.y+next.height/2};
    console.log('center hit',await page.evaluate(
      ({x,y})=>document.elementFromPoint(x,y)?.id,center));
    await page.touchscreen.tap(center.x,center.y);
    console.log('screen',await page.evaluate(()=>oronzoUIDemo.getScreen()));
    await context.close();
  }
  await browser.close();
})();
```

Output osservato: load feedback **false,false,true**; center hit **ui-toast** e screen **hub** in tutti e tre i casi. Dopo correzione attesi feedback **true,true,true**, hit sul bottone/suo figlio e screen **prematch**, anche senza aspettare la scadenza del toast.

## Limiti e consegna al coordinatore

- Nessun test Android fisico o deploy GitHub Pages; HTTP locale verificato realmente. Queste prove non certificano un telefono fisico.
- Kit riutilizzabile tramite intent e dati, ma non adapter diretto getStateForUI: il prossimo runtime 03 dovrà mappare lo stato 07 e intercettare i comportamenti mock. Data, indicatori hub, morale, conferenze, caricamento e ordini non sono qui gameplay integrato.
- Rosa/Allenamento hanno pulsanti e feedback esplicito di funzione non collegata: **non certificati come schermate reali**. Richiedono il ciclo runtime già previsto, non una modifica del gioco da questo audit.
- I 22 marker, il punteggio fisso e lo zoom CSS sono dimostrativi. Nessuna nuova conclusione su simulazione, save/load o sui 97 test R06B: non rieseguiti in questo audit UI.
- Il primo tentativo del mio harness si è fermato per un selettore ambiguo; corretto il solo harness e completati i sei percorsi. Le catture definitive attendono la decodifica di tutti i PNG. Nessuna modifica alla PR produttiva.

**Prossime azioni (solo Agente 10 decide gli incarichi):**
1. Richiedere ad Agente 03 i due fix mirati R07-1/R07-2 nella stessa #33 e aggiornamento QA che misuri clipping effettivo e hit-test.
2. Ripetere il gate UI alle tre risoluzioni sul nuovo HEAD prima di qualsiasi merge.
3. Dopo gate positivo e merge, attivare il ciclo runtime già pianificato; nessun altro audit o sviluppo è stato avviato qui.
