/*
 * Compact support macros catalog — trimmed version to avoid large inlined strings.
 */
export const SUPPORT_MACROS_CATALOG = {
  categories: [
    {
      id: 'critical-troubleshooting',
      label: 'Critical Troubleshooting & System Logs',
      description:
        'Operational diagnostics for failed jobs, queue backlogs, schedule drift, and runtime metadata state.',
      macros: [
        {
          id: 'failed-async-jobs-today',
          label: 'Check Failed Async Jobs Today',
          description:
            "Queries today's failed async Apex jobs and prints summary lines.",
          tooltip:
            'Run in Anonymous Apex to inspect recent failed AsyncApexJob records.',
          code:
            "Datetime sinceTime = System.now().addDays(-1);\nfor (AsyncApexJob j : [SELECT Id, ApexClass.Name, JobType, Status, CreatedDate FROM AsyncApexJob WHERE Status = 'Failed' AND CreatedDate >= :sinceTime LIMIT 200]) {\n    System.debug(j.CreatedDate + ' | ' + (j.ApexClass != null ? j.ApexClass.Name : 'N/A') + ' | ' + j.JobType + ' | ' + j.Status);\n}"
        }
      ]
    },
    {
      id: 'user-access-security',
      label: 'User Access & Security',
      description: 'Operational checks around login lockouts and frozen users.',
      macros: [
        {
          id: 'track-frozen-user-accounts',
          label: 'Track Frozen User Accounts',
          description: 'Lists frozen user login rows.',
          tooltip: 'Run to surface frozen UserLogin records.',
          code:
            "for (UserLogin ul : [SELECT Id, User.Username, User.Name, IsFrozen FROM UserLogin WHERE IsFrozen = true LIMIT 200]) {\n    System.debug(ul.User.Name + ' (' + ul.User.Username + ') - Frozen=' + ul.IsFrozen);\n}"
        }
      ]
    }
  ]
};

export type SupportMacro = {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  code: string;
};

export type SupportMacroCategory = {
  id: string;
  label: string;
  description?: string;
  macros: SupportMacro[];
};

export default SUPPORT_MACROS_CATALOG;
