// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Template di regole per linguaggi/framework (deve essere dichiarato PRIMA della classe CopilotRulesProvider)
const languageTemplates: Record<string, string[]> = {
  'JavaScript': [
    'Usa sempre let/const invece di var.',
    'Segui la convenzione camelCase per nomi di variabili e funzioni.',
    'Aggiungi JSDoc ai metodi pubblici.',
    'Evita callback annidate, preferisci async/await o Promises.',
    'Non lasciare mai console.log nel codice di produzione.'
  ],
  'Python': [
    'Segui la convenzione PEP8 per nomi e stile.',
    'Usa docstring per funzioni e classi.',
    'Evita import wildcard (from module import *).',
    'Gestisci le eccezioni in modo esplicito.',
    'Usa type hinting dove possibile.'
  ],
  'TypeScript': [
    'Tipizza sempre parametri e ritorni delle funzioni.',
    'Evita l’uso di any se non strettamente necessario.',
    'Usa interfacce per strutturare i dati.',
    'Preferisci const per variabili che non cambiano.',
    'Aggiungi commenti per spiegare tipi complessi.'
  ],
  'React': [
    'Usa PascalCase per i nomi dei componenti (es: MyComponent).',
    'Ogni componente deve avere una sola responsabilità (Single Responsibility Principle).',
    'Estrai la logica riutilizzabile in custom hook.',
    'Usa CSS Modules per lo stile, posizionando il file nella stessa cartella del componente.',
    'Tutti i componenti devono avere test che ne verifichino il rendering corretto.',
    'Evita componenti troppo grandi: suddividili in componenti più piccoli.',
    'Usa PropTypes o TypeScript per tipizzare le props.',
    'Non lasciare codice morto o non usato nei componenti.'
  ],
  'Node.js': [
    'Usa sempre const/let invece di var.',
    'Gestisci gli errori in modo esplicito (try/catch o callback err).',
    'Non esporre mai dati sensibili nei log.',
    'Organizza il codice in moduli chiari e riutilizzabili.',
    'Usa async/await per la gestione delle operazioni asincrone.',
    'Valida sempre l’input dell’utente.',
    'Documenta le API con JSDoc o strumenti simili.'
  ],
  'Django': [
    'Segui la convenzione PEP8 per nomi e stile.',
    'Usa i modelli Django per la gestione dei dati.',
    'Non scrivere logica di business nelle view, usa i servizi.',
    'Proteggi le view con decoratori di autenticazione/autorizzazione.',
    'Usa i form Django per la validazione dell’input.',
    'Scrivi test per ogni view e modello.',
    'Configura correttamente le impostazioni di sicurezza (SECRET_KEY, DEBUG, ALLOWED_HOSTS, ecc.).'
  ],
  'Flask': [
    'Segui la convenzione PEP8 per nomi e stile.',
    'Usa blueprint per organizzare le route.',
    'Non scrivere logica di business nelle view, usa servizi o moduli separati.',
    'Valida sempre l’input dell’utente.',
    'Gestisci le eccezioni e mostra messaggi di errore chiari.',
    'Configura correttamente le variabili di ambiente e le chiavi segrete.',
    'Scrivi test per ogni endpoint e funzionalità.',
    'Usa requirements.txt per gestire le dipendenze.'
  ]
};

