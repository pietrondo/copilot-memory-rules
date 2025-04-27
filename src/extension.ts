// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class CopilotRulesProvider implements vscode.TreeDataProvider<RuleItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<RuleItem | undefined | void> = new vscode.EventEmitter<RuleItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<RuleItem | undefined | void> = this._onDidChangeTreeData.event;

  private context: vscode.ExtensionContext;
  private defaultRules: string[] = [
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
  private memoryRules: string[] = [
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

  getChildren(element?: RuleItem): Thenable<RuleItem[]> {
    if (!element) {
      return Promise.resolve([
        new RuleItem('Regole di default', vscode.TreeItemCollapsibleState.Expanded, 'default'),
        new RuleItem('Regole personali', vscode.TreeItemCollapsibleState.Expanded, 'personal'),
        new RuleItem('Regole della memoria', vscode.TreeItemCollapsibleState.Expanded, 'memory')
      ]);
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
  public type: 'default' | 'personal' | 'defaultRule' | 'personalRule' | 'memory' | 'memoryRule' | 'enableMemory' | 'createMemoryFiles' | 'disableMemory';
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    type: 'default' | 'personal' | 'defaultRule' | 'personalRule' | 'memory' | 'memoryRule' | 'enableMemory' | 'createMemoryFiles' | 'disableMemory',
    checked: boolean = false,
    editable: boolean = false,
    isEnableMemoryOption: boolean = false,
    isCreateMemoryFilesOption: boolean = false,
    isDisableMemoryOption: boolean = false
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

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.toggleDefaultRule', (rule: string) => {
    const selected = context.globalState.get<string[]>('selectedDefaultRules', []);
    const idx = selected.indexOf(rule);
    if (idx === -1) selected.push(rule); else selected.splice(idx, 1);
    context.globalState.update('selectedDefaultRules', selected);
    rulesProvider.refresh();
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

  const standardRules = `# Copilot Rules\n\n- Fornisci sempre un contesto ad alto livello all’inizio del file o della funzione.\n- Scrivi istruzioni dettagliate e specifiche nei commenti per guidare Copilot.\n- Usa nomi di variabili e funzioni chiari e descrittivi.\n- Segui le convenzioni di stile e le best practice del linguaggio.\n- Aggiungi esempi di input/output o casi d’uso nei commenti quando utile.\n- Preferisci soluzioni semplici, sicure e facilmente manutenibili.\n- Se il codice è complesso, aggiungi spiegazioni dettagliate nei commenti.\n- Non proporre codice che includa dati sensibili o credenziali.\n- Itera e affina le istruzioni in base ai risultati ottenuti.\n- Documenta e condividi le istruzioni efficaci con il team.\n\n*Modifica queste regole secondo le tue esigenze.*`;

  const createStandardRulesCommand = vscode.commands.registerCommand('copilot-rules-injector.createStandardCopilotRules', async () => {
    const wsFolders = vscode.workspace.workspaceFolders;
    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage('Nessuna cartella di progetto aperta.');
      return;
    }
    const rootPath = wsFolders[0].uri.fsPath;
    const filePath = vscode.Uri.file(`${rootPath}/copilot-rules.md`);
    try {
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(standardRules, 'utf8'));
      vscode.window.showInformationMessage('File copilot-rules.md (regole standard) creato/aggiornato nella root del progetto.');
    } catch (err) {
      vscode.window.showErrorMessage('Errore nella creazione del file copilot-rules.md: ' + err);
    }
  });

  context.subscriptions.push(createStandardRulesCommand);

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.createMemoryFiles', async () => {
    const wsFolders = vscode.workspace.workspaceFolders;
    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage('Nessuna cartella di progetto aperta.');
      return;
    }
    const rootPath = wsFolders[0].uri.fsPath;
    // README.md
    const readmePath = vscode.Uri.file(`${rootPath}/README.md`);
    const statusPath = vscode.Uri.file(`${rootPath}/STATUS.md`);
    // Contenuto base README
    const readmeContent = `# Regole del progetto\n\nQui vengono raccolte le regole e le linee guida del progetto.\n\nAggiorna questo file per mantenere la memoria storica e il contesto per Copilot e il team.`;
    // Contenuto base STATUS
    const statusContent = `# Stato del progetto\n\n- Data: ${new Date().toISOString().slice(0, 10)}\n- Progresso: Inizia a tracciare qui le decisioni, i cambiamenti e i progressi principali.\n`;
    try {
      await vscode.workspace.fs.writeFile(readmePath, Buffer.from(readmeContent, 'utf8'));
      await vscode.workspace.fs.writeFile(statusPath, Buffer.from(statusContent, 'utf8'));
      vscode.window.showInformationMessage('README.md e STATUS.md creati/aggiornati nella root del progetto.');
    } catch (err) {
      vscode.window.showErrorMessage('Errore nella creazione dei file README.md o STATUS.md: ' + err);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('copilot-rules-injector.injectSelectedRules', async () => {
    // Recupera le regole selezionate
    const selectedDefault = context.globalState.get<string[]>('selectedDefaultRules', []);
    const selectedMemory = context.globalState.get<boolean>('enableMemoryRules', false)
      ? context.globalState.get<string[]>('selectedMemoryRules', [])
      : [];
    const personalRules = context.globalState.get<string>('personalRules', '').split(/\r?\n/).filter(r => r.trim().length > 0);

    // Unisci tutte le regole selezionate
    const allRules = [
      ...selectedDefault.map(r => ({ label: r, picked: true })),
      ...selectedMemory.map(r => ({ label: r, picked: true })),
      ...personalRules.map(r => ({ label: r, picked: true }))
    ];
    if (allRules.length === 0) {
      vscode.window.showWarningMessage('Nessuna regola selezionata da iniettare.');
      return;
    }
    // Mostra quick pick per selezionare quali regole iniettare
    const picked = await vscode.window.showQuickPick(allRules, {
      canPickMany: true,
      placeHolder: 'Seleziona le regole da iniettare nel file copilot-rules.md'
    });
    if (!picked || picked.length === 0) {
      vscode.window.showInformationMessage('Nessuna regola iniettata.');
      return;
    }
    // Scrivi le regole selezionate nel file copilot-rules.md
    const wsFolders = vscode.workspace.workspaceFolders;
    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage('Nessuna cartella di progetto aperta.');
      return;
    }
    const rootPath = wsFolders[0].uri.fsPath;
    const filePath = vscode.Uri.file(`${rootPath}/copilot-rules.md`);
    const content = '# Copilot Rules\n\n' + picked.map(r => `- ${r.label}`).join('\n');
    try {
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(content, 'utf8'));
      vscode.window.showInformationMessage('Regole selezionate iniettate in copilot-rules.md!');
    } catch (err) {
      vscode.window.showErrorMessage('Errore nella scrittura del file copilot-rules.md: ' + err);
    }
  }));

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
