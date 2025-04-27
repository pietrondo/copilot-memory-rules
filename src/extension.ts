// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Template di regole per linguaggi/framework (deve essere dichiarato PRIMA della classe CopilotRulesProvider)
const languageTemplates: Record<string, string[]> = {
  'JavaScript': [
    'Implementa variabili con const e let, evitando var.',
    'Mantieni nomenclatura camelCase per variabili e funzioni.',
    'Documenta funzioni pubbliche con commenti esplicativi.',
    'Preferisci async/await o Promises rispetto a callback nidificate.',
    'Rimuovi eventuali dichiarazioni console.log prima della distribuzione.'
  ],
  'Python': [
    'Aderisci alle convenzioni stilistiche dello standard PEP8.',
    'Incorpora docstring per tutti gli elementi di codice significativi.',
    'Specifica importazioni precise anziché generiche con asterisco.',
    'Implementa gestione esplicita delle eccezioni con blocchi try/except.',
    'Utilizza annotazioni di tipo quando possibile per migliorare la comprensione.'
  ],
  'TypeScript': [
    'Definisci tipizzazioni esplicite per parametri e valori restituiti.',
    'Limita l\'uso del tipo any ai casi di effettiva necessità.',
    'Struttura i dati attraverso interfacce ben definite.',
    'Utilizza const per dichiarazioni che non necessitano di riassegnazione.',
    'Aggiungi note esplicative per costrutti di tipo complessi.'
  ],
  'React': [
    'Denomina i componenti utilizzando PascalCase (es: ComponentName).',
    'Progetta componenti con responsabilità singola e ben definita.',
    'Isola la logica riutilizzabile implementando hook personalizzati.',
    'Applica CSS Modules mantenendo i file di stile vicini ai componenti correlati.',
    'Verifica il corretto rendering dei componenti attraverso test dedicati.',
    'Decomponi componenti complessi in unità più semplici e gestibili.',
    'Definisci tipi di props con PropTypes o integrazione TypeScript.',
    'Elimina sistematicamente codice non utilizzato dai componenti.'
  ],
  'Node.js': [
    'Implementa variabili con const/let, mai con var.',
    'Gestisci errori esplicitamente nei blocchi try/catch o callback.',
    'Proteggi informazioni sensibili evitando esposizione nei log.',
    'Organizza il codice in moduli con responsabilità ben definite.',
    'Implementa gestione asincrona utilizzando costrutti async/await.',
    'Convalida input utente prima di qualsiasi elaborazione.',
    'Documenta interfacce API con annotazioni chiare e complete.'
  ],
  'Django': [
    'Implementa lo standard PEP8 per nomenclatura e stilistica.',
    'Utilizza il sistema ORM nativo per interazioni con il database.',
    'Isola logica business in servizi separati dalle view.',
    'Applica decoratori di sicurezza per controllo accessi alle view.',
    'Implementa form Django per validazione e sanitizzazione input.',
    'Crea test unitari per ogni componente view e modello.',
    'Configura parametri di sicurezza critici secondo best practice.'
  ],
  'Flask': [
    'Segui standard PEP8 per struttura e nomenclatura.',
    'Implementa blueprint per l\'organizzazione modulare delle route.',
    'Isola logica applicativa in servizi separati dalle funzioni view.',
    'Implementa validazione rigorosa per tutti gli input esterni.',
    'Gestisci eccezioni con messaggi informativi ma sicuri.',
    'Configura variabili ambiente secondo principi di sicurezza.',
    'Sviluppa test automatizzati per ogni endpoint API.',
    'Centralizza gestione dipendenze con requirements.txt o equivalenti.'
  ],
  'Go': [
    'Segui le convenzioni di naming delle variabili in camelCase o snake_case coerentemente.',
    'Implementa gestione errori con verifica esplicita dei valori di ritorno.',
    'Evita l\'uso di panic() in codice di produzione se non assolutamente necessario.',
    'Documenta funzioni esportate con commenti in stile godoc.',
    'Implementa test unitari per tutti i pacchetti pubblici.',
    'Utilizza il sistema di moduli Go per gestire le dipendenze esterne.',
    'Verifica possibili race conditions con il race detector.'
  ],
  'Rust': [
    'Rispetta le convenzioni di naming Rust: snake_case per variabili e funzioni, PascalCase per tipi.',
    'Utilizza il sistema di proprietà (ownership) e prestito (borrowing) in modo appropriato.',
    'Evita l\'uso eccessivo di unsafe {} limitandolo solo a casi specifici ben documentati.',
    'Sfrutta il pattern Result<T, E> per gestione errori anziché panic!.',
    'Implementa i trait standard quando appropriato (Display, Debug, Clone, ecc.).',
    'Gestisci correttamente i lifetime nelle strutture dati complesse.',
    'Utilizza iteratori e funzioni di ordine superiore invece di loop espliciti quando possibile.'
  ],
  'PHP': [
    'Segui gli standard PSR per formattazione e struttura del codice.',
    'Implementa funzionalità orientate agli oggetti secondo principi SOLID.',
    'Utilizza Composer per la gestione delle dipendenze esterne.',
    'Evita query SQL dirette preferendo ORM o query builder con parametrizzazione.',
    'Implementa validazione di tutti gli input utente lato server.',
    'Configura gestione errori appropriata senza esporre dettagli tecnici agli utenti.',
    'Documenta le classi e metodi pubblici con standard phpDocumentor.'
  ],
  'Swift': [
    'Rispetta le convenzioni di naming Apple: camelCase per variabili e funzioni, PascalCase per tipi.',
    'Utilizza opzionali in modo sicuro con if-let, guard-let o operatore di coalescenza.',
    'Implementa il pattern delegate per gestire le comunicazioni tra componenti.',
    'Sfrutta le estensioni per organizzare e separare la funzionalità.',
    'Progetta la UI per adattarsi a diverse dimensioni di schermo con Auto Layout.',
    'Preferisci struct rispetto a class quando non è necessaria la semantica di reference type.',
    'Utilizza protocolli per definire interfacce e promuovere la componibilità.',
    'Implementa la gestione degli errori con funzioni che lanciano eccezioni o restituiscono Result.'
  ],
  'Angular': [
    'Struttura le applicazioni seguendo l\'architettura modulare consigliata.',
    'Mantieni i componenti piccoli e con responsabilità singola.',
    'Utilizza i servizi per condividere logica e stato tra componenti.',
    'Implementa la lazy loading dei moduli per migliorare le performance iniziali.',
    'Sfrutta RxJS per gestire flussi di dati e operazioni asincrone.',
    'Stabilisci convenzioni di naming coerenti per componenti, servizi e moduli.',
    'Applica OnPush change detection per migliorare le performance.',
    'Scrivi test unitari per componenti e servizi con Jasmine/Karma.'
  ],
  'Vue.js': [
    'Organizza i componenti secondo l\'architettura Single File Component (SFC).',
    'Preferisci Composition API per componenti complessi per migliore riutilizzo della logica.',
    'Mantieni i componenti piccoli e focalizzati su una singola funzionalità.',
    'Utilizza Vuex o Pinia per gestione centralizzata dello stato.',
    'Implementa routing con Vue Router per navigazione dichiarativa.',
    'Nomina gli eventi con kebab-case e props/methods con camelCase.',
    'Valida sempre le props in ingresso definendo tipi e constraint.',
    'Scrivi test unitari con Vue Test Utils ed end-to-end con Cypress.'
  ],
  'Svelte': [
    'Sfrutta la reattività integrata di Svelte con l\'operatore $:.',
    'Organizza le applicazioni usando componenti Svelte singoli (.svelte).',
    'Utilizza svelte/store per stato condiviso tra componenti.',
    'Mantieni il codice imperativo al minimo grazie all\'approccio dichiarativo.',
    'Sfrutta event forwarding per semplificare la comunicazione tra componenti nidificati.',
    'Implementa transizioni e animazioni utilizzando le direttive integrate.',
    'Segui le convenzioni di Svelte per nomenclatura di azioni, store e componenti.',
    'Ottimizza le performance eliminando dipendenze esterne quando possibile.'
  ]
};

