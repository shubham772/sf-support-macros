import * as vscode from 'vscode';
import * as path from 'path';
import {
	validateSalesforceId,
	validateApexIdentifier,
	buildSfCommand,
	objectHintFromId,
	APEX_CLASS_NAME_REGEX,
} from '../security/inputValidation';

// ── Shared editor helpers ───────────────────────────────────────────────────

/** Returns the active editor or shows a warning and returns undefined. */
function requireActiveEditor(): vscode.TextEditor | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage(
			'Salesforce Support Macros: Open a text editor first.',
		);
	}
	return editor;
}

/** Inserts text at the current cursor position. */
async function insertAtCursor(text: string): Promise<void> {
	const editor = requireActiveEditor();
	if (!editor) {
		return;
	}
	await editor.edit((builder) => {
		builder.insert(editor.selection.active, text);
	});
}

/** Replaces the current selection, or inserts at cursor if nothing is selected. */
async function replaceSelectionOrInsert(text: string): Promise<void> {
	const editor = requireActiveEditor();
	if (!editor) {
		return;
	}
	const { selection } = editor;
	await editor.edit((builder) => {
		if (selection.isEmpty) {
			builder.insert(selection.active, text);
		} else {
			builder.replace(selection, text);
		}
	});
}

/** Runs a validated sf CLI command in a dedicated integrated terminal. */
function runSfCommand(command: string, terminalName = 'Salesforce CLI'): void {
	const terminal =
		vscode.window.terminals.find((t) => t.name === terminalName) ??
		vscode.window.createTerminal(terminalName);
	terminal.show();
	terminal.sendText(command);
}

/** Derives a plausible Apex class name from the active file path. */
function getApexClassNameFromEditor(): string | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return undefined;
	}
	const baseName = path.basename(editor.document.fileName, '.cls');
	return APEX_CLASS_NAME_REGEX.test(baseName) ? baseName : undefined;
}

// ── Category A: Apex & LWC ──────────────────────────────────────────────────

export async function insertTryCatchLogging(): Promise<void> {
	const className = getApexClassNameFromEditor() ?? 'ClassName';
	const snippet = `
try {
    // TODO: Add logic here
} catch (Exception e) {
    System.debug(LoggingLevel.ERROR,
        '${className}.methodName' +
        ' | Message: ' + e.getMessage() +
        ' | Stack: ' + e.getStackTraceString()
    );
    throw e;
}`.trimStart();
	await insertAtCursor(snippet);
}

export async function insertApexTestMethod(): Promise<void> {
	const snippet = `
@isTest
static void testMethodName() {
    // Arrange
    Test.startTest();

    // Act
    // TODO: invoke code under test

    Test.stopTest();

    // Assert
    System.assert(true, 'Expected outcome description');
}`.trimStart();
	await insertAtCursor(snippet);
}

export async function insertLwcWireBoilerplate(): Promise<void> {
	const snippet = `import { LightningElement, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
// import apexMethod from '@salesforce/apex/MyController.myMethod';
// import FIELD_NAME from '@salesforce/schema/ObjectName.FieldName';

export default class MyComponent extends LightningElement {
    @wire(getRecord, { recordId: '$recordId', fields: [/* FIELD_NAME */] })
    wiredRecord({ error, data }) {
        if (data) {
            // this.record = data;
        } else if (error) {
            // handle error locally — do not log PII to console in production
        }
    }
}
`;
	await insertAtCursor(snippet);
}

export async function insertSoqlForLoopWrapper(): Promise<void> {
	const editor = requireActiveEditor();
	if (!editor) {
		return;
	}

	const selected = editor.document.getText(editor.selection).trim();
	let result: string;

	if (selected) {
		// Wrap existing SOQL query in a heap-safe for-loop
		result = `for (SObject row : ${selected.startsWith('[') ? selected : `[${selected}]`}) {
    // Process row — avoid accumulating large collections in memory
}`;
	} else {
		result = `for (Account acc : [
    SELECT Id, Name
    FROM Account
    LIMIT 200
]) {
    // Process acc — batch DML outside the loop when possible
}`;
	}

	await replaceSelectionOrInsert(result);
}

