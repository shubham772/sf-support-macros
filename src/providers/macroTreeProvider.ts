import * as vscode from 'vscode';
import {
	MACRO_REGISTRY,
	getMacroById,
} from '../macros/macroRegistry';
import {
	MACRO_CATEGORIES,
	MacroCategory,
	MacroDefinition,
} from '../types/macro';

/** Tree item kinds for the sidebar hierarchy. */
enum TreeItemType {
	Category,
	Macro,
}

/** Single node in the Salesforce Support Macros tree view. */
export class MacroTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly itemType: TreeItemType,
		public readonly macro?: MacroDefinition,
	) {
		super(label, collapsibleState);

		if (itemType === TreeItemType.Category) {
			this.contextValue = 'macroCategory';
			this.iconPath = new vscode.ThemeIcon('folder');
		} else if (macro) {
			this.contextValue = 'macroItem';
			this.description = macro.description;
			this.tooltip = macro.tooltip ?? macro.description;
			this.iconPath = iconForMode(macro.mode);
			this.command = {
				command: 'sf-support-macros.executeMacro',
				title: macro.label,
				arguments: [macro.id],
			};
		}
	}
}

function iconForMode(mode: MacroDefinition['mode']): vscode.ThemeIcon {
	switch (mode) {
		case 'insert':
			return new vscode.ThemeIcon('file-code');
		case 'terminal':
			return new vscode.ThemeIcon('terminal');
		case 'prompt':
			return new vscode.ThemeIcon('question');
		default:
			return new vscode.ThemeIcon('symbol-event');
	}
}

/**
 * TreeDataProvider that renders macro categories and their child items.
 * Data is sourced entirely from the local MACRO_REGISTRY — no network calls.
 */
export class MacroTreeProvider
	implements vscode.TreeDataProvider<MacroTreeItem>
{
	private _onDidChangeTreeData = new vscode.EventEmitter<
		MacroTreeItem | undefined
	>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: MacroTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: MacroTreeItem): MacroTreeItem[] {
		if (!element) {
			// Root: return static categories first, then any dynamic categories from catalog
			const dynamicCategories = Array.from(
				new Set(MACRO_REGISTRY.map((m) => m.category)),
			);
			const categories = Array.from(
				new Set([...MACRO_CATEGORIES, ...dynamicCategories]),
			);

			return categories.map(
				(category) =>
					new MacroTreeItem(
						category,
						vscode.TreeItemCollapsibleState.Expanded,
						TreeItemType.Category,
					),
			);
		}

		if (element.itemType === TreeItemType.Category) {
			const category = element.label as MacroCategory;
			return MACRO_REGISTRY.filter((m) => m.category === category).map(
				(macro) =>
					new MacroTreeItem(
						macro.label,
						vscode.TreeItemCollapsibleState.None,
						TreeItemType.Macro,
						macro,
					),
			);
		}

		return [];
	}
}

/** Resolves a macro id from a tree item for context-menu commands. */
export function getMacroIdFromTreeItem(
	item: MacroTreeItem,
): string | undefined {
	return item.macro?.id;
}

export { getMacroById };
