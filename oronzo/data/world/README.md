# ORONZO · Catalogo M1 comuni reali (snapshot di ricerca)

**Stato:** implementazione diretta in PR, **non ancora mergiata né certificata indipendentemente**.

- Snapshot origine: `CzekUns/cercax` branch `data/oronzo-world-research`, commit `0cc7eead7c5e971cff0e2d08e4bb2febc1df884b`, file `oronzo/data/research/municipalities.json` blob `7bcf0d6e24932817b880e164d7c3d5869d6e1d85`.
- Input: 500 record, 500 codici ISTAT di sei cifre distinti, 19 regioni rappresentate, 19 sourceId. Sono identità comunali contemporanee riportate da RP92/comuni-italiani, con dati derivati da ISTAT; non rappresentano tutti i comuni italiani.
- **Attribuzione dati comuni: ISTAT; RP92/comuni-italiani. Licenza dei dati dichiarata: CC BY 4.0**, secondo `oronzo/data/research/sources.json`. Citare la fonte anche in eventuale redistribuzione; la schermata della carriera fornisce attribuzione abbreviata.
- I 500 record di input non indicano `provinceCode` né l'anno puntuale di riferimento della popolazione. Nel catalogo app `provinceCode:null`, `populationReferenceYear:null` e `historical1979:false` sono intenzionali. `sourceSnapshotYear:2026` è lo **snapshot**, mai l'anno di popolazione.
- La validazione `world.js` mantiene le regole originali per cataloghi schemaV1 (provincia/anno necessari); soltanto lo schemaV2 con `historicalScope:'contemporary-geography-not-1979'` permette metadati null, mantenendo ID, macroregione, fonte, licenza, unicità e numeri di popolazione. `reviewStatus:'approved'` abilita l'import dal catalogo M1: **questa è un'approvazione applicativa del campione contemporaneo, non un'approvazione storica del 1979 e non un audit indipendente della PR**.
- I club generati `Sportiva [Comune] [n]` sono **fittizi**, non società storiche reali. La modalità QA con nomi inventati rimane esplicita e separata. Se il file reale manca, l'interfaccia informa l'utente; non fa fallback silenzioso.
- Import e `newGame` soltanto per **nuove carriere**; il mondo assegnato e la versione della fonte sono salvati con la partita. Non riscrivere carriere già salvate; non modificare i dati di ricerca `#40`.
- Il catalogo di cognomi `surnames.json` è **fuori scope** di questa modifica; non attribuire nuovi cognomi al motore prima di importazione/review separata.

## Test

Test aggiunti: `node --test oronzo/app/flow/tests/real-world-m1.test.mjs` e l'intera suite Node del gioco. È stata verificata programmaticamente la **sintassi JavaScript** dei file modificati e invocata la funzione originale `validatedMunicipalities` sull'esatto catalogo: 500 record accettati, 19 fonti, 500 province e anni marcati null. **Non è stato disponibile un checkout integrale Git+HTTP+Chromium né è stata eseguita la suite Node completa in questa sessione.** Sono necessari audit E2E e test in browser prima del merge.
