// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

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
    'Definisci il contesto generale all\'inizio di ogni modulo o funzione per facilitare la comprensione.',
    'Inserisci direttive specifiche nei commenti per orientare correttamente il comportamento di Copilot.',
    'Adotta nomenclatura esplicativa e semanticamente rilevante per variabili e funzioni.',
    'Rispetta le convenzioni stilistiche e le pratiche consigliate del linguaggio in uso.',
    'Incorpora esempi concreti di utilizzo o casi di test nei commenti quando appropriato.',
    'Privilegia soluzioni essenziali, robuste e di facile manutenzione nella struttura del codice.',
    'Per implementazioni complesse, fornisci documentazione dettagliata nei commenti esplicativi.',
    'Evita di generare codice contenente dati sensibili, credenziali o informazioni riservate.',
    'Perfeziona progressivamente le indicazioni in base ai risultati generati.',
    'Condividi con il gruppo di lavoro le direttive che si sono dimostrate particolarmente efficaci.',
    'Documenta errori significativi e relative soluzioni in commenti strutturati con prefisso "ERROR:" seguito da "SOLUTION:" e "CONTEXT:", per costruire una knowledge base accessibile e facilmente consultabile.'
  ];
  public memoryRules: string[] = [
    'Stabilisci un documento README contenente le linee guida e le politiche del progetto.',
    'Implementa un file STATUS.md dedicato al monitoraggio degli sviluppi, delle decisioni strategiche e degli interventi significativi.',
    'Mantieni costantemente aggiornata la documentazione per garantire contesto adeguato sia agli sviluppatori che agli strumenti di intelligenza artificiale.',
    'Utilizza sistematicamente questi documenti come fonte di riferimento per Copilot e durante i processi di revisione del codice.',
    'Documenta in un file ERRORS.md centralizzato tutti gli errori significativi riscontrati, con tre sezioni: descrizione dettagliata del problema, soluzione implementata e contesto in cui si è verificato, per facilitare la risoluzione di problemi simili in futuro.'
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
        new RuleItem('Template di regole', vscode.TreeItemCollapsibleState.Expanded, 'template')
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
    
    if (type === 'default' || type === 'personal' || type === 'memory' || type === 'template') {
      this.iconPath = new vscode.ThemeIcon('list-unordered');
      if (count !== undefined && count > 0) {
        this.description = `${count} ${type === 'personal' ? 'regole' : 'selezionate'}`;
      }
    }
    
    if (type === 'templateGroup') {
      this.iconPath = new vscode.ThemeIcon('symbol-namespace');
    }
    
    if (type === 'defaultRule' || type === 'memoryRule') {
      this.checkboxState = checked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
      this.command = {
        title: 'Attiva/disattiva regola',
        command: type === 'defaultRule' ? 'copilotRules.toggleDefaultRule' : 'copilotRules.toggleMemoryRule',
        arguments: [this]
      };
    }
    
    if (type === 'personalRule' && isTextEdit) {
      this.contextValue = 'personalRule';
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
      this.command = {
        title: 'Aggiungi alle regole personali',
        command: 'copilotRules.addTemplateRule',
        arguments: [this]
      };
    }
    
    if (type === 'openRulesEditorButton') {
      this.iconPath = new vscode.ThemeIcon('edit');
      this.command = {
        title: 'Apri editor visuale regole',
        command: 'copilotRules.openAdvancedRulesEditor',
        arguments: []
      };
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
      const selectedRules = context.globalState.get<string[]>('selectedDefaultRules', []);
      const rule = item.label.toString();
      
      if (item.checked) {
        // Rimuovi la regola dalla selezione
        const index = selectedRules.indexOf(rule);
        if (index !== -1) {
          selectedRules.splice(index, 1);
        }
      } else {
        // Aggiungi la regola alla selezione
        if (!selectedRules.includes(rule)) {
          selectedRules.push(rule);
        }
      }
      
      context.globalState.update('selectedDefaultRules', selectedRules);
      rulesProvider.refresh();
      updateDecorations();
    }),
    
    vscode.commands.registerCommand('copilotRules.toggleMemoryRule', (item: RuleItem) => {
      const selectedRules = context.globalState.get<string[]>('selectedMemoryRules', []);
      const rule = item.label.toString();
      
      if (item.checked) {
        // Rimuovi la regola dalla selezione
        const index = selectedRules.indexOf(rule);
        if (index !== -1) {
          selectedRules.splice(index, 1);
        }
      } else {
        // Aggiungi la regola alla selezione
        if (!selectedRules.includes(rule)) {
          selectedRules.push(rule);
        }
      }
      
      context.globalState.update('selectedMemoryRules', selectedRules);
      rulesProvider.refresh();
      updateDecorations();
    }),
    
    vscode.commands.registerCommand('copilotRules.enableMemoryRules', () => {
      rulesProvider.setMemoryRulesEnabled(true);
      vscode.window.showInformationMessage('Regole della memoria abilitate.');
    }),
    
    vscode.commands.registerCommand('copilotRules.addTemplateRule', (item: RuleItem) => {
      const rule = item.label.toString();
      const personalRules = context.globalState.get<string>('personalRules', '');
      const updatedRules = personalRules ? personalRules + '\n' + rule : rule;
      context.globalState.update('personalRules', updatedRules);
      rulesProvider.refresh();
      vscode.window.showInformationMessage(`Regola "${rule}" aggiunta alle regole personali.`);
    }),
    
    // Registra il comando per aprire l'editor visuale avanzato
    vscode.commands.registerCommand('copilotRules.openAdvancedRulesEditor', () => {
      openAdvancedRulesEditor(context, rulesProvider);
    })
  );
  
  // Registra il TreeDataProvider per la visualizzazione delle regole
  vscode.window.registerTreeDataProvider('copilotRulesView', rulesProvider);
  
  // Gestisci cambiamenti all'editor attivo
  vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
      triggerUpdateDecorations();
    }
  }, null, context.subscriptions);
  
  // Gestisci cambiamenti al contenuto del documento
  vscode.workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document) {
      triggerUpdateDecorations();
    }
  }, null, context.subscriptions);
}

// Funzione utility per fare l'escape dei caratteri speciali nelle regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deactivate() {}
