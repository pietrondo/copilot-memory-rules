// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
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
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
