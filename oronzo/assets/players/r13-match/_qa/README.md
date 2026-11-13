# R13 MATCH · Verifica trasporto binario GitHub

Questo è il **diagnostico del canale di caricamento** per l'automazione R13. Non è uno sprite di gioco, non è da usare come materiale artistico e non soddisfa nessun requisito dell'atlante.

## Prova binaria del 13 novembre 2026
- File: `_qa/transfer-smoke.png`
- Immagine: 8×8, PNG RGBA (98 byte), tre campi pieni e un quadrante trasparente.
- SHA-256 del file originale: `6d4e5d6de58d74d598e41f7b55d26b4e85676b048fa424f0bf81ae5f20fa5243`
- Hash Git blob locale: `9f384241c5931c0e12e2d362167e1b5570b039dd`
- SHA restituito dal connettore `mcp__GitHub__create_blob` con `encoding:"base64"`: `9f384241c5931c0e12e2d362167e1b5570b039dd` (**match esatto**).

## Procedura raccomandata per caricare PNG reali
1. Apri l'archivio locale della run e ricava **i byte del vero file**; non usare descrizioni e non sostituirlo con nuove immagini fittizie.
2. Calcola SHA-256 e Git blob SHA (`SHA1("blob "+byteLength+"\\0"+bytes)`); codifica in Base64.
3. Con il connettore GitHub chiama `create_blob({repository_full_name:"CzekUns/cercax", content:<base64>, encoding:"base64"})`. **Non usare UTF-8** per PNG.
4. Verifica che il blob SHA restituito coincida con quello del file locale.
5. Crea/aggiorna l'albero con `create_tree({repository_full_name,base_tree_sha:<currentTreeSHA>,tree_elements:[{path:"oronzo/assets/players/r13-match/...png",mode:"100644",type:"blob",sha:<blobSHA>}]})`, poi `create_commit({parent_sha:<currentHead>,tree_sha:<newTree>,message:...})`, infine `update_ref({branch_name:"automation/oronzo-r13-match-atlas",sha:<newCommit>,expected_sha:<currentHead>})`. Non usare force-push.
6. Ripeti per i file effettivamente recuperabili. Aggiungi il checkpoint al worklog sullo **stesso branch**; non azzerarlo.
7. Se il connettore `fetch_blob` non sa decodificare PNG, può restituire `UnicodeDecodeError`: questo è un limite della lettura come testo, non indica corruzione. Usa il Git blob SHA per il confronto byte esatti, e scarica il PNG raw solo attraverso un client che supporti il binario.
8. Apri/mantieni un'unica **PR draft** per questo incarico. Mai fare merge della sola fixture diagnostica come se fossero sprite definitivi.

**Limite attuale:** i vecchi archivi `r13-match-prototype.zip`, `r13-match-checkpoint-v2.zip` e `r13-match-run11-local.zip` sono stati creati in esecuzioni precedenti. Questa sessione non dispone dei loro byte originali. Quando la run originale li vede nel suo ambiente, deve trasferire i PNG reali con questa procedura; non può dichiararli già pubblicati.
