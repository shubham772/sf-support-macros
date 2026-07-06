/**
 * Security utilities for input validation and safe CLI argument handling.
 * All validation runs locally — no data leaves the machine.
 */

/** Salesforce record ID: 15 or 18 alphanumeric characters. */
export const SF_RECORD_ID_REGEX = /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/;

/** Valid Apex identifier for variable names. */
export const APEX_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** Valid Apex class name derived from filenames. */
export const APEX_CLASS_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validates a Salesforce record ID.
 * Returns the trimmed ID on success, or undefined if invalid.
 */
export function validateSalesforceId(input: string): string | undefined {
	const trimmed = input.trim();
	return SF_RECORD_ID_REGEX.test(trimmed) ? trimmed : undefined;
}

/**
 * Validates an Apex identifier (variable or class name).
 */
export function validateApexIdentifier(input: string): string | undefined {
	const trimmed = input.trim();
	return APEX_IDENTIFIER_REGEX.test(trimmed) ? trimmed : undefined;
}

/**
 * Wraps a path or argument for safe use in shell commands.
 * Uses double quotes and escapes embedded quotes/backslashes.
 */
export function shellQuote(value: string): string {
	return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Builds a safe sf CLI command string from a base command and validated arguments.
 * Each argument is individually quoted — never interpolate raw user input.
 */
export function buildSfCommand(base: string, args: string[]): string {
	const quotedArgs = args.map(shellQuote).join(' ');
	return `${base} ${quotedArgs}`.trim();
}

/**
 * Derives object API name from a 15/18-char Salesforce ID prefix (first 3 chars).
 * Returns undefined for unknown prefixes — caller should fall back to generic query.
 */
export function objectHintFromId(recordId: string): string | undefined {
	const prefix = recordId.substring(0, 3);
	const prefixMap: Record<string, string> = {
		'001': 'Account',
		'003': 'Contact',
		'006': 'Opportunity',
		'500': 'Case',
		'00Q': 'Lead',
		'005': 'User',
		'00G': 'Group',
	};
	return prefixMap[prefix];
}