// ── Category B: Debugging ───────────────────────────────────────────────────

export async function insertSmartSystemDebug(): Promise<void> {
	const editor = requireActiveEditor();
	if (!editor) {
		return;
	}

	const selected = editor.document.getText(editor.selection).trim();
	const variableName = validateApexIdentifier(selected);

	if (!variableName) {
		vscode.window.showWarningMessage(
			'Highlight a valid Apex variable name before running Smart System.debug.',
		);
		return;
	}

	const debugLine = `System.debug('### USER_DEBUG -> ${variableName}: ' + ${variableName});`;
	const insertPosition = new vscode.Position(
		editor.selection.active.line + 1,
		0,
	);

	await editor.edit((builder) => {
		builder.insert(insertPosition, debugLine + '\n');
	});
}

/**
 * Filters the active .log file in-memory to USER_DEBUG and exception lines.
 * Processing is local-only — nothing is written to disk or sent externally.
 */
export async function filterLogFile(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open a debug log file (.log) first.');
		return;
	}

	if (!editor.document.fileName.endsWith('.log')) {
		vscode.window.showWarningMessage(
			'Log Parser Filter works on .log files only.',
		);
		return;
	}

	const lines = editor.document.getText().split('\n');
	const filterPatterns = [
		/USER_DEBUG/,
		/\|EXCEPTION\|/,
		/\|FATAL_ERROR\|/,
		/\|ERROR\|/,
		/FATAL_ERROR/,
		/Exception raised/,
	];

	const filtered = lines.filter((line) =>
		filterPatterns.some((pattern) => pattern.test(line)),
	);

	if (filtered.length === 0) {
		vscode.window.showInformationMessage(
			'No USER_DEBUG or exception lines found in this log.',
		);
		return;
	}

	const doc = await vscode.workspace.openTextDocument({
		content: filtered.join('\n'),
		language: 'log',
	});
	await vscode.window.showTextDocument(doc, { preview: true });
	vscode.window.showInformationMessage(
		`Filtered log: ${filtered.length} relevant line(s) (local preview only).`,
	);
}

export async function insertBypassTriggerValidation(): Promise<void> {
	const snippet = `
// Bypass triggers/validation using hierarchical custom setting or custom permission
// Ensure your org has AutomationBypass__c (Hierarchy) or Bypass_Automation custom permission
if (!FeatureManagement.checkPermission('Bypass_Automation')) {
    // Normal trigger/validation logic
} else {
    System.debug(LoggingLevel.FINE, 'Automation bypass active — skipping trigger logic.');
    return;
}

// Alternative: hierarchical custom setting check
// if (MySettings__c.getInstance().BypassTriggers__c) { return; }
`.trimStart();
	await insertAtCursor(snippet);
}

// ── Category C: Deployment & CLI ────────────────────────────────────────────

export async function quickDeployCurrentFile(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open the file you want to deploy first.');
		return;
	}

	const filePath = editor.document.uri.fsPath;
	const command = buildSfCommand('sf project deploy start --source-dir', [
		filePath,
	]);
	runSfCommand(command);
}

export async function runCurrentTestClass(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an Apex test class (.cls) first.');
		return;
	}

	if (!editor.document.fileName.endsWith('.cls')) {
		vscode.window.showWarningMessage('Active file is not an Apex class (.cls).');
		return;
	}

	const content = editor.document.getText();
	if (!/@isTest/i.test(content)) {
		vscode.window.showWarningMessage(
			'Active file does not appear to be a test class (@isTest not found).',
		);
		return;
	}

	const className = getApexClassNameFromEditor();
	if (!className) {
		vscode.window.showWarningMessage('Could not derive a valid Apex class name.');
		return;
	}

	const command = buildSfCommand(
		'sf apex run test --class-names',
		[className, '--result-format', 'human'],
	);
	runSfCommand(command);
}

export async function openCurrentOrg(): Promise<void> {
	runSfCommand('sf org open');
}

export async function hardRefreshOrgOpen(): Promise<void> {
	const command = buildSfCommand('sf org open --path', [
		'lightning/setup/LayoutPreferences/home',
	]);
	runSfCommand(command);
}

