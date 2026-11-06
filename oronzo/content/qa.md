# QA · Agente 4 — ORONZO Copy

**Branch:** agent/oronzo-copy
**Perimetro:** esclusivamente oronzo/content/
**Campione ambiente:** Italia provinciale, 1985–86; UI orizzontale 16:9.

## Conteggi verificati su dati letti dal branch

| Materiale | Verificati | Minimo richiesto |
| --- | ---: | ---: |
| Personaggi ricorrenti | **16** | 12 |
| Eventi con scelte | **57** | 40 |
| Microtesti | **144** | 80 |
| Categorie microcopy | **14** | — |
| Dialoghi brevi | **26** | 20 |
| Varianti di dialogo | **52** | — |

Tutti e quattro i JSON sono stati ripresi da GitHub e analizzati con JSON.parse; controllo ID unici, speaker e relazioni valide, 2 scelte per evento, condizioni documentate, target ed effetti nei limiti del contratto. **Nessun errore rilevato**. Nessun duplicato esatto tra i 144 microtesti.

### Lunghezze massime rilevate (in caratteri)

| Canale | Massimo rilevato | Limite |
| --- | ---: | ---: |
| headline | 48 | 55 |
| subhead | 101 | 140 |
| notice | 83 | 110 |
| commentary | 73 | 110 |
| ticker | 56 | 65 |
| dialogue (eventi, varianti, dialoghi, personaggi) | sotto 180 | 180 |
| choice_label | sotto 38 | 38 |

### Smoke test del selettore, eseguito sui dati reali

La sorgente ESM e lo script della demo sono stati sottoposti a parsing; il selettore è stato eseguito in ambiente JavaScript su uno stato simulato a 16 calciatori. Verifiche positive:

- Le soglie di fortuna, carattere e classifica derivano correttamente dallo stato.
- I trigger sconosciuti vengono rifiutati, non ignorati.
- La selezione pesata chiama la funzione random una sola volta per estrazione.
- Un evento appena presentato non si ripete immediatamente nella stessa giornata.
- Gli effetti modificano una nuova copia dei calciatori, senza mutare l'originale.
- Una scelta non modifica punteggi, classifica o risultati.
- Gli effetti societari futuri vengono restituiti come deferred, senza applicarli.
- Microtesti e dialoghi vengono selezionati con i rispettivi contesti.
- Reset stagionale azzera le memorie di cooldown.

**Il file validate.mjs è stato consegnato per la ripetizione locale e la futura CI.** I controlli equivalenti sono stati eseguiti sul contenuto remoto con il runtime JS disponibile. Non si dichiara un test reale della demo su dispositivo né l'esecuzione del comando Node direttamente nel repository remoto.

## Revisione editoriale

- I personaggi hanno obiettivi che entrano in conflitto: Venturi chiede ambizione, Bassi chiede conti, Moro protegge il gruppo, Lenzi vuole segnare, Corsi cerca il titolo, Sarti tutela la salute.
- Si alternano eventi ordinari, tensioni credibili, satira amministrativa e imprevisti. Nessun evento scritto forza una rete, un'infortunio grave o una vittoria.
- La scaramanzia è comportamento del personaggio: non viene spacciata per terapia o manipolazione certa della fortuna.
- I testi evitano nomi, citazioni e situazioni distintive protette delle opere ispiratrici; niente imitazioni di volti o voci.
- Lessico analogico 1985: quotidiani locali, radiolina, gettoni, segreteria, timbri, pullman, municipio. Nessun dialetto fabbricato.
- Individuate e corrette in microcopy due occorrenze di «Tre punti» a «Due punti», coerenti col sistema storico del 1985.

## Rischi e handoff

1. **Integrazione non effettuata:** game.js resta immutato. Al momento manca il caricamento eventi in partita/gestione; tocca all'orchestratore.
2. **Rosa procedurale:** i tre calciatori ricorrenti con nome devono essere legati alle posizioni reali, senza inventare presenza nella formazione esistente.
3. **Effetti futuri:** finanza, dirigenti, amministrazione, tifoseria e stampa sono annotati, non persistiti dal motore.
4. **lastResult:** non compare nello stato persistito attuale; i trigger su vittoria/sconfitta richiedono il valore reale derivato dal match.
5. **Storicamente incoerente nel motore attuale:** 3 punti a vittoria anziché 2 e 5 sostituzioni invece delle 2 comunemente permesse nel 1985. Segnalazione documentata in README, senza toccare i file dell'orchestratore.
6. **Demo:** ESM e script verificati sintatticamente; resa grafica su smartphone e comportamento browser reale richiedono test manuale dopo l'integrazione.

Test locale ripetibile: node oronzo/content/validate.mjs

I contenuti non si basano su immagini o musica di terzi. L'umorismo è pensato per restare in secondo piano rispetto alla simulazione sportiva.
