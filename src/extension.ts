/**
 * Salesforce Support Macros — VS Code Extension Entry Point
 *
 * SECURITY POSTURE:
 * - Operates entirely locally (air-gapped). No telemetry, no external API calls.
 * - Relies on the user's local Salesforce CLI (sf) keychain auth — no credentials stored here.
 * - All user inputs are validated before use in templates or terminal commands.
 */

import * as vscode from 'vscode';
import {
	MacroTreeProvider,
	MacroTreeItem,
} from './providers/macroTreeProvider';
import { MACRO_REGISTRY, getMacroById } from './macros/macroRegistry';
import { MACRO_HANDLERS } from './macros/macroHandlers';

async function runMacroById(macroId: string): Promise<void> {
	const macro = getMacroById(macroId);
	if (!macro) {
		vscode.window.showErrorMessage(`Unknown macro: ${macroId}`);
		return;
	}

	const handler = MACRO_HANDLERS[macroId];
	if (!handler) {
		vscode.window.showErrorMessage(
			`No handler registered for macro: ${macro.label}`,
		);
		return;
	}

	try {
		await handler();
	} catch {
		vscode.window.showErrorMessage(
			`Macro "${macro.label}" failed. Check the active editor or terminal state.`,
		);
	}
}

export function activate(context: vscode.ExtensionContext): void {
	// ── Sidebar Tree View ───────────────────────────────────────────────────
	const treeProvider = new MacroTreeProvider();
	const treeView = vscode.window.createTreeView('sfSupportMacrosView', {
		treeDataProvider: treeProvider,
		showCollapseAll: true,
	});

	context.subscriptions.push(treeView);

	// ── Execute Macro (tree click, context menu, or generic invoke) ──────────
	const executeMacro = vscode.commands.registerCommand(
		'sf-support-macros.executeMacro',
		async (arg: string | MacroTreeItem) => {
			const macroId =
				typeof arg === 'string' ? arg : arg?.macro?.id;
			if (!macroId) {
				vscode.window.showWarningMessage(
					'Select a macro from the sidebar to run it.',
				);
				return;
			}
			await runMacroById(macroId);
		},
	);

	context.subscriptions.push(executeMacro);

	// ── Individual command-palette entries (one per macro) ─────────────────
	for (const macro of MACRO_REGISTRY) {
		const paletteCommand = vscode.commands.registerCommand(
			`sf-support-macros.executeMacro.${macro.id}`,
			() => runMacroById(macro.id),
		);
		context.subscriptions.push(paletteCommand);
	}

	// ── Refresh Tree ────────────────────────────────────────────────────────
	const refreshTree = vscode.commands.registerCommand(
		'sf-support-macros.refreshMacros',
		() => treeProvider.refresh(),
	);

	context.subscriptions.push(refreshTree);
}

export function deactivate(): void {
	// All disposables are managed via context.subscriptions — nothing to clean up.
}
