# Salesforce Support Macros

A production-safe VS Code extension for Salesforce support and development teams. Provides a categorized sidebar of **Macros** — code snippets, CLI commands, and parameterized workflows — to reduce repetitive work and speed up debugging.

## Security posture

This extension is designed for teams working against **live Production orgs**:

- **Local-only operation** — no telemetry, no external API calls, no data transmission
- **No credential storage** — relies entirely on your local `sf` CLI keychain authentication
- **Input validation** — Salesforce IDs and Apex identifiers are regex-validated before use
- **Safe CLI invocation** — all terminal arguments are shell-quoted to prevent injection
- **In-memory log filtering** — debug log parsing never writes filtered content to disk

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/) 1.85+
- [Salesforce CLI (`sf`)](https://developer.salesforce.com/tools/salesforcecli) installed and authenticated locally

## Features

### Sidebar: Salesforce Support Macros

Click the cloud icon in the Activity Bar to open the categorized macro tree:

| Category | Macros |
|---|---|
| **Apex & LWC** | Try-Catch logging, Test method template, LWC @wire boilerplate, SOQL for-loop wrapper |
| **Debugging** | Smart System.debug, Log parser filter, Trigger bypass snippet |
| **Deployment & CLI** | Quick deploy, Run test class, Open org, Hard refresh org open |
| **Data Operations** | Record ID search, Mock data generator |

### Execution modes

- **Insert** — inserts code at the cursor in the active editor
- **Terminal** — runs a validated `sf` CLI command in the integrated terminal
- **Prompt** — opens a secure quick-input box with validation (e.g., Record ID search)

## Project structure

```
sf-suppoty-macros/
├── media/
│   └── sf-icon.svg              # Activity Bar icon
├── src/
│   ├── extension.ts             # activate / deactivate entry point
│   ├── types/
│   │   └── macro.ts             # Macro type definitions
│   ├── security/
│   │   └── inputValidation.ts   # ID validation, shell quoting
│   ├── macros/
│   │   ├── macroRegistry.ts     # All macro definitions
│   │   └── macroHandlers.ts     # Insert / terminal / prompt logic
│   └── providers/
│       └── macroTreeProvider.ts # Sidebar TreeDataProvider
├── package.json
└── tsconfig.json
```

## Setup & development

### 1. Install dependencies

```bash
npm install
```

### 2. Compile TypeScript

```bash
npm run compile
```

For continuous rebuild during development:

```bash
npm run watch
```

### 3. Run in Extension Development Host (F5)

1. Open this folder in VS Code
2. Press **F5** (or Run → Start Debugging → **Run Extension**)
3. A new VS Code window opens with the extension loaded
4. Click the **Salesforce Support Macros** icon in the Activity Bar

### 4. Lint & test

```bash
npm run lint
npm test
```

## Package for team distribution (.vsix)

Install the packaging tool (included as devDependency):

```bash
npm install
```

Build and package:

```bash
npm run compile
npm run package
```

This produces `sf-suppoty-macros-1.0.0.vsix` in the project root.

### Install the .vsix on team machines

**Via VS Code UI:** Extensions → `...` menu → **Install from VSIX...**

**Via CLI:**

```bash
code --install-extension sf-suppoty-macros-1.0.0.vsix
```

## Usage tips

- **Smart System.debug:** Highlight a variable name, then run the macro
- **SOQL For-Loop Wrapper:** Select a SOQL query or run with no selection for the default template
- **Log Parser Filter:** Open a `.log` file first — results open in a local preview document
- **Run Current Test Class:** Active file must be a `.cls` file containing `@isTest`
- **Quick Record ID Search:** Enter a validated 15/18-char ID, then choose browser open or SOQL insert

## Adding new macros

1. Add a definition to `src/macros/macroRegistry.ts`
2. Implement the handler in `src/macros/macroHandlers.ts` and register it in `MACRO_HANDLERS`
3. Add a matching command entry in `package.json` → `contributes.commands`
4. Recompile and test

## License

UNLICENSED — internal team use only.