// Funzione per ottenere il percorso della directory dei file di configurazione di GitHub Copilot
function getCopilotConfigPath(): string {
  const homedir = os.homedir();
  return path.join(homedir, '.github', 'copilot');
}

// Funzione per creare la directory dei file di configurazione di GitHub Copilot se non esiste
function ensureCopilotConfigDirectory(): string {
  const configPath = getCopilotConfigPath();
  
  // Verifica se esiste la directory .github
  const githubDirPath = path.join(os.homedir(), '.github');
  if (!fs.existsSync(githubDirPath)) {
    fs.mkdirSync(githubDirPath);
  }
  
  // Verifica se esiste la directory copilot
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
  }
  
  return configPath;
}

// Funzione per scrivere le regole nel file di configurazione di GitHub Copilot
function writeRulesToCopilotConfig(rules: string[]): void {
  try {
    const configPath = ensureCopilotConfigDirectory();
    const rulesPath = path.join(configPath, 'rules.json');
    
    // Crea l'oggetto JSON delle regole
    const rulesObject = {
      version: 1,
      rules: rules
    };
    
    // Scrivi il file JSON
    fs.writeFileSync(rulesPath, JSON.stringify(rulesObject, null, 2));
    
    console.log(`Regole Copilot scritte con successo in: ${rulesPath}`);
  } catch (error) {
    console.error('Errore durante la scrittura del file di regole Copilot:', error);
    vscode.window.showErrorMessage(`Errore durante la scrittura delle regole Copilot: ${error}`);
  }
}

// Funzione per aggiornare le regole di GitHub Copilot con quelle selezionate nell'estensione
function updateCopilotRules(context: vscode.ExtensionContext): void {
  const selectedDefaultRules = context.globalState.get<string[]>('selectedDefaultRules', []);
  const personalRulesText = context.globalState.get<string>('personalRules', '');
  const personalRulesArray = personalRulesText.split(/\r?\n/).filter(r => r.trim().length > 0);
  const memoryRulesEnabled = context.globalState.get<boolean>('enableMemoryRules', false);
  const selectedMemoryRules = memoryRulesEnabled ? context.globalState.get<string[]>('selectedMemoryRules', []) : [];
  
  // Combina tutte le regole attive
  const allRules = [...selectedDefaultRules, ...personalRulesArray, ...selectedMemoryRules];
  
  // Scrivi le regole nel file di configurazione
  writeRulesToCopilotConfig(allRules);
}

// Interfaccia per le statistiche di utilizzo delle regole
interface RuleUsageStats {
  count: number;
  lastUsed: string;
  projects: string[];
  languages: string[];
}

// Interfaccia per le regole con tag
interface TaggedRule {
  text: string;
  tags: string[];
}

// Interfaccia per le opzioni di filtro
interface FilterOptions {
  query: string;
  tags: string[];
  languages: string[];
  usageCount?: {min: number, max: number};
}