class CopilotRulesProvider implements vscode.TreeDataProvider<RuleItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<RuleItem | undefined | void> = new vscode.EventEmitter<RuleItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<RuleItem | undefined | void> = this._onDidChangeTreeData.event;

  private context: vscode.ExtensionContext;
  public defaultRules: string[] = [
    'Fornisci sempre un contesto ad alto livello all’inizio del file o della funzione.',
    'Scrivi istruzioni dettagliate e specifiche nei commenti per guidare Copilot.',
    'Usa nomi di variabili e funzioni chiari e descrittivi.',
    'Segui le convenzioni di stile e le best practice del linguaggio.',
    'Aggiungi esempi di input/output o casi d’uso nei commenti quando utile.',
    'Preferisci soluzioni semplici, sicure e facilmente manutenibili.',
    'Se il codice è complesso, aggiungi spiegazioni dettagliate nei commenti.',
    'Non proporre codice che includa dati sensibili o credenziali.',
    'Itera e affina le istruzioni in base ai risultati ottenuti.',
    'Documenta e condividi le istruzioni efficaci con il team.'
  ];
  public memoryRules: string[] = [
    'Crea e mantieni un file README con le linee guida e le regole del progetto.',
    'Crea un file STATUS.md per tracciare i progressi, le decisioni e le modifiche importanti.',
    'Aggiorna regolarmente questi file per fornire contesto sia agli sviluppatori che agli strumenti AI.',
    'Usa questi file come riferimento per Copilot e per la revisione del codice.'
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
      return Promise.resolve([
        new RuleItem('Regole di default', vscode.TreeItemCollapsibleState.Expanded, 'default'),
        new RuleItem('Regole personali', vscode.TreeItemCollapsibleState.Expanded, 'personal'),
        new RuleItem('Regole della memoria', vscode.TreeItemCollapsibleState.Expanded, 'memory'),
        new RuleItem('Template di regole', vscode.TreeItemCollapsibleState.Expanded, 'template')
      ]);
    }
    if (element && element.type === 'template') {
      // Aggiungi pulsante per aprire l'editor visuale delle regole
      return Promise.resolve([
        ...Object.entries(languageTemplates).map(([lang]) =>
          new RuleItem(lang, vscode.TreeItemCollapsibleState.Collapsed, 'templateGroup')
        ),
        new RuleItem('Apri editor visuale regole', vscode.TreeItemCollapsibleState.None, 'openRulesEditorButton')
      ]);
    }
    if (element && element.type === 'templateGroup') {
      const lang = typeof element.label === 'string' ? element.label : String(element.label);
      const rules = languageTemplates[lang] || [];
      return Promise.resolve(rules.map((rule: string) =>
        new RuleItem(rule, vscode.TreeItemCollapsibleState.None, 'templateRule', false, false, false, false, false, lang)
      ));
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
          new RuleItem('Abilita le regole della memoria', vscode.TreeItemCollapsibleState.None, 'enableMemory', false, false, true),
        ]);
      }
      const selected = this.context.globalState.get<string[]>('selectedMemoryRules', []);
      return Promise.resolve([
        ...this.memoryRules.map(rule => {
          const checked = selected.includes(rule);
          return new RuleItem(rule, vscode.TreeItemCollapsibleState.None, 'memoryRule', checked);
        }),
        new RuleItem('Crea/aggiorna README.md e STATUS.md', vscode.TreeItemCollapsibleState.None, 'createMemoryFiles', false, false, false, true),
        new RuleItem('Disabilita le regole della memoria', vscode.TreeItemCollapsibleState.None, 'disableMemory', false, false, false, false, true)
      ]);
    }
    return Promise.resolve([]);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class RuleItem extends vscode.TreeItem {
  public type: 'default' | 'personal' | 'defaultRule' | 'personalRule' | 'memory' | 'memoryRule' | 'enableMemory' | 'createMemoryFiles' | 'disableMemory' | 'template' | 'templateGroup' | 'templateRule' | 'openRulesEditorButton';
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    type: 'default' | 'personal' | 'defaultRule' | 'personalRule' | 'memory' | 'memoryRule' | 'enableMemory' | 'createMemoryFiles' | 'disableMemory' | 'template' | 'templateGroup' | 'templateRule' | 'openRulesEditorButton',
    checked: boolean = false,
    editable: boolean = false,
    isEnableMemoryOption: boolean = false,
    isCreateMemoryFilesOption: boolean = false,
    isDisableMemoryOption: boolean = false,
    templateLang?: string
  ) {
    super(label, collapsibleState);
    this.type = type;
    if (type === 'defaultRule') {
      this.contextValue = checked ? 'checkedDefaultRule' : 'uncheckedDefaultRule';
      this.iconPath = new vscode.ThemeIcon(checked ? 'check' : 'circle-outline');
      this.command = {
        command: 'copilot-rules-injector.toggleDefaultRule',
        title: 'Seleziona/Deseleziona regola',
        arguments: [label]
      };
    }
    if (type === 'memoryRule') {
      this.contextValue = checked ? 'checkedMemoryRule' : 'uncheckedMemoryRule';
      this.iconPath = new vscode.ThemeIcon(checked ? 'check' : 'circle-outline');
      this.command = {
        command: 'copilot-rules-injector.toggleMemoryRule',
        title: 'Seleziona/Deseleziona regola memoria',
        arguments: [label]
      };
    }
    if (type === 'enableMemory' && isEnableMemoryOption) {
      this.contextValue = 'enableMemoryOption';
      this.iconPath = new vscode.ThemeIcon('add');
      this.command = {
        command: 'copilot-rules-injector.enableMemoryRules',
        title: 'Abilita regole della memoria'
      };
    }
    if (type === 'personalRule' && editable) {
      this.contextValue = 'editablePersonalRule';
      this.command = {
        command: 'copilot-rules-injector.editPersonalRules',
        title: 'Modifica regole personali'
      };
    }
    if (type === 'createMemoryFiles' && isCreateMemoryFilesOption) {
      this.contextValue = 'createMemoryFilesOption';
      this.iconPath = new vscode.ThemeIcon('new-file');
      this.command = {
        command: 'copilot-rules-injector.createMemoryFiles',
        title: 'Crea/aggiorna README.md e STATUS.md'
      };
    }
    if (type === 'disableMemory' && isDisableMemoryOption) {
      this.contextValue = 'disableMemoryOption';
      this.iconPath = new vscode.ThemeIcon('circle-slash');
      this.command = {
        command: 'copilot-rules-injector.disableMemoryRules',
        title: 'Disabilita regole della memoria'
      };
    }
    if (type === 'templateRule' && templateLang) {
      this.contextValue = 'templateRule';
      this.iconPath = new vscode.ThemeIcon('lightbulb');
      this.command = {
        command: 'copilot-rules-injector.addSingleTemplateRule',
        title: 'Aggiungi questa regola ai tuoi template personali',
        arguments: [label, templateLang]
      };
    }
    if (type === 'openRulesEditorButton') {
      this.contextValue = 'openRulesEditorButton';
      this.iconPath = new vscode.ThemeIcon('edit');
      this.command = {
        command: 'copilot-rules-injector.openRulesEditor',
        title: 'Apri editor visuale regole'
      };
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "copilot-rules-injector" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('copilot-rules-injector.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from Copilot Rules Injector!');
  });

  const rulesProvider = new CopilotRulesProvider(context);
  vscode.window.registerTreeDataProvider('copilotRulesView', rulesProvider);

  // Funzione per salvare tutte le regole selezionate nel file .github/copilot-instructions.md
  async function saveAllRulesToCopilotInstructions() {
    const wsFolders = vscode.workspace.workspaceFolders;
    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage('Nessuna cartella di progetto aperta.');
      return;
    }
    
    const rootPath = wsFolders[0].uri.fsPath;
    const githubFolder = vscode.Uri.file(`${rootPath}/.github`);
    const instructionsFile = vscode.Uri.file(`${rootPath}/.github/copilot-instructions.md`);
    
    try {
      // Crea cartella .github se non esiste
      try {
        await vscode.workspace.fs.stat(githubFolder);
      } catch {
        await vscode.workspace.fs.createDirectory(githubFolder);
      }
      
      // Raccogli tutte le regole selezionate
      const selectedDefaultRules = context.globalState.get<string[]>('selectedDefaultRules', []);
      const memoryRulesEnabled = context.globalState.get<boolean>('enableMemoryRules', false);
      const selectedMemoryRules = memoryRulesEnabled ? context.globalState.get<string[]>('selectedMemoryRules', []) : [];
      const personalRules = context.globalState.get<string>('personalRules', '').split(/\r?\n/).filter(r => r.trim().length > 0);
      
      // Componi il contenuto del file
      let content = '# Regole Copilot\n\n';
      
      if (selectedDefaultRules.length > 0) {
        content += '## Regole di default\n\n';
        selectedDefaultRules.forEach(rule => {
          content += `- ${rule}\n`;
        });
        content += '\n';
      }
      
      if (selectedMemoryRules.length > 0) {
        content += '## Regole della memoria\n\n';
        selectedMemoryRules.forEach(rule => {
          content += `- ${rule}\n`;
        });
        content += '\n';
      }
      
      if (personalRules.length > 0) {
        content += '## Regole personali\n\n';
        personalRules.forEach(rule => {
          content += `- ${rule}\n`;
        });
      }
      
      // Scrivi il file
      await vscode.workspace.fs.writeFile(instructionsFile, Buffer.from(content, 'utf8'));
      vscode.window.showInformationMessage('Regole salvate con successo in .github/copilot-instructions.md!');
    } catch (err) {
      vscode.window.showErrorMessage(`Errore nella creazione del file .github/copilot-instructions.md: ${err}`);
    }
  }

  // Aggiorna i comandi esistenti per utilizzare la nuova funzione
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.injectSelectedRules', async () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Iniezione regole selezionate in corso...');
    try {
      // Salva tutte le regole nel file ufficiale di GitHub Copilot
      await saveAllRulesToCopilotInstructions();
    } catch (err) {
      vscode.window.showErrorMessage(`Errore nell'iniezione delle regole: ${err}`);
    }
  }));

  // Modifica il comando enableMemoryRules per usare il nuovo percorso
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.enableMemoryRules', async () => {
    // Abilita le regole in memoria
    rulesProvider.setMemoryRulesEnabled(true);
    
    // Salva tutte le regole nel file ufficiale di GitHub Copilot
    await saveAllRulesToCopilotInstructions();
  }));

  // Aggiungi un nuovo comando per salvare tutte le regole in .github/copilot-instructions.md
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.saveAllRules', async () => {
    await saveAllRulesToCopilotInstructions();
  }));

  // Modifica il comando toggleDefaultRule per aggiornare anche le regole nel file
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.toggleDefaultRule', async (rule: string) => {
    const selected = context.globalState.get<string[]>('selectedDefaultRules', []);
    const idx = selected.indexOf(rule);
    if (idx === -1) selected.push(rule); else selected.splice(idx, 1);
    await context.globalState.update('selectedDefaultRules', selected);
    rulesProvider.refresh();
    // Aggiorna il file con le nuove selezioni
    await saveAllRulesToCopilotInstructions();
  }));

  // Modifica il comando toggleMemoryRule per aggiornare anche le regole nel file
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.toggleMemoryRule', async (rule: string) => {
    const selected = context.globalState.get<string[]>('selectedMemoryRules', []);
    const idx = selected.indexOf(rule);
    if (idx === -1) {
      selected.push(rule);
    } else {
      selected.splice(idx, 1);
    }
    await context.globalState.update('selectedMemoryRules', selected);
    rulesProvider.refresh();
    // Aggiorna il file con le nuove selezioni
    await saveAllRulesToCopilotInstructions();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.addSingleTemplateRule', async (rule: string, lang: string) => {
    const current = context.globalState.get<string>('personalRules', '');
    const currentArr = current ? current.split(/\r?\n/) : [];
    if (!currentArr.includes(rule)) {
      currentArr.push(rule);
      await context.globalState.update('personalRules', currentArr.join('\n'));
      rulesProvider.refresh();
      vscode.window.showInformationMessage(`Regola aggiunta dalle ${lang} alle tue regole personali!`);
    } else {
      vscode.window.showInformationMessage('Questa regola è già presente tra le tue regole personali.');
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.editPersonalRules', async () => {
    const current = context.globalState.get<string>('personalRules', '');
    const result = await vscode.window.showInputBox({
      value: current,
      prompt: 'Inserisci o modifica le tue regole personali (separate da una nuova riga)',
      placeHolder: 'Scrivi qui le tue regole personali...'
    });
    if (result !== undefined) {
      context.globalState.update('personalRules', result);
      rulesProvider.refresh();
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.addTemplateRules', async () => {
    const langs = Object.keys(languageTemplates);
    const pickedLang = await vscode.window.showQuickPick(langs, { placeHolder: 'Scegli un template di regole da aggiungere' });
    if (!pickedLang) return;
    const rules = languageTemplates[pickedLang];
    // Aggiungi le regole selezionate a quelle personali
    const current = context.globalState.get<string>('personalRules', '');
    const currentArr = current ? current.split(/\r?\n/) : [];
    const newArr = [...currentArr, ...rules.filter(r => !currentArr.includes(r))];
    await context.globalState.update('personalRules', newArr.join('\n'));
    rulesProvider.refresh();
    vscode.window.showInformationMessage(`Regole ${pickedLang} aggiunte alle tue regole personali!`);
  }));

  // Esportazione regole selezionate
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.exportRules', async () => {
    const selectedDefault = context.globalState.get<string[]>('selectedDefaultRules', []);
    const selectedMemory = context.globalState.get<boolean>('enableMemoryRules', false)
      ? context.globalState.get<string[]>('selectedMemoryRules', [])
      : [];
    const personalRules = context.globalState.get<string>('personalRules', '').split(/\r?\n/).filter(r => r.trim().length > 0);
    const allRules = [
      ...selectedDefault.map(r => ({ type: 'default', rule: r })),
      ...selectedMemory.map(r => ({ type: 'memory', rule: r })),
      ...personalRules.map(r => ({ type: 'personal', rule: r }))
    ];
    if (allRules.length === 0) {
      vscode.window.showWarningMessage('Nessuna regola da esportare.');
      return;
    }
    const uri = await vscode.window.showSaveDialog({
      filters: { 'JSON': ['json'] },
      saveLabel: 'Esporta regole selezionate'
    });
    if (!uri) return;
    await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(allRules, null, 2), 'utf8'));
    vscode.window.showInformationMessage('Regole esportate con successo!');
  }));

  // Importazione regole da file JSON
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.importRules', async () => {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { 'JSON': ['json'] },
      openLabel: 'Importa regole'
    });
    if (!uris || uris.length === 0) return;
    const file = await vscode.workspace.fs.readFile(uris[0]);
    let imported: any[] = [];
    try {
      imported = JSON.parse(file.toString());
    } catch {
      vscode.window.showErrorMessage('File non valido.');
      return;
    }
    // Aggiungi le regole importate a quelle personali (evita duplicati)
    const personal = imported.filter(r => r.type === 'personal').map(r => r.rule);
    const current = context.globalState.get<string>('personalRules', '');
    const currentArr = current ? current.split(/\r?\n/) : [];
    const newArr = [...currentArr, ...personal.filter(r => !currentArr.includes(r))];
    await context.globalState.update('personalRules', newArr.join('\n'));
    rulesProvider.refresh();
    vscode.window.showInformationMessage('Regole personali importate con successo!');
  }));

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.openRulesEditor', () => {
    const panel = vscode.window.createWebviewPanel(
      'rulesEditor',
      'Editor Visuale Regole Copilot',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    // Recupera tutte le regole
    const defaultRules = rulesProvider.defaultRules;
    const memoryRules = rulesProvider.memoryRules;
    const personalRules = (context.globalState.get<string>('personalRules', '') || '').split(/\r?\n/).filter(r => r.trim().length > 0);
    // HTML base per la webview
    panel.webview.html = `
      <html><body>
        <h2>Regole di default</h2>
        <ul>
          ${defaultRules.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <h2>Regole della memoria</h2>
        <ul>
          ${memoryRules.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <h2>Regole personali</h2>
        <ul id="personalRules">
          ${personalRules.map((r, i) => `<li><input type="text" value="${r}" data-idx="${i}" /> <button data-del="${i}">Elimina</button></li>`).join('')}
        </ul>
        <button id="addRule">Aggiungi regola personale</button>
        <button id="save">Salva</button>
        <script>
          const vscode = acquireVsCodeApi();
          document.getElementById('addRule').onclick = () => {
            const ul = document.getElementById('personalRules');
            const li = document.createElement('li');
            li.innerHTML = '<input type="text" value="" data-idx="new" /> <button data-del="new">Elimina</button>';
            ul.appendChild(li);
          };
          document.getElementById('save').onclick = () => {
            const inputs = Array.from(document.querySelectorAll('#personalRules input'));
            const rules = inputs.map(i => i.value).filter(v => v.trim().length > 0);
            vscode.postMessage({ type: 'save', rules });
          };
          document.getElementById('personalRules').onclick = (e) => {
            if (e.target.tagName === 'BUTTON') {
              e.target.parentElement.remove();
            }
          };
        </script>
      </body></html>
    `;
    panel.webview.onDidReceiveMessage(msg => {
      if (msg.type === 'save') {
        context.globalState.update('personalRules', msg.rules.join('\n'));
        rulesProvider.refresh();
        vscode.window.showInformationMessage('Regole personali aggiornate!');
      }
    });
  }));

  // Suggerimenti dinamici (bozza):
  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.suggestRules', async () => {
    const suggestions: string[] = [];
    // Esempio: cerca uso di 'var' in file JS/TS
    const files = await vscode.workspace.findFiles('**/*.{js,ts}', '**/node_modules/**', 20);
    for (const file of files) {
      const doc = await vscode.workspace.openTextDocument(file);
      if (/\bvar\b/.test(doc.getText())) {
        suggestions.push("Evita l'uso di 'var', preferisci let/const.");
        break;
      }
    }
    // Esempio: cerca funzioni Python senza docstring
    const pyFiles = await vscode.workspace.findFiles('**/*.py', '**/venv/**', 20);
    for (const file of pyFiles) {
      const doc = await vscode.workspace.openTextDocument(file);
      if (/def [a-zA-Z0-9_]+\(.*\):\n(?!\s+""")/.test(doc.getText())) {
        suggestions.push('Aggiungi docstring alle funzioni Python.');
        break;
      }
    }
    if (suggestions.length === 0) {
      vscode.window.showInformationMessage('Nessun suggerimento di nuove regole trovato!');
      return;
    }
    const picked = await vscode.window.showQuickPick(suggestions, { canPickMany: true, placeHolder: 'Suggerimenti di regole da aggiungere' });
    if (picked && picked.length > 0) {
      const current = context.globalState.get<string>('personalRules', '');
      const currentArr = current ? current.split(/\r?\n/) : [];
      const newArr = [...currentArr, ...picked.filter(r => !currentArr.includes(r))];
      await context.globalState.update('personalRules', newArr.join('\n'));
      rulesProvider.refresh();
      vscode.window.showInformationMessage('Suggerimenti aggiunti alle regole personali!');
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.createMemoryFiles', async () => {
    const wsFolders = vscode.workspace.workspaceFolders;
    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage('Nessuna cartella di progetto aperta.');
      return;
    }
    const rootPath = wsFolders[0].uri.fsPath;
    const readmePath = vscode.Uri.file(`${rootPath}/README.md`);
    const statusPath = vscode.Uri.file(`${rootPath}/STATUS.md`);
    const readmeContent = `# Regole del progetto\n\nQui vengono raccolte le regole e le linee guida del progetto.\n\nAggiorna questo file per mantenere la memoria storica e il contesto per Copilot e il team.`;
    const statusContent = `# Stato del progetto\n\n- Data: ${new Date().toISOString().slice(0, 10)}\n- Progresso: Inizia a tracciare qui le decisioni, i cambiamenti e i progressi principali.\n`;
    try {
      await vscode.workspace.fs.writeFile(readmePath, Buffer.from(readmeContent, 'utf8'));
      await vscode.workspace.fs.writeFile(statusPath, Buffer.from(statusContent, 'utf8'));
      vscode.window.showInformationMessage('README.md e STATUS.md creati/aggiornati nella root del progetto.');
    } catch (err) {
      vscode.window.showErrorMessage('Errore nella creazione dei file README.md o STATUS.md: ' + err);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.disableMemoryRules', () => {
    rulesProvider.setMemoryRulesEnabled(false);
  }));

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