// ── Category D: Data Operations ─────────────────────────────────────────────

export async function quickRecordIdSearch(): Promise<void> {
	const rawInput = await vscode.window.showInputBox({
		title: 'Quick Record ID Search',
		prompt: 'Enter a 15 or 18-character Salesforce Record ID',
		placeHolder: '001XXXXXXXXXXXXXXX',
		validateInput: (value) => {
			if (!value.trim()) {
				return 'Record ID is required.';
			}
			if (!validateSalesforceId(value)) {
				return 'Invalid Salesforce ID. Use 15 or 18 alphanumeric characters only.';
			}
			return undefined;
		},
	});

	if (!rawInput) {
		return;
	}

	const recordId = validateSalesforceId(rawInput)!;

	const action = await vscode.window.showQuickPick(
		[
			{ label: 'Open in Browser', description: 'sf org open --path /<id>' },
			{ label: 'Insert SOQL Query', description: 'Insert SELECT query at cursor' },
		],
		{ title: 'Record ID Action', placeHolder: 'Choose an action' },
	);

	if (!action) {
		return;
	}

	if (action.label === 'Open in Browser') {
		const command = buildSfCommand('sf org open --path', [`/${recordId}`]);
		runSfCommand(command);
		return;
	}

	const objectName = objectHintFromId(recordId) ?? 'SObject';
	const soql = `SELECT Id, Name FROM ${objectName} WHERE Id = '${recordId}' LIMIT 1`;
	await insertAtCursor(soql);
}

export async function insertMockDataGenerator(): Promise<void> {
	const snippet = `
// Mock test data — use in @isTest methods or sandbox only
Account testAccount = new Account(
    Name = 'Test Account ' + System.now().getTime()
);
insert testAccount;

Contact testContact = new Contact(
    FirstName = 'Test',
    LastName = 'Contact',
    AccountId = testAccount.Id
);
insert testContact;

Opportunity testOpp = new Opportunity(
    Name = 'Test Opportunity',
    StageName = 'Prospecting',
    CloseDate = Date.today().addDays(30),
    AccountId = testAccount.Id
);
insert testOpp;
`.trimStart();
	await insertAtCursor(snippet);
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

/** Maps macro id → handler function. */
export const MACRO_HANDLERS: Record<string, () => Promise<void>> = {
	tryCatchLogging: insertTryCatchLogging,
	apexTestMethod: insertApexTestMethod,
	lwcWireBoilerplate: insertLwcWireBoilerplate,
	soqlForLoopWrapper: insertSoqlForLoopWrapper,
	smartSystemDebug: insertSmartSystemDebug,
	logParserFilter: filterLogFile,
	bypassTriggerValidation: insertBypassTriggerValidation,
	quickDeployCurrentFile: quickDeployCurrentFile,
	runCurrentTestClass: runCurrentTestClass,
	openCurrentOrg: openCurrentOrg,
	hardRefreshOrgOpen: hardRefreshOrgOpen,
	quickRecordIdSearch: quickRecordIdSearch,
	mockDataGenerator: insertMockDataGenerator,
};

// --- Dynamic support macros from external catalog -----------------------
import { SUPPORT_MACROS_CATALOG } from './macrosCatalog';

/** Open the macro code in a new untitled Apex editor for review/execution. */
async function openMacroCodeInEditor(code: string, label?: string): Promise<void> {
	const doc = await vscode.workspace.openTextDocument({
		content: code,
		language: 'apex',
	});
	await vscode.window.showTextDocument(doc, { preview: false });
	if (label) {
		vscode.window.showInformationMessage(`Opened macro: ${label}`);
	}
}

if (SUPPORT_MACROS_CATALOG && Array.isArray(SUPPORT_MACROS_CATALOG.categories)) {
	for (const cat of SUPPORT_MACROS_CATALOG.categories as any[]) {
		for (const m of cat.macros as any[]) {
			// Use bracket notation because some ids include hyphens
			MACRO_HANDLERS[m.id] = async () => {
				await openMacroCodeInEditor(m.code, m.label);
			};
		}
	}
} else {
	// defensive: nothing to register if catalog missing
}