class CopilotRulesProvider implements vscode.TreeDataProvider<RuleItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<RuleItem | undefined | void> = new vscode.EventEmitter<RuleItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<RuleItem | undefined | void> = this._onDidChangeTreeData.event;

  private context: vscode.ExtensionContext;
  public defaultRules: string[] = [
    // Specifica le convenzioni di stile e strumenti usati dal team
    'Scrivi JavaScript usando doppi apici e tabulazione per l’indentazione.',
    'Per le dipendenze Java usa Bazel, non Maven.',
    'Segui lo standard PEP8 per Python.',
    'Per le chiamate HTTP preferisci fetch ad axios.',
    'Usa Jira per la gestione delle issue e dei task.',
    // Best practice generali
    'Se mancano dettagli importanti nella richiesta, chiedi chiarimenti prima di generare codice.',
    'Evita di fare assunzioni: chiedi sempre il contesto necessario.',
    'Adotta nomenclatura esplicativa e semanticamente rilevante per variabili e funzioni.',
    'Rispetta le convenzioni stilistiche e le pratiche consigliate del linguaggio in uso.',
    'Incorpora esempi concreti di utilizzo o casi di test nei commenti quando appropriato.',
    'Privilegia soluzioni essenziali, robuste e di facile manutenzione nella struttura del codice.',
    'Per implementazioni complesse, fornisci documentazione dettagliata nei commenti esplicativi.',
    'Evita di generare codice contenente dati sensibili, credenziali o informazioni riservate.',
    'Perfeziona progressivamente le indicazioni in base ai risultati generati.',
    'Condividi con il gruppo di lavoro le direttive che si sono dimostrate particolarmente efficaci.',
    'Documenta errori significativi e relative soluzioni in commenti strutturati con prefisso "ERROR:" seguito da "SOLUTION:" e "CONTEXT:", per costruire una knowledge base accessibile e facilmente consultabile.',
    // Nuove regole efficaci e avanzate
    'Includi una breve panoramica del progetto all’inizio della documentazione.',
    'Usa sempre single quotes per le stringhe in JavaScript.',
    'Prefissa i parametri con "par", le variabili con "var", le risorse con "res" e i moduli con "mod".',
    'Ogni funzione pubblica deve avere un commento JSDoc o equivalente.',
    'Per ogni linguaggio o framework usato, segui le convenzioni specifiche definite nei file markdown di progetto.',
    'Aggiungi esempi di utilizzo nei commenti dove utile.',
    'Non includere mai dati sensibili o credenziali nei suggerimenti di codice.',
    'Documenta ogni nuova dipendenza aggiunta in README.md e usa solo pacchetti approvati.',
    'Segui il formato Conventional Commits per i messaggi di commit.',
    'Le pull request devono essere sempre revisionate da almeno un membro del team.',
    'Usa Jira per il tracking di issue e task e aggiorna lo stato delle attività in tempo reale.'
  ];
  public memoryRules: string[] = [
    // Memoria del progetto: progressi, errori, standard, esempi pratici e prompt file
    'Aggiorna STATUS.md per tracciare milestone, funzionalità completate, decisioni e priorità di progetto.',
    'Registra in ERRORS.md ogni errore significativo: includi descrizione, soluzione adottata e contesto in cui si è verificato.',
    'Mantieni README.md aggiornato con standard di progetto: convenzioni di stile, dimensioni font, regole UI/UX, policy di sicurezza, ecc.',
    'Aggiungi esempi pratici di convenzioni, come prefissi per variabili (es: parNome, varContatore), formati di commit, nomi di parametri, ecc.',
    'Per standard specifici (es: JavaScript, database, API), collega file markdown separati tramite le impostazioni Copilot (github.copilot.chat.codeGeneration.instructions).',
    'Aggiorna la sezione “Regole temporanee” in README.md o in un file dedicato (es: ./docs/sprint-24.md) per policy di sprint, librerie temporanee, ecc.',
    'Elimina periodicamente istruzioni obsolete da STATUS.md, ERRORS.md e altri file di memoria per mantenere il contesto rilevante.',
    'Quando chiedi a Copilot suggerimenti, evidenzia il codice rilevante o apri i file chiave per fornire più contesto.',
    'Sfrutta la chat inline e l’agente @workspace di Copilot per domande che richiedono consapevolezza dell’intero progetto.',
    'Consulta sempre STATUS.md per lo stato attuale e le priorità, ERRORS.md per problemi ricorrenti, README.md per standard e ./docs/ per dettagli specifici.'
  ];
  private getMemoryRulesEnabled(): boolean {
    return this.context.globalState.get<boolean>('enableMemoryRules', false);
  }
  setMemoryRulesEnabled(enabled: boolean) {
    this.context.globalState.update('enableMemoryRules', enabled);
    this.refresh();
  }

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getTreeItem(element: RuleItem): vscode.TreeItem {
    return element;
  }

  // Rendo disponibili i template anche nella sidebar come sezione "Template di regole"
  getChildren(element?: RuleItem): Thenable<RuleItem[]> {
    if (!element) {
      // Recupera i conteggi di regole attive per mostrare nei badge
      const selectedDefaultRules = this.context.globalState.get<string[]>('selectedDefaultRules', []);
      const personalRules = this.context.globalState.get<string>('personalRules', '').split(/\r?\n/).filter(r => r.trim().length > 0);
      const memoryRulesEnabled = this.getMemoryRulesEnabled();
      const selectedMemoryRules = memoryRulesEnabled ? this.context.globalState.get<string[]>('selectedMemoryRules', []) : [];
      
      return Promise.resolve([
        new RuleItem('Regole di default', vscode.TreeItemCollapsibleState.Expanded, 'default', false, false, false, false, false, undefined, selectedDefaultRules.length),
        new RuleItem('Regole personali', vscode.TreeItemCollapsibleState.Expanded, 'personal', false, false, false, false, false, undefined, personalRules.length),
        new RuleItem('Regole della memoria', vscode.TreeItemCollapsibleState.Expanded, 'memory', false, false, false, false, false, undefined, memoryRulesEnabled ? selectedMemoryRules.length : 0),
        new RuleItem('Template di regole', vscode.TreeItemCollapsibleState.Expanded, 'template'),
        new RuleItem('Crea file delle regole', vscode.TreeItemCollapsibleState.None, 'createRulesFileButton'),
        new RuleItem('Salva regole in VS Code', vscode.TreeItemCollapsibleState.None, 'saveRulesButton'),
        new RuleItem('Verifica regole attive', vscode.TreeItemCollapsibleState.None, 'showRulesFileStatusButton')
      ]);
    }
    if (element && element.type === 'template') {
      // Aggiungi pulsante per aprire l'editor visuale delle regole
      return Promise.resolve([
        ...Object.keys(languageTemplates).map(lang =>
          new RuleItem(lang, vscode.TreeItemCollapsibleState.Collapsed, 'templateGroup')
        ),
        new RuleItem('Apri editor visuale regole', vscode.TreeItemCollapsibleState.None, 'openRulesEditorButton')
      ]);
    }
    if (element && element.type === 'templateGroup') {
      const lang = typeof element.label === 'string' ? element.label : String(element.label);
      // Verifica che il linguaggio esista nei template e usa le sue regole
      if (languageTemplates[lang]) {
        return Promise.resolve(languageTemplates[lang].map((rule: string) =>
          new RuleItem(rule, vscode.TreeItemCollapsibleState.None, 'templateRule', false, false, false, false, false, lang)
        ));
      }
      return Promise.resolve([]);
    }
    if (element.type === 'default') {
      const selected = this.context.globalState.get<string[]>('selectedDefaultRules', []);
      return Promise.resolve(this.defaultRules.map(rule => {
        const checked = selected.includes(rule);
        return new RuleItem(rule, vscode.TreeItemCollapsibleState.None, 'defaultRule', checked);
      }));
    }
    if (element.type === 'personal') {
      const personalRules = this.context.globalState.get<string>('personalRules', '');
      return Promise.resolve([
        new RuleItem(personalRules || 'Nessuna regola personale salvata.', vscode.TreeItemCollapsibleState.None, 'personalRule', false, true)
      ]);
    }
    if (element && element.type === 'memory') {
      if (!this.getMemoryRulesEnabled()) {
        return Promise.resolve([
          new RuleItem('Le regole della memoria sono disabilitate.', vscode.TreeItemCollapsibleState.None, 'memoryDisabled', false, false, true)
        ]);
      }
      const selected = this.context.globalState.get<string[]>('selectedMemoryRules', []);
      return Promise.resolve(this.memoryRules.map(rule => {
        const checked = selected.includes(rule);
        return new RuleItem(rule, vscode.TreeItemCollapsibleState.None, 'memoryRule', checked, false, false, true);
      }));
    }
    return Promise.resolve([]);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  // Sistema di tracciamento dell'utilizzo delle regole
  trackRuleUsage(rule: string): void {
    const ruleUsageStats = this.context.globalState.get<Record<string, RuleUsageStats>>('ruleUsageStats', {});
    
    // Ottieni le informazioni sul progetto corrente
    const projectName = vscode.workspace.name || 'Progetto senza nome';
    const activeEditor = vscode.window.activeTextEditor;
    const languageId = activeEditor ? activeEditor.document.languageId : 'unknown';
    
    // Se la regola non è ancora stata tracciata, inizializza le statistiche
    if (!ruleUsageStats[rule]) {
      ruleUsageStats[rule] = {
        count: 0,
        lastUsed: new Date().toISOString(),
        projects: [],
        languages: []
      };
    }
    
    // Aggiorna le statistiche
    const stats = ruleUsageStats[rule];
    stats.count++;
    stats.lastUsed = new Date().toISOString();
    
    // Aggiungi il progetto corrente se non è già presente
    if (projectName && !stats.projects.includes(projectName)) {
      stats.projects.push(projectName);
    }
    
    // Aggiungi il linguaggio corrente se non è già presente
    if (languageId && !stats.languages.includes(languageId)) {
      stats.languages.push(languageId);
    }
    
    // Log per debug (solo durante lo sviluppo)
    console.log(`Tracciato utilizzo regola: "${rule.substring(0, 30)}..." - Conteggio: ${stats.count}`);
    
    // Salva le statistiche aggiornate
    this.context.globalState.update('ruleUsageStats', ruleUsageStats);

    // Notifica la statusbar per aggiornare il conteggio
    this._onDidChangeTreeData.fire();
  }

  // Ottieni le statistiche di utilizzo di una regola specifica
  getRuleUsageStats(rule: string): RuleUsageStats | undefined {
    const ruleUsageStats = this.context.globalState.get<Record<string, RuleUsageStats>>('ruleUsageStats', {});
    return ruleUsageStats[rule];
  }
  
  // Ottieni tutte le statistiche di utilizzo delle regole
  getAllRuleUsageStats(): Record<string, RuleUsageStats> {
    return this.context.globalState.get<Record<string, RuleUsageStats>>('ruleUsageStats', {});
  }

  // Esporta le statistiche di utilizzo
  exportUsageStats(): string {
    const stats = this.getAllRuleUsageStats();
    return JSON.stringify(stats, null, 2);
  }

  // Importa statistiche di utilizzo
  importUsageStats(statsJson: string): boolean {
    try {
      const stats = JSON.parse(statsJson);
      this.context.globalState.update('ruleUsageStats', stats);
      return true;
    } catch (e) {
      console.error('Errore durante l\'importazione delle statistiche:', e);
      return false;
    }
  }

  // Resetta le statistiche di utilizzo
  resetUsageStats(): void {
    // Utilizziamo la API di vscode per chiedere conferma invece di confirm()
    vscode.window.showWarningMessage('Sei sicuro di voler azzerare tutte le statistiche di utilizzo? Questa azione non può essere annullata.', 'Sì', 'No')
      .then(selection => {
        if (selection === 'Sì') {
          this.context.globalState.update('ruleUsageStats', {});
          this._onDidChangeTreeData.fire();
          vscode.window.showInformationMessage('Statistiche di utilizzo azzerate con successo.');
        }
      });
  }

  // Filtra le regole in base alle opzioni specificate
  filterRules(rules: string[], options: FilterOptions): string[] {
    if (!options.query && (!options.tags || options.tags.length === 0) && 
        (!options.languages || options.languages.length === 0) && !options.usageCount) {
      return rules; // Se non ci sono filtri, restituisci tutte le regole
    }

    return rules.filter(rule => {
      // Filtro per testo di ricerca
      if (options.query && !rule.toLowerCase().includes(options.query.toLowerCase())) {
        return false;
      }
      
      // Filtro per tag (da implementare quando avremo regole con tag)
      if (options.tags && options.tags.length > 0) {
        // Esempio di implementazione: per ora controlliamo se la regola contiene uno dei tag
        const hasMatchingTag = options.tags.some(tag => 
          rule.toLowerCase().includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      // Filtro per linguaggio
      if (options.languages && options.languages.length > 0) {
        // Verifica le statistiche di utilizzo per vedere in quali linguaggi è stata usata la regola
        const stats = this.getRuleUsageStats(rule);
        if (!stats || !stats.languages || stats.languages.length === 0) {
          return false;
        }
        
        const hasMatchingLanguage = options.languages.some(lang => 
          stats.languages.some(usedLang => usedLang.toLowerCase() === lang.toLowerCase())
        );
        if (!hasMatchingLanguage) {
          return false;
        }
      }
      
      // Filtro per conteggio utilizzo
      if (options.usageCount) {
        const stats = this.getRuleUsageStats(rule);
        if (!stats) {
          return false;
        }
        
        if (options.usageCount.min !== undefined && stats.count < options.usageCount.min) {
          return false;
        }
        
        if (options.usageCount.max !== undefined && stats.count > options.usageCount.max) {
          return false;
        }
      }
      
      // Se supera tutti i filtri, includi la regola
      return true;
    });
  }
}

class RuleItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly type: string,
    public readonly checked: boolean = false,
    public readonly isTextEdit: boolean = false,
    public readonly isInfo: boolean = false,
    public readonly isMemory: boolean = false,
    public readonly isCommand: boolean = false,
    public readonly templateLanguage?: string,
    public readonly count?: number
  ) {
    super(label, collapsibleState);
    
    this.tooltip = this.label;
    
    // Miglioriamo le icone e la visualizzazione per le sezioni principali
    if (type === 'default' || type === 'personal' || type === 'memory' || type === 'template') {
      this.iconPath = new vscode.ThemeIcon('list-tree');
      if (count !== undefined && count > 0) {
        this.description = `${count} ${type === 'personal' ? 'regole' : 'selezionate'}`;
        // Aggiungiamo un badge con un colore più evidente per mostrare il conteggio
        this.iconPath = new vscode.ThemeIcon('symbol-event');
      }
    }
    
    if (type === 'templateGroup') {
      this.iconPath = new vscode.ThemeIcon('symbol-namespace');
      // Miglioramento del tooltip per i template di linguaggio
      this.tooltip = `Template regole per ${this.label}. Clicca per visualizzare le regole specifiche.`;
    }
    
    if (type === 'defaultRule' || type === 'memoryRule') {
      this.checkboxState = checked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
      this.command = {
        title: 'Attiva/disattiva regola',
        command: type === 'defaultRule' ? 'copilotRules.toggleDefaultRule' : 'copilotRules.toggleMemoryRule',
        arguments: [this]
      };
      // Aggiunta icona per le regole selezionate per migliorare la visibilità
      if (checked) {
        this.iconPath = new vscode.ThemeIcon('check');
      }
    }
    
    if (type === 'personalRule' && isTextEdit) {
      this.contextValue = 'personalRule';
      this.iconPath = new vscode.ThemeIcon('edit');
    }
    
    if (type === 'memoryDisabled') {
      this.iconPath = new vscode.ThemeIcon('info');
      this.contextValue = 'memoryDisabled';
      this.command = {
        title: 'Abilita regole della memoria',
        command: 'copilotRules.enableMemoryRules',
        arguments: []
      };
    }
    
    if (type === 'templateRule') {
      this.checkboxState = checked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
      this.command = {
        title: 'Attiva/disattiva regola template',
        command: 'copilotRules.toggleTemplateRule',
        arguments: [this]
      };
      // Aggiunta icona per le regole di template
      this.iconPath = templateLanguage ? new vscode.ThemeIcon('symbol-method') : undefined;
      this.tooltip = `Regola per ${templateLanguage}. Clicca per ${checked ? 'disattivare' : 'attivare'} questa regola.`;
    }
    
    if (type === 'openRulesEditorButton') {
      this.iconPath = new vscode.ThemeIcon('edit');
      this.command = {
        title: 'Apri editor visuale regole',
        command: 'copilotRules.openAdvancedRulesEditor',
        arguments: []
      };
      this.tooltip = 'Apre un editor visuale avanzato per gestire tutte le regole in modo più intuitivo';
    }
    
    if (type === 'createRulesFileButton') {
      this.iconPath = new vscode.ThemeIcon('cloud-upload');
      this.command = {
        title: 'Salva regole nel progetto',
        command: 'copilotRules.createRulesFile',
        arguments: []
      };
      this.tooltip = 'Salva le regole selezionate nel file di istruzioni GitHub Copilot del progetto';
    }
    
    if (type === 'saveRulesButton') {
      this.iconPath = new vscode.ThemeIcon('save');
      this.command = {
        title: 'Salva regole in VS Code',
        command: 'copilotRules.saveSelectedRules',
        arguments: []
      };
      this.tooltip = 'Salva le regole selezionate in VS Code (senza inserirle nel progetto)';
    }
    
    if (type === 'showRulesFileStatusButton') {
      this.iconPath = new vscode.ThemeIcon('pulse');
      this.command = {
        title: 'Mostra stato delle regole',
        command: 'copilotRules.showRulesFileStatus',
        arguments: []
      };
      this.tooltip = 'Mostra un report dettagliato delle regole attualmente attive nel progetto';
    }
  }
}

