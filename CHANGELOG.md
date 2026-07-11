# Change Log

All notable changes to the `sf-support-macros` extension are documented in this file.

This project adheres to https://keepachangelog.com/ principles.

## [Unreleased]

- No changes yet.

## [1.0.5] - 2026-07-11

### Added

- Expanded support macro catalog with additional Salesforce operational categories and diagnostics templates, including:
  - Critical Troubleshooting & System Logs
  - User Access & Security
  - Data Fixes & Purging
  - Recursive & Governor Limit Auditing
  - Integration & API Monitoring
  - Storage & Data Governance
  - Org Configuration Audit

### Changed

- Updated the macros catalog formatting and structure for improved maintainability and marketplace release readiness.
- Tree view category rendering now supports dynamically discovered categories from the macro registry.

### Fixed

- Corrected command namespace typo from `sf-suppoty-macros` to `sf-support-macros` across command contributions and runtime registrations.
- Fixed command/menu contribution mismatch that caused Marketplace validation warnings for undefined command references.

## [1.0.4] - 2026-07-07

### Added

- Automatic SObject detection from Salesforce Record Id in **Quick Record ID Search**
  - New `resolveObjectNameFromRecordId()` helper that resolves the SObject API name using the Record Id's 3-character key prefix
  - Falls back to a live `EntityDefinition` query via `sf data query` when the prefix is not in the local static mapping
  - In-memory `sobjectPrefixCache` (`Map<string, string>`) to avoid repeated CLI calls within the same session
- New `executeSfCommand()` internal helper for silent `sf` CLI execution when stdout is needed inside the extension (separate from the terminal-based `runSfCommand()`)
- Progress notification (`vscode.window.withProgress`) shown while the extension resolves the SObject from a Record Id

### Changed

- Removed the manual "Enter SObject API Name" input prompt from **Show Record Data** — the object is now auto-detected
- **Insert SOQL Query** action now auto-detects the SObject as well, instead of falling back to a generic `SObject` placeholder
- **Insert SOQL Query** now generates `SELECT FIELDS(ALL) ... LIMIT 1` for a richer, ready-to-run query instead of `SELECT Id, Name`
- Improved error messaging when the SObject cannot be resolved (e.g., user not authenticated to the correct org)

### Fixed

- Custom object Record Ids (e.g., `a1E`, `a25`) that are not part of the static prefix map are now correctly resolved via `EntityDefinition`, eliminating the need for users to know the API name of custom objects

## [1.0.3] - 2026-07-06

### Changed


## [1.0.2] - 2026-07-06

### Changed



## [1.0.1] - 2026-07-06

### Changed

- Fixed activity bar icon path and added SVG variants for light/dark themes
- Added fallback `media/sf-icon.svg` and new `media/sf-icon-light.svg`, `media/sf-icon-dark.svg`
- Updated `package.json` to reference the new icons

## [1.0.0] - 2026-07-06

### Added

- Core sidebar macro tree with support categories and reusable helper flows
- Local-only execution modes for safe Apex snippet insertion and validated CLI commands
- Support for Salesforce CLI workflows including quick deploy, org open, and test execution
- Debug log filtering and smart debug insertion helpers
- User access auditing macros and org health inspection templates
- Secure input validation and shell-safe `sf` command execution
- Marketplace-ready metadata and MIT licensing