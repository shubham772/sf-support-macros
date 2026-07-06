# Salesforce Support Macros

Salesforce Support Macros is a VS Code extension I am preparing for publication on the Visual Studio Marketplace. It provides a categorized sidebar of Salesforce support macros, letting support engineers and developers quickly insert Apex snippets, run Salesforce CLI commands, or inspect org state with a few clicks.

## Why publish this extension?

This extension is built for support teams who need a safer, faster way to perform repeatable org diagnostics and troubleshooting from inside VS Code.

- Supports Salesforce Production and sandbox orgs with local-only logic
- Provides insertable Apex templates, validated CLI workflows, and debug helpers
- Reduces typing and context switching during incident response

## Key features

### Macro categories

- **Critical Troubleshooting & System Logs** — failed async jobs, flex queue, long-running Apex jobs, inactive triggers, scheduled jobs, paused flow interviews, exception context
- **User Access & Security** — frozen logins, locked-out users, active sessions, permission set assignments, inactive user API footprint, roleless users, privileged users, never-logged-in accounts
- **Data Fixes & Purging** — orphaned content documents, bulk undelete template, custom setting cleanup, duplicate audit, accounts without contacts, queue review, stale records, soft-delete counts, null field audits
- **Limits & Automation Auditing** — skew and record counts, trigger/flow overlap, ownership skew scan, governor headroom, batch risk objects, trigger density, flow density, query selectivity
- **Integration & API Monitoring** — integration user audits, platform event baseline, email volume, outbound message / event templates
- **Storage & Data Governance** — largest files, old files, task growth, legacy attachment volume, record growth baseline
- **Org Configuration Audit** — queue membership, record types, business hours, role hierarchy, profile inventory

### Execution modes

- **Insert** — inserts a snippet directly into the active editor
- **Terminal** — runs a validated `sf` CLI command in the integrated terminal
- **Prompt** — prompts for input securely and validates it before use

## Changelog

### 1.0.0 — Initial marketplace-ready release

- Added core sidebar macro tree with support categories and reusable helper flows
- Implemented local-only execution modes for safe Apex snippet insertion and CLI commands
- Added support for Salesforce CLI workflows such as quick deploy, org open, and test execution
- Added log file filtering and smart debug insertion helpers for faster troubleshooting
- Added user/access auditing macros and org health inspection templates
- Added secure input validation and shell-safe sf command execution
- Updated project to MIT license for publishing

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/) 1.85 or later
- [Salesforce CLI (`sf`)](https://developer.salesforce.com/tools/salesforcecli) installed and authenticated locally

## Installation

This extension is intended for installation directly from the Visual Studio Code Marketplace.

### For development

```bash
npm install
npm run compile
```

### Run in VS Code

1. Open the extension folder in VS Code
2. Press **F5** to launch the Extension Development Host
3. Open the Salesforce Support Macros view from the Activity Bar

## Usage

- Open the sidebar and select a macro to insert code or run an action
- Use the built-in quick record ID search to validate IDs before running commands
- Open `.log` files and use the log parser macro to filter relevant debug lines
- Run current Apex test class directly from the active `.cls` file


## License

Released under the MIT License. See `LICENSE` for details.