// Comando per aprire l'editor visuale avanzato
function openAdvancedRulesEditor(context: vscode.ExtensionContext, rulesProvider: CopilotRulesProvider) {
  // Crea un nuovo webview panel
  const panel = vscode.window.createWebviewPanel(
    'copilotRulesEditor',
    'Editor Avanzato Regole Copilot',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'webviewContent'))]
    }
  );
  
  // Ottieni il percorso del file HTML dell'editor visuale
  const htmlPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webviewContent', 'advancedRulesEditor.html'));
  
  // Leggi il contenuto del file HTML
  vscode.workspace.fs.readFile(htmlPath).then(data => {
    // Ottieni il contenuto del file come stringa
    const htmlContent = data.toString();
    
    // Imposta il contenuto HTML del webview
    panel.webview.html = htmlContent;
    
    // Gestisci i messaggi dal webview
    panel.webview.onDidReceiveMessage(message => {
      if (message.type === 'initialize') {
        // Invia i dati iniziali al webview
        const selectedDefaultRules = context.globalState.get<string[]>('selectedDefaultRules', []);
        const personalRulesText = context.globalState.get<string>('personalRules', '');
        const personalRules = personalRulesText.split(/\r?\n/).filter(r => r.trim().length > 0);
        const selectedMemoryRules = context.globalState.get<string[]>('selectedMemoryRules', []);
        const ruleUsageStats = rulesProvider.getAllRuleUsageStats();
        
        panel.webview.postMessage({
          type: 'update',
          data: {
            defaultRules: rulesProvider.defaultRules,
            memoryRules: rulesProvider.memoryRules,
            personalRules: personalRules,
            selectedDefaultRules: selectedDefaultRules,
            selectedMemoryRules: selectedMemoryRules,
            templates: languageTemplates,
            ruleUsageStats: ruleUsageStats
          }
        });
      } else if (message.type === 'save') {
        // Salva le regole inviate dal webview
        context.globalState.update('selectedDefaultRules', message.selectedDefaultRules);
        context.globalState.update('selectedMemoryRules', message.selectedMemoryRules);
        
        // Converti le regole personali in una stringa con una riga per regola
        const personalRulesText = message.personalRules.join('\n');
        context.globalState.update('personalRules', personalRulesText);
        
        // Aggiorna la visualizzazione nella sidebar
        rulesProvider.refresh();
        
        // Mostra un messaggio di conferma
        vscode.window.showInformationMessage('Regole Copilot salvate con successo.');
      }
    });
  });
}

