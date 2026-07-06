import { MacroDefinition, MacroExecutionMode } from '../types/macro';

/**
 * Central registry of all Salesforce Support Macros.
 * Add new macros here — the tree view and command palette pick them up automatically.
 */
export const MACRO_REGISTRY: MacroDefinition[] = [
	// ── Category A: Apex & LWC Development Speedups ──────────────────────────
	{
		id: 'tryCatchLogging',
		label: 'Try-Catch Block with Custom Logging',
		description: 'Insert Apex try-catch with System.debug stack trace logging',
		category: 'Apex & LWC',
		mode: MacroExecutionMode.Insert,
		tooltip: 'Inserts a standard try-catch block with class/method debug output',
	},
	{
		id: 'apexTestMethod',
		label: 'Apex Test Method Template',
		description: 'Insert @isTest method with startTest/stopTest and assert',
		category: 'Apex & LWC',
		mode: MacroExecutionMode.Insert,
	},
	{
		id: 'lwcWireBoilerplate',
		label: 'LWC Wire Service Boilerplate',
		description: 'Insert @wire adapter framework with imports',
		category: 'Apex & LWC',
		mode: MacroExecutionMode.Insert,
	},
	{
		id: 'soqlForLoopWrapper',
		label: 'SOQL For-Loop Wrapper',
		description: 'Wrap selection or insert heap-safe SOQL for-loop template',
		category: 'Apex & LWC',
		mode: MacroExecutionMode.Insert,
	},

	// ── Category B: Debugging & Troubleshooting ────────────────────────────
	{
		id: 'smartSystemDebug',
		label: 'Smart System.debug',
		description: 'Insert debug line for the highlighted variable',
		category: 'Debugging',
		mode: MacroExecutionMode.Insert,
	},
	{
		id: 'logParserFilter',
		label: 'Log Parser Filter (USER_DEBUG / Exceptions)',
		description: 'Filter open .log file to USER_DEBUG and exception lines',
		category: 'Debugging',
		mode: MacroExecutionMode.Insert,
	},
	{
		id: 'bypassTriggerValidation',
		label: 'Bypass Trigger/Validation Logic',
		description: 'Insert trigger bypass pattern using custom permission/setting',
		category: 'Debugging',
		mode: MacroExecutionMode.Insert,
	},

	// ── Category C: Salesforce CLI & Deployment ─────────────────────────────
	{
		id: 'quickDeployCurrentFile',
		label: 'Quick Deploy Current File',
		description: 'Deploy active file via sf project deploy start',
		category: 'Deployment & CLI',
		mode: MacroExecutionMode.Terminal,
	},
	{
		id: 'runCurrentTestClass',
		label: 'Run Current Test Class',
		description: 'Run sf apex run test for the active Apex test class',
		category: 'Deployment & CLI',
		mode: MacroExecutionMode.Terminal,
	},
	{
		id: 'openCurrentOrg',
		label: 'Open Current Org',
		description: 'Open default target org in browser',
		category: 'Deployment & CLI',
		mode: MacroExecutionMode.Terminal,
	},
	{
		id: 'hardRefreshOrgOpen',
		label: 'Hard Refresh / Clear Cache Org Open',
		description: 'Open org setup page to bypass browser cache issues',
		category: 'Deployment & CLI',
		mode: MacroExecutionMode.Terminal,
	},

	// ── Category D: Data Operations & Support ───────────────────────────────
	{
		id: 'quickRecordIdSearch',
		label: 'Quick Record ID Search',
		description: 'Validate ID and generate SOQL or open record in browser',
		category: 'Data Operations',
		mode: MacroExecutionMode.Prompt,
	},
	{
		id: 'mockDataGenerator',
		label: 'Mock Data Generator Snippet',
		description: 'Insert Apex block to create Account, Contact, Opportunity test data',
		category: 'Data Operations',
		mode: MacroExecutionMode.Insert,
	},
];

/** Lookup a macro by its stable id. */
export function getMacroById(id: string): MacroDefinition | undefined {
	return MACRO_REGISTRY.find((m) => m.id === id);
}
