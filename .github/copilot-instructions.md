# GitHub Copilot Instructions

The following rules should be applied when generating code:

- Scrivi JavaScript usando doppi apici e tabulazione per l’indentazione.
- Per le dipendenze Java usa Bazel, non Maven.
- Segui lo standard PEP8 per Python.
- Per le chiamate HTTP preferisci fetch ad axios.
- Usa Jira per la gestione delle issue e dei task.
- Se mancano dettagli importanti nella richiesta, chiedi chiarimenti prima di generare codice.
- Evita di fare assunzioni: chiedi sempre il contesto necessario.
- Adotta nomenclatura esplicativa e semanticamente rilevante per variabili e funzioni.
- Rispetta le convenzioni stilistiche e le pratiche consigliate del linguaggio in uso.
- Incorpora esempi concreti di utilizzo o casi di test nei commenti quando appropriato.
- Privilegia soluzioni essenziali, robuste e di facile manutenzione nella struttura del codice.
- Per implementazioni complesse, fornisci documentazione dettagliata nei commenti esplicativi.
- Evita di generare codice contenente dati sensibili, credenziali o informazioni riservate.
- Perfeziona progressivamente le indicazioni in base ai risultati generati.
- Condividi con il gruppo di lavoro le direttive che si sono dimostrate particolarmente efficaci.
- Documenta errori significativi e relative soluzioni in commenti strutturati con prefisso "ERROR:" seguito da "SOLUTION:" e "CONTEXT:", per costruire una knowledge base accessibile e facilmente consultabile.
- Includi una breve panoramica del progetto all’inizio della documentazione.
- Usa sempre single quotes per le stringhe in JavaScript.
- Prefissa i parametri con "par", le variabili con "var", le risorse con "res" e i moduli con "mod".
- Ogni funzione pubblica deve avere un commento JSDoc o equivalente.
- Per ogni linguaggio o framework usato, segui le convenzioni specifiche definite nei file markdown di progetto.
- Aggiungi esempi di utilizzo nei commenti dove utile.
- Non includere mai dati sensibili o credenziali nei suggerimenti di codice.
- Documenta ogni nuova dipendenza aggiunta in README.md e usa solo pacchetti approvati.
- Segui il formato Conventional Commits per i messaggi di commit.
- Le pull request devono essere sempre revisionate da almeno un membro del team.
- Usa Jira per il tracking di issue e task e aggiorna lo stato delle attività in tempo reale.
- Gestisci errori esplicitamente nei blocchi try/catch o callback.
- Proteggi informazioni sensibili evitando esposizione nei log.
- Implementa gestione asincrona utilizzando costrutti async/await.
- Gestisci errori esplicitamente nei blocchi try/catch o callback.
- Proteggi informazioni sensibili evitando esposizione nei log.
- Implementa gestione asincrona utilizzando costrutti async/await.
- Documenta interfacce API con annotazioni chiare e complete.
- Evita l'uso di panic() in codice di produzione se non assolutamente necessario.
- Segui le convenzioni di naming delle variabili in camelCase o snake_case coerentemente.
- Organizza il codice in moduli con responsabilità ben definite.
- Mantieni ogni file sotto le 500 righe; se si supera questo limite, suddividi e modularizza il codice in più file con responsabilità chiare.
- Aggiorna STATUS.md per tracciare milestone, funzionalità completate, decisioni e priorità di progetto.
- Registra in ERRORS.md ogni errore significativo: includi descrizione, soluzione adottata e contesto in cui si è verificato.
- Mantieni README.md aggiornato con standard di progetto: convenzioni di stile, dimensioni font, regole UI/UX, policy di sicurezza, ecc.
- Aggiungi esempi pratici di convenzioni, come prefissi per variabili (es: parNome, varContatore), formati di commit, nomi di parametri, ecc.
- Per standard specifici (es: JavaScript, database, API), collega file markdown separati tramite le impostazioni Copilot (github.copilot.chat.codeGeneration.instructions).
- Aggiorna la sezione “Regole temporanee” in README.md o in un file dedicato (es: ./docs/sprint-24.md) per policy di sprint, librerie temporanee, ecc.
- Elimina periodicamente istruzioni obsolete da STATUS.md, ERRORS.md e altri file di memoria per mantenere il contesto rilevante.
- Quando chiedi a Copilot suggerimenti, evidenzia il codice rilevante o apri i file chiave per fornire più contesto.
- Sfrutta la chat inline e l’agente @workspace di Copilot per domande che richiedono consapevolezza dell’intero progetto.
- Consulta sempre STATUS.md per lo stato attuale e le priorità, ERRORS.md per problemi ricorrenti, README.md per standard e ./docs/ per dettagli specifici.

## Last Updated
These rules were last updated on 4/28/2025, 9:47:02 AM.