export function activate(context: vscode.ExtensionContext) {
  // Inizializza il fornitore di regole
  const rulesProvider = new CopilotRulesProvider(context);
  
  // Crea la directory e il file delle regole Copilot all'avvio dell'estensione
  updateCopilotRules(context);
  
  // Variabili per tenere traccia dello stato del decoratore
  let decorationTimeout: NodeJS.Timeout | undefined = undefined;
  let activeEditor = vscode.window.activeTextEditor;
  let commentDecorationType = vscode.window.createTextEditorDecorationType({
    color: '#88c2c2'
  });
  
  // Inizializza il decorator quando cambia l'editor attivo
  if (activeEditor) {
    updateDecorations();
  }
  
  // Funzione per aggiornare i decoratori di commento
  function updateDecorations() {
    if (!activeEditor) {
      return;
    }
    const selectedDefaultRules = context.globalState.get<string[]>('selectedDefaultRules', []);
    const personalRulesText = context.globalState.get<string>('personalRules', '');
    let personalRulesArray = personalRulesText.split(/\r?\n/).filter((r: string) => r.trim().length > 0);
    const memoryRulesEnabled = context.globalState.get<boolean>('enableMemoryRules', false);
    const selectedMemoryRules = memoryRulesEnabled ? context.globalState.get<string[]>('selectedMemoryRules', []) : [];
    
    // Combino tutte le regole attive
    const allRules = [...selectedDefaultRules, ...personalRulesArray, ...selectedMemoryRules];
    
    // Se non ci sono regole attive, non applicare decorazioni
    if (allRules.length === 0) {
      activeEditor.setDecorations(commentDecorationType, []);
      return;
    }
    
    // Cerca il pattern di commento adatto al linguaggio
    const languageId = activeEditor.document.languageId;
    let lineCommentPrefix = '//';
    let blockCommentStart = '/*';
    let blockCommentEnd = '*/';
    
    if (languageId === 'python' || languageId === 'jupyter') {
      lineCommentPrefix = '#';
      blockCommentStart = '"""';
      blockCommentEnd = '"""';
    } else if (languageId === 'html' || languageId === 'xml') {
      lineCommentPrefix = '';
      blockCommentStart = '<!--';
      blockCommentEnd = '-->';
    }
    
    // Trova tutti i commenti nel documento
    const text = activeEditor.document.getText();
    let decorations: vscode.DecorationOptions[] = [];
    let match;
    
    const lineCommentRegex = new RegExp(`${escapeRegExp(lineCommentPrefix)}.*$`, 'gm');
    if (lineCommentPrefix) {
      // eslint-disable-next-line no-cond-assign
      while (match = lineCommentRegex.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        
        // Controllo se il commento contiene una delle regole
        for (const rule of allRules) {
          if (match[0].toLowerCase().includes(rule.toLowerCase())) {
            // Traccia l'utilizzo della regola trovata
            rulesProvider.trackRuleUsage(rule);
            
            decorations.push({ range: new vscode.Range(startPos, endPos) });
            break;
          }
        }
      }
    }
    
    // Trova blocchi di commento
    if (blockCommentStart && blockCommentEnd) {
      const blockCommentRegex = new RegExp(`${escapeRegExp(blockCommentStart)}([\\s\\S]*?)${escapeRegExp(blockCommentEnd)}`, 'g');
      // eslint-disable-next-line no-cond-assign
      while (match = blockCommentRegex.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        
        // Controllo se il commento contiene una delle regole
        for (const rule of allRules) {
          if (match[0].toLowerCase().includes(rule.toLowerCase())) {
            // Traccia l'utilizzo della regola trovata
            rulesProvider.trackRuleUsage(rule);
            
            decorations.push({ range: new vscode.Range(startPos, endPos) });
            break;
          }
        }
      }
    }
    
    // Applica le decorazioni
    activeEditor.setDecorations(commentDecorationType, decorations);
  }
  
  // Funzione per gestire il debounce
  function triggerUpdateDecorations() {
    if (decorationTimeout) {
      clearTimeout(decorationTimeout);
      decorationTimeout = undefined;
    }
    decorationTimeout = setTimeout(updateDecorations, 500);
  }
  
  // Registra i comandi
  // Registra comandi per l'attivazione/disattivazione delle regole
  context.subscriptions.push(
    vscode.commands.registerCommand('copilotRules.toggleDefaultRule', (item: RuleItem) => {
      // Ottieni la lista attuale di regole selezionate
      const selectedRules = context.globalState.get<string[]>('selectedDefaultRules', []);
      const rule = item.label.toString();
      
      // Crea una copia della lista corrente per non modificare l'originale direttamente
      const updatedSelectedRules = [...selectedRules];
      
      if (item.checked) {
        // Rimuovi la regola dalla selezione
        const index = updatedSelectedRules.indexOf(rule);
        if (index !== -1) {
          updatedSelectedRules.splice(index, 1);
        }
      } else {
        // Aggiungi la regola alla selezione
        if (!updatedSelectedRules.includes(rule)) {
          updatedSelectedRules.push(rule);
        }
      }
      
      // Aggiorna la lista delle regole selezionate
      context.globalState.update('selectedDefaultRules', updatedSelectedRules);
      
      // Non aggiornare automaticamente le regole nel file di configurazione
      // Ora questo sarà fatto solo quando l'utente preme il pulsante "Inietta regole"
      
      // Aggiorna solo l'interfaccia
      rulesProvider.refresh();
      updateDecorations();
    }),
    
    vscode.commands.registerCommand('copilotRules.toggleMemoryRule', (item: RuleItem) => {
      // Ottieni la lista attuale di regole selezionate
      const selectedRules = context.globalState.get<string[]>('selectedMemoryRules', []);
      const rule = item.label.toString();
      
      // Crea una copia della lista corrente per non modificare l'originale direttamente
      const updatedSelectedRules = [...selectedRules];
      
      if (item.checked) {
        // Rimuovi la regola dalla selezione
        const index = updatedSelectedRules.indexOf(rule);
        if (index !== -1) {
          updatedSelectedRules.splice(index, 1);
        }
      } else {
        // Aggiungi la regola alla selezione
        if (!updatedSelectedRules.includes(rule)) {
          updatedSelectedRules.push(rule);
        }
      }
      
      // Aggiorna la lista delle regole selezionate
      context.globalState.update('selectedMemoryRules', updatedSelectedRules);
      
      // Non aggiornare automaticamente le regole nel file di configurazione
      // Ora questo sarà fatto solo quando l'utente preme il pulsante "Inietta regole"
      
      // Aggiorna solo l'interfaccia
      rulesProvider.refresh();
      updateDecorations();
    }),
    
    vscode.commands.registerCommand('copilotRules.enableMemoryRules', () => {
      rulesProvider.setMemoryRulesEnabled(true);
      // Aggiorna le regole nel file di configurazione di GitHub Copilot
      updateCopilotRules(context);
      vscode.window.showInformationMessage('Regole della memoria abilitate.');
    }),
    
    vscode.commands.registerCommand('copilotRules.addTemplateRule', (item: RuleItem) => {
      const rule = item.label.toString();
      const personalRules = context.globalState.get<string>('personalRules', '');
      const updatedRules = personalRules ? personalRules + '\n' + rule : rule;
      context.globalState.update('personalRules', updatedRules);
      // Aggiorna le regole nel file di configurazione di GitHub Copilot
      updateCopilotRules(context);
      rulesProvider.refresh();
      vscode.window.showInformationMessage(`Regola "${rule}" aggiunta alle regole personali.`);
    }),
    
    // Registra il comando per aprire l'editor visuale avanzato
    vscode.commands.registerCommand('copilotRules.openAdvancedRulesEditor', () => {
      openAdvancedRulesEditor(context, rulesProvider);
    }),
    
    // Registra i comandi per creare e verificare il file delle regole
    vscode.commands.registerCommand('copilotRules.createRulesFile', () => {
      createRulesFile(context);
      // Aggiorna la visualizzazione
      rulesProvider.refresh();
    }),
    
    vscode.commands.registerCommand('copilotRules.showRulesFileStatus', () => {
      const { activeRules, inactiveRules } = readRulesFile();
      
      if (activeRules.length === 0 && inactiveRules.length === 0) {
        vscode.window.showInformationMessage('Il file delle regole non esiste o è vuoto. Usa il comando "Crea file delle regole" per crearlo.');
        return;
      }
      
      // Mostra un messaggio informativo con il numero di regole attive e inattive
      vscode.window.showInformationMessage(
        `Stato delle regole: ${activeRules.length} regole attive, ${inactiveRules.length} regole inattive.`
      );
      
      // Crea un WebView per mostrare i dettagli sulle regole attive e inattive
      const panel = vscode.window.createWebviewPanel(
        'rulesStatus',
        'Stato Regole Copilot',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      
      // Crea il contenuto HTML
      let html = `
        <html>
        <head>
          <style>
            :root {
              --primary-color: #0078d4;
              --active-color: #3c9e3c;
              --inactive-color: #d83b01;
              --bg-color: #f5f5f5;
              --card-bg: #ffffff;
              --text-color: #333333;
              --border-color: #dddddd;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 20px;
              background-color: var(--bg-color);
              color: var(--text-color);
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid var(--border-color);
            }
            
            h1 {
              color: var(--primary-color);
              font-size: 28px;
              margin-bottom: 10px;
            }
            
            .status-summary {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin-bottom: 30px;
            }
            
            .status-card {
              background: var(--card-bg);
              border-radius: 8px;
              padding: 20px;
              width: 200px;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              transition: transform 0.3s ease;
            }
            
            .status-card:hover {
              transform: translateY(-5px);
            }
            
            .status-card.active {
              border-left: 5px solid var(--active-color);
            }
            
            .status-card.inactive {
              border-left: 5px solid var(--inactive-color);
            }
            
            .status-count {
              font-size: 48px;
              font-weight: bold;
              margin: 10px 0;
            }
            
            .active-count {
              color: var(--active-color);
            }
            
            .inactive-count {
              color: var(--inactive-color);
            }
            
            .status-label {
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .rules-container {
              display: flex;
              gap: 30px;
              margin-top: 20px;
            }
            
            .rules-column {
              flex: 1;
              background: var(--card-bg);
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .rules-header {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }
            
            .rules-icon {
              margin-right: 10px;
              width: 24px;
              height: 24px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              color: white;
              font-weight: bold;
            }
            
            .active-icon {
              background-color: var(--active-color);
            }
            
            .inactive-icon {
              background-color: var(--inactive-color);
            }
            
            h2 {
              margin: 0;
              font-size: 20px;
            }
            
            .active-title {
              color: var(--active-color);
            }
            
            .inactive-title {
              color: var(--inactive-color);
            }
            
            ul {
              padding-left: 20px;
              margin-top: 10px;
            }
            
            li {
              margin-bottom: 12px;
              padding: 8px;
              border-radius: 4px;
              transition: background-color 0.2s ease;
            }
            
            li:hover {
              background-color: rgba(0, 0, 0, 0.05);
            }
            
            .search-bar {
              display: flex;
              margin-bottom: 20px;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .search-input {
              width: 100%;
              padding: 10px 15px;
              border: none;
              font-size: 16px;
            }
            
            .search-input:focus {
              outline: none;
            }
            
            .empty-state {
              text-align: center;
              padding: 30px;
              color: #666;
              font-style: italic;
            }
            
            /* Aggiungiamo animazioni per un'esperienza più dinamica */
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            .animated {
              animation: fadeIn 0.5s ease-out, slideIn 0.5s ease-out;
            }
            
            /* Stili per il tema scuro di VS Code */
            @media (prefers-color-scheme: dark) {
              :root {
                --bg-color: #1e1e1e;
                --card-bg: #252526;
                --text-color: #e0e0e0;
                --border-color: #3c3c3c;
                --primary-color: #5ea6ed;
              }
            }
          </style>
        </head>
        <body>
          <div class="header animated">
            <h1>Stato Regole GitHub Copilot</h1>
            <p>Ecco un riassunto delle regole attualmente configurate per GitHub Copilot</p>
          </div>
          
          <div class="status-summary animated">
            <div class="status-card active">
              <div class="status-label">Regole Attive</div>
              <div class="status-count active-count">${activeRules.length}</div>
            </div>
            
            <div class="status-card inactive">
              <div class="status-label">Regole Inattive</div>
              <div class="status-count inactive-count">${inactiveRules.length}</div>
            </div>
          </div>
          
          <div class="search-bar">
            <input type="text" class="search-input" placeholder="Cerca nelle regole..." id="searchInput">
          </div>
          
          <div class="rules-container">
            <div class="rules-column animated">
              <div class="rules-header">
                <div class="rules-icon active-icon">✓</div>
                <h2 class="active-title">Regole Attive</h2>
              </div>
              
              ${activeRules.length > 0 ? 
                `<ul id="activeRulesList">
                  ${activeRules.map((rule, index) => 
                    `<li data-index="${index}" class="rule-item">${rule}</li>`
                  ).join('')}
                </ul>` : 
                `<div class="empty-state">
                  <p>Nessuna regola attiva trovata.</p>
                  <p>Usa il comando "Crea file delle regole" per crearne di nuove.</p>
                </div>`
              }
            </div>
            
            <div class="rules-column animated">
              <div class="rules-header">
                <div class="rules-icon inactive-icon">⦻</div>
                <h2 class="inactive-title">Regole Inattive</h2>
              </div>
              
              ${inactiveRules.length > 0 ? 
                `<ul id="inactiveRulesList">
                  ${inactiveRules.map((rule, index) => 
                    `<li data-index="${index}" class="rule-item">${rule}</li>`
                  ).join('')}
                </ul>` : 
                `<div class="empty-state">
                  <p>Nessuna regola inattiva trovata.</p>
                </div>`
              }
            </div>
          </div>
          
          <script>
            (function() {
              // Funzionalità di ricerca
              const searchInput = document.getElementById('searchInput');
              const activeRulesList = document.getElementById('activeRulesList');
              const inactiveRulesList = document.getElementById('inactiveRulesList');
              
              if (searchInput && (activeRulesList || inactiveRulesList)) {
                searchInput.addEventListener('input', function() {
                  const searchTerm = this.value.toLowerCase();
                  
                  // Filtra le regole attive
                  if (activeRulesList) {
                    const activeItems = activeRulesList.querySelectorAll('li');
                    activeItems.forEach(item => {
                      const text = item.textContent.toLowerCase();
                      item.style.display = text.includes(searchTerm) ? 'list-item' : 'none';
                    });
                  }
                  
                  // Filtra le regole inattive
                  if (inactiveRulesList) {
                    const inactiveItems = inactiveRulesList.querySelectorAll('li');
                    inactiveItems.forEach(item => {
                      const text = item.textContent.toLowerCase();
                      item.style.display = text.includes(searchTerm) ? 'list-item' : 'none';
                    });
                  }
                });
              }
              
              // Animazione per gli elementi della lista
              const listItems = document.querySelectorAll('.rule-item');
              listItems.forEach((item, index) => {
                item.style.animationDelay = \`\${index * 0.05}s\`;
                item.classList.add('animated');
              });
            })();
          </script>
        </body>
        </html>
      `;
      
      // Imposta il contenuto HTML del webview
      panel.webview.html = html;
    })
  );
  
  // Registra il TreeDataProvider per la visualizzazione delle regole
  vscode.window.registerTreeDataProvider('copilotRulesView', rulesProvider);
  
  // Aggiungi un pulsante "Inserisci regole selezionate" nella barra di stato
  const insertRulesButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  insertRulesButton.text = "$(rocket) Inserisci Regole in Copilot";
  insertRulesButton.tooltip = "Inserisci le regole selezionate nel file di istruzioni di GitHub Copilot";
  insertRulesButton.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  insertRulesButton.color = new vscode.ThemeColor('statusBarItem.warningForeground');
  insertRulesButton.command = "copilotRules.insertSelectedRules";
  insertRulesButton.show();
  context.subscriptions.push(insertRulesButton);
  
  // Aggiungi anche un pulsante per salvare le regole selezionate
  const saveRulesButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  saveRulesButton.text = "$(save) Salva Selezione";
  saveRulesButton.tooltip = "Salva la selezione attuale delle regole in VS Code (senza inserirle nel progetto)";
  saveRulesButton.command = "copilotRules.saveSelectedRules";
  saveRulesButton.show();
  context.subscriptions.push(saveRulesButton);
  
  // Registra il comando per inserire le regole selezionate
  context.subscriptions.push(
    vscode.commands.registerCommand('copilotRules.insertSelectedRules', () => {
      // Verifica che non ci siano regole duplicate
      const selectedDefaultRules = context.globalState.get<string[]>('selectedDefaultRules', []);
      const personalRulesText = context.globalState.get<string>('personalRules', '');
      const personalRulesArray = personalRulesText.split(/\r?\n/).filter(r => r.trim().length > 0);
      const memoryRulesEnabled = context.globalState.get<boolean>('enableMemoryRules', false);
      const selectedMemoryRules = memoryRulesEnabled ? context.globalState.get<string[]>('selectedMemoryRules', []) : [];
      
      // Combina tutte le regole attive e rimuovi i duplicati
      const allRulesSet = new Set([...selectedDefaultRules, ...personalRulesArray, ...selectedMemoryRules]);
      const allRules = Array.from(allRulesSet);
      
      // Se le regole sono cambiate, aggiorna lo stato
      if (allRules.length !== [...selectedDefaultRules, ...personalRulesArray, ...selectedMemoryRules].length) {
        vscode.window.showInformationMessage(`Rimosse ${[...selectedDefaultRules, ...personalRulesArray, ...selectedMemoryRules].length - allRules.length} regole duplicate.`);
      }
      
      // Crea il file delle regole
      createRulesFile(context);
      
      vscode.window.showInformationMessage(`${allRules.length} regole inserite con successo nel file di istruzioni di Copilot.`);
    })
  );
  
  // Registra il comando per attivare/disattivare le regole dei template
  context.subscriptions.push(
    vscode.commands.registerCommand('copilotRules.toggleTemplateRule', (item: RuleItem) => {
      if (!item.templateLanguage) {
        return;
      }
      
      const rule = item.label.toString();
      // Controlliamo se la regola è già nelle regole personali
      const personalRulesText = context.globalState.get<string>('personalRules', '');
      const personalRulesArray = personalRulesText.split(/\r?\n/).filter(r => r.trim().length > 0);
      
      // Crea una copia dell'array di regole personali
      const updatedPersonalRules = [...personalRulesArray];
      
      if (personalRulesArray.includes(rule)) {
        // Se la regola è già presente, rimuovila
        const index = updatedPersonalRules.indexOf(rule);
        if (index !== -1) {
          updatedPersonalRules.splice(index, 1);
        }
        const updatedRules = updatedPersonalRules.join('\n');
        context.globalState.update('personalRules', updatedRules);
        vscode.window.showInformationMessage(`Regola "${rule.substring(0, 30)}..." rimossa dalle regole personali.`);
      } else {
        // Altrimenti, aggiungila
        updatedPersonalRules.push(rule);
        const updatedRules = updatedPersonalRules.join('\n');
        context.globalState.update('personalRules', updatedRules);
        vscode.window.showInformationMessage(`Regola "${rule.substring(0, 30)}..." aggiunta alle regole personali.`);
      }
      
      // Non aggiorna automaticamente le regole nel file di configurazione
      // Ora questo sarà fatto solo quando l'utente preme il pulsante "Inietta regole"
      
      // Aggiorna solo l'interfaccia
      rulesProvider.refresh();
    })
  );
  
  // Registra il comando per salvare le regole selezionate in VS Code
  context.subscriptions.push(
    vscode.commands.registerCommand('copilotRules.saveSelectedRules', () => {
      vscode.window.showInformationMessage('Regole salvate con successo in VS Code');
    })
  );
}

export function deactivate() {}

// Funzione utility per fare l'escape dei caratteri speciali nelle regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Create a rules directory and file in Copilot's expected format
export function createRulesFile(context: vscode.ExtensionContext): void {
  try {
    // Usa la root del workspace attivo
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Nessuna cartella di progetto aperta. Apri una cartella per iniettare le regole.');
      return;
    }
    const projectRoot = workspaceFolders[0].uri.fsPath;
    // Percorso .github nella root del progetto
    const githubDirPath = path.join(projectRoot, '.github');
    if (!fs.existsSync(githubDirPath)) {
      fs.mkdirSync(githubDirPath);
    }
    // Percorso file istruzioni Copilot
    const copilotInstructionsPath = path.join(githubDirPath, 'copilot-instructions.md');
    // Chiedi conferma se il file esiste già
    if (fs.existsSync(copilotInstructionsPath)) {
      vscode.window.showWarningMessage(
        'Il file delle regole Copilot esiste già nel progetto. Vuoi sovrascriverlo con le regole selezionate?',
        { modal: true },
        'Sì', 'No'
      ).then(selection => {
        if (selection === 'Sì') {
          proceedWithRuleFileCreation(context, copilotInstructionsPath);
        } else {
          vscode.window.showInformationMessage('Creazione del file regole annullata.');
        }
      });
    } else {
      proceedWithRuleFileCreation(context, copilotInstructionsPath);
    }
  } catch (error) {
    console.error('Errore durante la creazione del file di istruzioni Copilot:', error);
    vscode.window.showErrorMessage(`Errore durante la creazione del file di istruzioni Copilot: ${error}`);
  }
}

