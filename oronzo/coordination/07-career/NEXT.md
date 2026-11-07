# NEXT — ORONZO AGENTE 7 · CORREZIONI DA AUDIT R02

**Stato:** `READY`
**Incarico:** secondo ciclo, correzioni e test di compatibilità documentate dal Coerentizzatore.
**Origine:** [Rapporto Work R02](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/coerentizzatore/REPORT-R02.md), mergeto su main commit `7212806be066c971a5479df162a2e60816fb1fcd`.
**Precedente PR:** #14, merge `bb9e3847`.
**Scope modificabile:** `oronzo/systems/career/` e il tuo `REPORT.md`.

## Azioni autorizzate
Riparti dall'ultimo `main` in un nuovo branch di ciclo `agent/oronzo-career-r02`. Implementa e testa:
1. **R02-1: migra e assegna ad ogni club un `presidentId` canonico fra quelli del catalogo copy, con assegnazione deterministica per seed e stabile attraverso save/load e cambio stagione. Per >8 club documenta riuso di profili/istanze; non riassegnare a ogni avvio.**
2. **R02-2: mantieni obiettivo canonico persistito e aggiungi mapping esplicito compatibile con il board; le soglie della carriera non devono essere alterate dal fallback.**
3. **R02-3: assegna contratti ITL con `weeklyWage` non nullo e realistico per divisione/giocatore, verifica wageBudget e persistenza/migrazione delle rose esistenti.**
4. **R02-4: porta un `absoluteWeek` persistente attraverso le stagioni, sufficiente a distinguere i retry e garantire deduplicazione settimane tra stagione 1 e 2.**
5. **R02-5: preserva `employmentHistory`, `hiredSeason` e stato contrattuale del mister; evita round-trip perdenti tramite createCoach e schema coerente con agente 9.**

## Coordinamento
L'altro agente (07/09) lavora su API/contratto complementari. Non modificare il suo codice. Se serve un adapter condiviso, documenta precisamente input/output e proprietà dello stato in `integration-notes.md`; il runner centrale sarà costruito dall'orchestratore. Il catalogo `oronzo/content/presidents.json` è autorevole e già su main; non duplicare i presidenti.

## Verifica/accettazione
- Test nativi Node; includere almeno un test incrociato con **due stagioni** e salvataggio/ricarica.
- Presidenti stabili con ID esistente; board e testi dello stesso presidente; obiettivi equivalenti; payroll > 0 per club con contratti, niente spese negative; settimane del secondo anno accettate una volta sola; esonero senza TypeError dopo save/load.
- Conserva le API precedenti dove possibile, segnala breaking changes.
- Scrivi `oronzo/coordination/07-career/REPORT.md` sul branch, apri PR a main, **non fare merge**.


---

## DIRETTIVA DI PRODOTTO v0.2 — DA ESEGUIRE SOLO DOPO MERGE DEL FIX R02
Fonte [visione 1979](../GAME-VISION-v02.md) e [epic #25](https://github.com/CzekUns/cercax/issues/25). **La priorità immediata rimane integralmente R02-1..R02-5 descritta sopra:** non allargare la PR `agent/oronzo-career-r02` con sistemi geografici o offerte prima che i 5 fix siano verificati e mergiati. La vecchia data 1985/86 è superata come visione di gioco; non cambiare storicità nel branch di bugfix.

**Futuro ciclo R03, da autorizzare con nuovo NEXT dopo merge R02:**
1. Parametrizza data reale d'inizio carriera nel **1979**, giornata e calendari, specificando la categoria storica della Promozione. Non chiamarla Eccellenza nel 1979 salvo scelta esplicitamente alternativa.
2. Crea import del mondo da **500 comuni italiani poco popolati** con metadati verificabili (ISTAT/anno, fonte/licenza, regione, macroregione Nord/Centro/Sud, trattamento isole) e assegnazione deterministica alle squadre.
3. Genera **20 offerte di ingaggio iniziali** riproducibili per seed, cachet e società, persistendo lista e scelta; fornisci input geografico/economico al sistema morale agente 09, senza calcolare dentro career costi morali.
4. Calendario, classifica, transizioni, rosa e presidente persistenti; salvare stato RNG e data assoluta, test due stagioni e load senza rigenerazione delle offerte.

**Proprietà confine:** agente 07 possiede club/dati geografici, offerte e save; agente 09 possiede impatto sul morale e compatibilità caratteri; agente 10 collegherà i due sistemi alle schermate. Nessun lavoro su R03 finché non autorizzato.

### Fonti candidate per il futuro R03 (non implementazione e non prova di licenza)
- [ISTAT — codici e denominazioni dei comuni/regioni](https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/).
- [ISTAT — bilancio demografico per comune e CSV](https://demo.istat.it/app/?i=P02&l=it).
- [ISTAT — serie censuaria anche storica 1951–2011](https://www.istat.it/statistiche-per-temi/censimenti/popolazione-e-abitazioni/risultati/): verificare anno e confini di riferimento prima di classificare i «500 comuni meno popolati» per un gioco ambientato nel 1979.
