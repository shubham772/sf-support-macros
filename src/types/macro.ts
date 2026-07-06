/** Execution mode for a macro item in the sidebar tree. */
export enum MacroExecutionMode {
	Insert = 'insert',
	Terminal = 'terminal',
	Prompt = 'prompt',
}

/** Static definition rendered in the categorized tree view. */
export interface MacroDefinition {
	id: string;
	label: string;
	description: string;
	category: MacroCategory;
	mode: MacroExecutionMode;
	tooltip?: string;
}

export type MacroCategory = string;

export const MACRO_CATEGORIES: string[] = [
	'Apex & LWC',
	'Debugging',
	'Deployment & CLI',
	'Data Operations',
];