// Helper function to actually create the rules file
function proceedWithRuleFileCreation(context: vscode.ExtensionContext, copilotInstructionsPath: string): void {
  try {
    // Get currently active rules
    const selectedDefaultRules = context.globalState.get<string[]>('selectedDefaultRules', []);
    const personalRulesText = context.globalState.get<string>('personalRules', '');
    const personalRulesArray = personalRulesText.split(/\r?\n/).filter(r => r.trim().length > 0);
    const memoryRulesEnabled = context.globalState.get<boolean>('enableMemoryRules', false);
    const selectedMemoryRules = memoryRulesEnabled ? context.globalState.get<string[]>('selectedMemoryRules', []) : [];
    
    // Combine all selected rules
    const selectedRules = [...selectedDefaultRules, ...personalRulesArray, ...selectedMemoryRules];
    
    // Read existing rules from the file if it exists
    let existingRules: string[] = [];
    if (fs.existsSync(copilotInstructionsPath)) {
      const existingContent = fs.readFileSync(copilotInstructionsPath, 'utf8');
      
      // Estrai le regole da un file Markdown esistente
      // Cerca le righe che iniziano con "- " dopo l'intestazione
      const ruleRegex = /^- (.+)$/gm;
      let match;
      while ((match = ruleRegex.exec(existingContent)) !== null) {
        if (match[1] && match[1].trim().length > 0) {
          existingRules.push(match[1].trim());
        }
      }
      
      console.log(`Trovate ${existingRules.length} regole esistenti nel file di istruzioni.`);
    }
    
    // Confronta le regole selezionate con quelle esistenti
    const newRules: string[] = [];
    const duplicateRules: string[] = [];
    
    // Controlla quali regole selezionate sono nuove e quali sono duplicati
    selectedRules.forEach(rule => {
      if (!existingRules.some(existingRule => 
        existingRule.toLowerCase() === rule.toLowerCase()
      )) {
        newRules.push(rule);
      } else {
        duplicateRules.push(rule);
      }
    });
    
    // Unisci le regole esistenti con quelle nuove
    const allRules = [...existingRules, ...newRules];
    
    // Crea il contenuto Markdown per il file di istruzioni
    let markdownContent = `# GitHub Copilot Instructions\n\n`;
    markdownContent += `The following rules should be applied when generating code:\n\n`;
    
    // Aggiungi ogni regola come istruzione separata
    allRules.forEach(rule => {
      markdownContent += `- ${rule}\n`;
    });
    
    // Aggiungi informazioni aggiuntive
    markdownContent += `\n## Last Updated\n`;
    markdownContent += `These rules were last updated on ${new Date().toLocaleString()}.\n`;
    
    // Scrivi il file Markdown
    fs.writeFileSync(copilotInstructionsPath, markdownContent);
    
    // Prepara il messaggio per l'utente
    let message = '';
    if (newRules.length > 0) {
      message += `Aggiunte ${newRules.length} nuove regole. `;
    }
    if (duplicateRules.length > 0) {
      message += `${duplicateRules.length} regole erano già presenti nel file e sono state mantenute.`;
    }
    if (newRules.length === 0 && duplicateRules.length === 0) {
      message = 'Nessuna nuova regola aggiunta. Il file è stato aggiornato.';
    }
    
    console.log(`File di istruzioni Copilot creato con successo a: ${copilotInstructionsPath}`);
    vscode.window.showInformationMessage(message);
    
    // Salva anche nel percorso tradizionale per retrocompatibilità
    const configPath = ensureCopilotConfigDirectory();
    const rulesPath = path.join(configPath, 'rules.json');
    
    // Crea l'oggetto JSON con le regole attive
    const rulesObject = {
      version: 1,
      rules: allRules
    };
    
    // Scrivi il file JSON
    fs.writeFileSync(rulesPath, JSON.stringify(rulesObject, null, 2));
    console.log(`Creato anche il file legacy delle regole in: ${rulesPath}`);
    
    // Apri il file di istruzioni nell'editor
    vscode.workspace.openTextDocument(copilotInstructionsPath).then(doc => {
      vscode.window.showTextDocument(doc);
    });
  } catch (error) {
    console.error('Errore durante la creazione del file di istruzioni Copilot:', error);
    vscode.window.showErrorMessage(`Errore durante la creazione del file di istruzioni Copilot: ${error}`);
  }
}

export function readRulesFile(): { activeRules: string[], inactiveRules: string[] } {
  try {
    // Utilizza il percorso standard di Copilot
    const configPath = getCopilotConfigPath();
    const rulesPath = path.join(configPath, 'rules.json');
    const homedir = os.homedir();
    const copilotInstructionsPath = path.join(homedir, '.github', 'copilot-instructions.md');
    
    let activeRules: string[] = [];
    let inactiveRules: string[] = [];
    
    // Verifica il file JSON delle regole
    if (fs.existsSync(rulesPath)) {
      // Read and parse the file
      const fileContent = fs.readFileSync(rulesPath, 'utf8');
      const rulesObject = JSON.parse(fileContent);
      
      if (rulesObject.rules) {
        // La versione standard di Copilot ha solo un array di stringhe
        if (Array.isArray(rulesObject.rules) && typeof rulesObject.rules[0] === 'string') {
          // Tutte le regole sono considerate attive
          rulesObject.rules.forEach((rule: string) => {
            activeRules.push(rule);
          });
        } 
        // La nostra versione estesa ha un array di oggetti con proprietà text e active
        else if (Array.isArray(rulesObject.rules) && typeof rulesObject.rules[0] === 'object') {
          rulesObject.rules.forEach((rule: { text: string, active: boolean }) => {
            if (rule.active) {
              activeRules.push(rule.text);
            } else {
              inactiveRules.push(rule.text);
            }
          });
        }
      }
    }
    
    // Verifica anche il file markdown delle istruzioni
    if (fs.existsSync(copilotInstructionsPath)) {
      const markdownContent = fs.readFileSync(copilotInstructionsPath, 'utf8');
      
      // Estrai le regole da un file Markdown
      // Cerca le righe che iniziano con "- " dopo l'intestazione
      const ruleRegex = /^- (.+)$/gm;
      let match;
      const markdownRules: string[] = [];
      
      while ((match = ruleRegex.exec(markdownContent)) !== null) {
        if (match[1] && match[1].trim().length > 0) {
          markdownRules.push(match[1].trim());
        }
      }
      
      // Aggiorna le regole attive e inattive
      // Se una regola è nel file markdown ma non nel file JSON, la aggiungiamo alle attive
      markdownRules.forEach(rule => {
        if (!activeRules.includes(rule) && !inactiveRules.includes(rule)) {
          activeRules.push(rule);
        }
      });
      
      // Se una regola è nel file JSON ma non nel markdown, la spostiamo nelle inattive
      const allJsonRules = [...activeRules, ...inactiveRules];
      activeRules = activeRules.filter(rule => markdownRules.includes(rule));
      
      // Aggiorna le inattive con le regole presenti nel JSON ma non nel markdown
      allJsonRules.forEach(rule => {
        if (!markdownRules.includes(rule) && !inactiveRules.includes(rule)) {
          inactiveRules.push(rule);
        }
      });
    }
    
    console.log(`Regole attive: ${activeRules.length}, Regole inattive: ${inactiveRules.length}`);
    return { activeRules, inactiveRules };
  } catch (error) {
    console.error('Errore durante la lettura del file delle regole:', error);
    vscode.window.showErrorMessage(`Errore durante la lettura del file delle regole: ${error}`);
  }
  
  // Return empty arrays if file doesn't exist or there's an error
  return { activeRules: [], inactiveRules: [] };
}
