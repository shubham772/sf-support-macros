export const SUPPORT_MACROS_CATALOG = {
  categories: [
    {
      id: 'critical-troubleshooting',
      label: 'Critical Troubleshooting & System Logs',
      description: 'Operational diagnostics for failed jobs, queue backlogs, schedule drift, and runtime metadata state.',
      macros: [
        {
          id: 'failed-async-jobs-today',
          label: 'Check Failed Async Jobs Today',
          description: "Queries today's failed async Apex jobs and prints class, method, status, processed counts, and extended error details.",
          tooltip: 'Use during live support incidents to quickly inspect failed queueables, batches, futures, and scheduled jobs from today.',
          code: "Date todayDate = Date.today();\nDatetime startOfDay = Datetime.newInstance(todayDate, Time.newInstance(0, 0, 0, 0));\nList<AsyncApexJob> failedJobs = [\n    SELECT Id, ApexClass.Name, MethodName, JobType, Status, CreatedDate, CompletedDate,\n           NumberOfErrors, JobItemsProcessed, TotalJobItems, ExtendedStatus\n    FROM AsyncApexJob\n    WHERE Status = 'Failed'\n      AND CreatedDate >= :startOfDay\n    ORDER BY CreatedDate DESC\n    LIMIT 200\n];\nSystem.debug('=== FAILED ASYNC JOBS TODAY: ' + failedJobs.size() + ' ===');\nfor (AsyncApexJob jobRecord : failedJobs) {\n    System.debug('Job Id: ' + jobRecord.Id);\n    System.debug('Class: ' + (jobRecord.ApexClass != null ? jobRecord.ApexClass.Name : 'N/A'));\n    System.debug('Method: ' + jobRecord.MethodName);\n    System.debug('Type: ' + jobRecord.JobType);\n    System.debug('Status: ' + jobRecord.Status);\n    System.debug('Created: ' + jobRecord.CreatedDate);\n    System.debug('Completed: ' + jobRecord.CompletedDate);\n    System.debug('Processed: ' + jobRecord.JobItemsProcessed + '/' + jobRecord.TotalJobItems);\n    System.debug('Errors: ' + jobRecord.NumberOfErrors);\n    System.debug('Extended Error: ' + String.valueOf(jobRecord.ExtendedStatus));\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'failed-async-jobs-last-7-days',
          label: 'Check Failed Async Jobs Last 7 Days',
          description: 'Extends failed async inspection to the last seven days for recurring issue analysis.',
          tooltip: 'Useful for spotting patterns in batch failures, queueable retries, and weekend job incidents.',
          code: "Datetime sevenDaysAgo = System.now().addDays(-7);\nList<AsyncApexJob> failedJobs = [\n    SELECT Id, ApexClass.Name, MethodName, JobType, Status, CreatedDate, CompletedDate,\n           NumberOfErrors, JobItemsProcessed, TotalJobItems, ExtendedStatus\n    FROM AsyncApexJob\n    WHERE Status = 'Failed'\n      AND CreatedDate >= :sevenDaysAgo\n    ORDER BY CreatedDate DESC\n    LIMIT 500\n];\nSystem.debug('=== FAILED ASYNC JOBS LAST 7 DAYS: ' + failedJobs.size() + ' ===');\nfor (AsyncApexJob jobRecord : failedJobs) {\n    System.debug(jobRecord.CreatedDate + ' | ' + jobRecord.JobType + ' | ' + (jobRecord.ApexClass != null ? jobRecord.ApexClass.Name : 'N/A') + ' | Errors=' + jobRecord.NumberOfErrors + ' | Status=' + jobRecord.Status + ' | Extended=' + jobRecord.ExtendedStatus);\n}"
        },
        {
          id: 'monitor-apex-flex-queue',
          label: 'Monitor Apex Flex Queue',
          description: 'Lists async jobs currently waiting in Holding or Queued state so support can identify execution backlog.',
          tooltip: 'Useful when deployments, batch submissions, or queueable chains appear delayed because the org has a saturated async pipeline.',
          code: "List<AsyncApexJob> queuedJobs = [\n    SELECT Id, ApexClass.Name, MethodName, JobType, Status, CreatedDate, PositionInQueue,\n           JobItemsProcessed, TotalJobItems, CreatedBy.Name\n    FROM AsyncApexJob\n    WHERE Status IN ('Holding', 'Queued', 'Preparing')\n    ORDER BY PositionInQueue ASC, CreatedDate ASC\n    LIMIT 200\n];\nSystem.debug('=== FLEX / EXECUTION QUEUE SNAPSHOT: ' + queuedJobs.size() + ' ===');\nfor (AsyncApexJob jobRecord : queuedJobs) {\n    System.debug('Queue Position: ' + jobRecord.PositionInQueue);\n    System.debug('Job Id: ' + jobRecord.Id);\n    System.debug('Class: ' + (jobRecord.ApexClass != null ? jobRecord.ApexClass.Name : 'N/A'));\n    System.debug('Method: ' + jobRecord.MethodName);\n    System.debug('Type: ' + jobRecord.JobType);\n    System.debug('Status: ' + jobRecord.Status);\n    System.debug('Submitted By: ' + (jobRecord.CreatedBy != null ? jobRecord.CreatedBy.Name : 'N/A'));\n    System.debug('Created: ' + jobRecord.CreatedDate);\n    System.debug('Processed: ' + jobRecord.JobItemsProcessed + '/' + jobRecord.TotalJobItems);\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'check-long-running-async-jobs',
          label: 'Check Long Running Async Jobs',
          description: 'Highlights processing async jobs older than one hour that may indicate stuck or slow execution.',
          tooltip: 'Good for incident triage when integrations or nightly jobs appear hung.',
          code: "Datetime oneHourAgo = System.now().addHours(-1);\nList<AsyncApexJob> longRunningJobs = [\n    SELECT Id, ApexClass.Name, MethodName, JobType, Status, CreatedDate, LastProcessed,\n           JobItemsProcessed, TotalJobItems, NumberOfErrors\n    FROM AsyncApexJob\n    WHERE Status IN ('Processing', 'Preparing', 'Queued', 'Holding')\n      AND CreatedDate <= :oneHourAgo\n    ORDER BY CreatedDate ASC\n    LIMIT 200\n];\nSystem.debug('=== LONG RUNNING / STALE ASYNC JOBS: ' + longRunningJobs.size() + ' ===');\nfor (AsyncApexJob jobRecord : longRunningJobs) {\n    System.debug('Job Id: ' + jobRecord.Id + ' | Type: ' + jobRecord.JobType + ' | Class: ' + (jobRecord.ApexClass != null ? jobRecord.ApexClass.Name : 'N/A') + ' | Status: ' + jobRecord.Status + ' | Created: ' + jobRecord.CreatedDate + ' | Processed: ' + jobRecord.JobItemsProcessed + '/' + jobRecord.TotalJobItems);\n}"
        },
        {
          id: 'inactive-trigger-status',
          label: 'Check Inactive Trigger Status',
          description: 'Queries Tooling API-exposed ApexTrigger metadata fields available in Anonymous Apex and reports inactive triggers.',
          tooltip: 'Helps detect bypassed business logic caused by deactivated triggers in sandboxes or production support scenarios.',
          code: "List<ApexTrigger> inactiveTriggers = [\n    SELECT Id, Name, TableEnumOrId, Status, NamespacePrefix, UsageAfterInsert, UsageAfterUpdate,\n           UsageAfterDelete, UsageBeforeInsert, UsageBeforeUpdate, UsageBeforeDelete\n    FROM ApexTrigger\n    WHERE Status != 'Active'\n    ORDER BY TableEnumOrId, Name\n    LIMIT 500\n];\nSystem.debug('=== INACTIVE / NON-ACTIVE TRIGGERS: ' + inactiveTriggers.size() + ' ===');\nfor (ApexTrigger triggerRecord : inactiveTriggers) {\n    System.debug('Trigger: ' + triggerRecord.Name);\n    System.debug('Object: ' + triggerRecord.TableEnumOrId);\n    System.debug('Status: ' + triggerRecord.Status);\n    System.debug('Namespace: ' + triggerRecord.NamespacePrefix);\n    System.debug('Events: BI=' + triggerRecord.UsageBeforeInsert + ', BU=' + triggerRecord.UsageBeforeUpdate + ', BD=' + triggerRecord.UsageBeforeDelete + ', AI=' + triggerRecord.UsageAfterInsert + ', AU=' + triggerRecord.UsageAfterUpdate + ', AD=' + triggerRecord.UsageAfterDelete);\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'scheduled-jobs-health',
          label: 'Review Scheduled Jobs Health',
          description: 'Surfaces active CronTrigger and CronJobDetail entries with last and next fire times for schedule drift analysis.',
          tooltip: 'Use when nightly or hourly automations appear skipped, duplicated, or delayed.',
          code: "List<CronTrigger> scheduledJobs = [\n    SELECT Id, State, StartTime, EndTime, NextFireTime, PreviousFireTime, TimesTriggered,\n           CronExpression, CronJobDetail.Name, CronJobDetail.JobType\n    FROM CronTrigger\n    ORDER BY NextFireTime ASC\n    LIMIT 200\n];\nSystem.debug('=== SCHEDULED JOB HEALTH SNAPSHOT: ' + scheduledJobs.size() + ' ===');\nfor (CronTrigger cronRecord : scheduledJobs) {\n    System.debug('Job Name: ' + cronRecord.CronJobDetail.Name);\n    System.debug('Type: ' + cronRecord.CronJobDetail.JobType);\n    System.debug('State: ' + cronRecord.State);\n    System.debug('Cron: ' + cronRecord.CronExpression);\n    System.debug('Last Fire: ' + cronRecord.PreviousFireTime);\n    System.debug('Next Fire: ' + cronRecord.NextFireTime);\n    System.debug('Times Triggered: ' + cronRecord.TimesTriggered);\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'paused-flow-interviews',
          label: 'Review Paused Flow Interviews',
          description: 'Lists paused or waiting flow interviews that may require cleanup or resume action.',
          tooltip: 'Useful when users report stuck approval-style or screen-driven processes.',
          code: "List<FlowInterview> interviews = [\n    SELECT Id, InterviewLabel, CurrentElement, PauseLabel, Guid, CreatedDate, LastModifiedDate\n    FROM FlowInterview\n    ORDER BY LastModifiedDate DESC\n    LIMIT 500\n];\nSystem.debug('=== FLOW INTERVIEW SNAPSHOT: ' + interviews.size() + ' ===');\nfor (FlowInterview interviewRecord : interviews) {\n    System.debug('Interview: ' + interviewRecord.InterviewLabel + ' | Current Element: ' + interviewRecord.CurrentElement + ' | Pause Label: ' + interviewRecord.PauseLabel + ' | Created: ' + interviewRecord.CreatedDate + ' | Last Modified: ' + interviewRecord.LastModifiedDate);\n}"
        },
        {
          id: 'recent-apex-exception-emails',
          label: 'Recent Apex Exception Email Context',
          description: 'Collects recent failed jobs and scheduled jobs to assist support while correlating Apex exception emails.',
          tooltip: 'A compact context macro for engineers working from an email alert or Sev-2 incident bridge.',
          code: "Datetime sinceTime = System.now().addHours(-24);\nList<AsyncApexJob> failedJobs = [\n    SELECT Id, ApexClass.Name, JobType, Status, ExtendedStatus, CreatedDate\n    FROM AsyncApexJob\n    WHERE Status = 'Failed' AND CreatedDate >= :sinceTime\n    ORDER BY CreatedDate DESC\n    LIMIT 100\n];\nList<CronTrigger> cronJobs = [\n    SELECT Id, State, NextFireTime, PreviousFireTime, CronJobDetail.Name\n    FROM CronTrigger\n    ORDER BY PreviousFireTime DESC\n    LIMIT 100\n];\nSystem.debug('=== FAILED JOB CONTEXT ===');\nfor (AsyncApexJob jobRecord : failedJobs) {\n    System.debug(jobRecord.CreatedDate + ' | ' + (jobRecord.ApexClass != null ? jobRecord.ApexClass.Name : 'N/A') + ' | ' + jobRecord.JobType + ' | ' + jobRecord.ExtendedStatus);\n}\nSystem.debug('=== SCHEDULE CONTEXT ===');\nfor (CronTrigger cronRecord : cronJobs) {\n    System.debug(cronRecord.CronJobDetail.Name + ' | Previous=' + cronRecord.PreviousFireTime + ' | Next=' + cronRecord.NextFireTime + ' | State=' + cronRecord.State);\n}"
        }
      ]
    },
    {
      id: 'user-access-security',
      label: 'User Access & Security',
      description: 'Operational checks around login lockouts, frozen users, sessions, roles, and permission assignments.',
      macros: [
        {
          id: 'track-frozen-user-accounts',
          label: 'Track Frozen User Accounts',
          description: 'Lists all user login records currently frozen, including username, profile, and login identifiers.',
          tooltip: 'Helpful when users report blocked access even though their User record is active.',
          code: "List<UserLogin> frozenLogins = [\n    SELECT Id, UserId, IsFrozen, User.Username, User.Name, User.IsActive, User.Profile.Name\n    FROM UserLogin\n    WHERE IsFrozen = true\n    ORDER BY User.Username\n    LIMIT 500\n];\nSystem.debug('=== FROZEN USER LOGINS: ' + frozenLogins.size() + ' ===');\nfor (UserLogin loginRecord : frozenLogins) {\n    System.debug('User: ' + loginRecord.User.Name + ' (' + loginRecord.User.Username + ')');\n    System.debug('Profile: ' + loginRecord.User.Profile.Name);\n    System.debug('Active User: ' + loginRecord.User.IsActive);\n    System.debug('Login Id: ' + loginRecord.Id);\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'identify-locked-out-users',
          label: 'Identify Locked Out Users',
          description: 'Finds user login rows that are locked due to failed password attempts or administrative lockout.',
          tooltip: 'Use when helpdesk tickets mention invalid password lockouts or MFA retries causing blocked login.',
          code: "List<UserLogin> lockedLogins = [\n    SELECT Id, UserId, IsPasswordLocked, User.Username, User.Name, User.IsActive, User.Profile.Name\n    FROM UserLogin\n    WHERE IsPasswordLocked = true\n    ORDER BY User.Username\n    LIMIT 500\n];\nSystem.debug('=== LOCKED OUT USERS: ' + lockedLogins.size() + ' ===');\nfor (UserLogin loginRecord : lockedLogins) {\n    System.debug('User: ' + loginRecord.User.Name + ' (' + loginRecord.User.Username + ')');\n    System.debug('Profile: ' + loginRecord.User.Profile.Name);\n    System.debug('Active User: ' + loginRecord.User.IsActive);\n    System.debug('Login Id: ' + loginRecord.Id);\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'trace-active-sessions',
          label: 'Trace Active Sessions',
          description: 'Lists active AuthSession records grouped by user context so support can inspect session type and source.',
          tooltip: 'Useful during login investigations, concurrent session checks, and integration user session tracing.',
          code: "List<AuthSession> sessions = [\n    SELECT Id, UsersId, LoginType, LoginHistoryId, SourceIp, SessionType, SessionSecurityLevel,\n           NumSecondsValid, CreatedDate, LastModifiedDate, ParentId, Username\n    FROM AuthSession\n    WHERE NumSecondsValid > 0\n    ORDER BY Username, SessionType\n    LIMIT 500\n];\nSystem.debug('=== ACTIVE AUTH SESSIONS: ' + sessions.size() + ' ===');\nfor (AuthSession sessionRecord : sessions) {\n    System.debug('Username: ' + sessionRecord.Username);\n    System.debug('User Id: ' + sessionRecord.UsersId);\n    System.debug('Login Type: ' + sessionRecord.LoginType);\n    System.debug('Session Type: ' + sessionRecord.SessionType);\n    System.debug('Security Level: ' + sessionRecord.SessionSecurityLevel);\n    System.debug('Source IP: ' + sessionRecord.SourceIp);\n    System.debug('Valid Seconds Remaining: ' + sessionRecord.NumSecondsValid);\n    System.debug('Created: ' + sessionRecord.CreatedDate);\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'fetch-user-permission-set-assignments',
          label: 'Fetch User Permission Set Assignments',
          description: 'Template helper that pulls profile and permission set assignments for a specific username.',
          tooltip: 'Replace the USERNAME_TO_CHECK constant before execution to inspect a user\'s profile and active permission set footprint.',
          code: "String USERNAME_TO_CHECK = 'user@example.com';\nList<User> matchedUsers = [\n    SELECT Id, Name, Username, IsActive, Profile.Name, UserRole.Name\n    FROM User\n    WHERE Username = :USERNAME_TO_CHECK\n    LIMIT 1\n];\nif (matchedUsers.isEmpty()) {\n    System.debug('No user found for username: ' + USERNAME_TO_CHECK);\n} else {\n    User targetUser = matchedUsers[0];\n    System.debug('=== USER ACCESS FOOTPRINT ===');\n    System.debug('User: ' + targetUser.Name + ' (' + targetUser.Username + ')');\n    System.debug('Profile: ' + targetUser.Profile.Name);\n    System.debug('Role: ' + (targetUser.UserRole != null ? targetUser.UserRole.Name : 'No Role'));\n    List<PermissionSetAssignment> assignments = [\n        SELECT PermissionSet.Name, PermissionSet.Label, PermissionSet.IsOwnedByProfile, Assignee.Username\n        FROM PermissionSetAssignment\n        WHERE AssigneeId = :targetUser.Id\n        ORDER BY PermissionSet.IsOwnedByProfile DESC, PermissionSet.Label ASC\n    ];\n    for (PermissionSetAssignment assignmentRecord : assignments) {\n        System.debug((assignmentRecord.PermissionSet.IsOwnedByProfile ? '[PROFILE-OWNED] ' : '[PERMISSION SET] ') + assignmentRecord.PermissionSet.Label + ' (' + assignmentRecord.PermissionSet.Name + ')');\n    }\n}"
        },
        {
          id: 'inactive-users-with-api-access',
          label: 'Audit Inactive Users With API Footprint',
          description: 'Highlights inactive users with permission sets or profiles commonly used for integrations and automation.',
          tooltip: 'Helps support identify stale integration accounts and cleanup opportunities after ownership changes.',
          code: "List<User> inactiveUsers = [\n    SELECT Id, Name, Username, IsActive, Profile.Name, LastLoginDate, UserType\n    FROM User\n    WHERE IsActive = false\n    ORDER BY LastLoginDate DESC\n    LIMIT 500\n];\nSet<Id> inactiveUserIds = new Set<Id>();\nfor (User userRecord : inactiveUsers) {\n    inactiveUserIds.add(userRecord.Id);\n}\nMap<Id, List<String>> permissionSetsByUserId = new Map<Id, List<String>>();\nif (!inactiveUserIds.isEmpty()) {\n    for (PermissionSetAssignment psa : [\n        SELECT AssigneeId, PermissionSet.Label\n        FROM PermissionSetAssignment\n        WHERE AssigneeId IN :inactiveUserIds\n    ]) {\n        if (!permissionSetsByUserId.containsKey(psa.AssigneeId)) {\n            permissionSetsByUserId.put(psa.AssigneeId, new List<String>());\n        }\n        permissionSetsByUserId.get(psa.AssigneeId).add(psa.PermissionSet.Label);\n    }\n}\nSystem.debug('=== INACTIVE USERS ACCESS FOOTPRINT ===');\nfor (User userRecord : inactiveUsers) {\n    System.debug('User: ' + userRecord.Name + ' (' + userRecord.Username + ')');\n    System.debug('Profile: ' + userRecord.Profile.Name + ', Type: ' + userRecord.UserType + ', Last Login: ' + userRecord.LastLoginDate);\n    System.debug('Permission Sets: ' + String.join(permissionSetsByUserId.containsKey(userRecord.Id) ? permissionSetsByUserId.get(userRecord.Id) : new List<String>{'None'}, ', '));\n    System.debug('----------------------------------------');\n}"
        },
        {
          id: 'users-without-role',
          label: 'Find Users Without Role',
          description: 'Lists active internal users that do not have a role assigned.',
          tooltip: 'Helpful in sharing-model troubleshooting and visibility gap investigations.',
          code: "List<User> usersWithoutRole = [\n    SELECT Id, Name, Username, Profile.Name, UserType, IsActive\n    FROM User\n    WHERE IsActive = true\n      AND UserRoleId = null\n      AND UserType = 'Standard'\n    ORDER BY Profile.Name, Name\n    LIMIT 500\n];\nSystem.debug('=== ACTIVE USERS WITHOUT ROLE: ' + usersWithoutRole.size() + ' ===');\nfor (User userRecord : usersWithoutRole) {\n    System.debug(userRecord.Name + ' | ' + userRecord.Username + ' | Profile=' + userRecord.Profile.Name);\n}"
        },
        {
          id: 'users-with-modify-all-data',
          label: 'Find Users With Modify All Data',
          description: 'Surfaces active users whose profile or permission footprint may grant broad administrative power.',
          tooltip: 'Use during security reviews or incident containment to identify privileged users quickly.',
          code: "List<User> activeUsers = [\n    SELECT Id, Name, Username, Profile.Name, Profile.PermissionsModifyAllData, IsActive\n    FROM User\n    WHERE IsActive = true\n    ORDER BY Profile.Name, Username\n    LIMIT 1000\n];\nSystem.debug('=== USERS WITH PROFILE-LEVEL MODIFY ALL DATA ===');\nfor (User userRecord : activeUsers) {\n    if (userRecord.Profile.PermissionsModifyAllData) {\n        System.debug(userRecord.Name + ' | ' + userRecord.Username + ' | Profile=' + userRecord.Profile.Name);\n    }\n}"
        },
        {
          id: 'expiring-password-never-logged-in',
          label: 'Find Users Never Logged In',
          description: 'Lists active users who have never logged in, useful for onboarding drift and stale account review.',
          tooltip: 'Good for support and access cleanup programs.',
          code: "List<User> neverLoggedInUsers = [\n    SELECT Id, Name, Username, Profile.Name, CreatedDate, LastLoginDate, IsActive\n    FROM User\n    WHERE IsActive = true\n      AND LastLoginDate = null\n    ORDER BY CreatedDate DESC\n    LIMIT 500\n];\nSystem.debug('=== ACTIVE USERS WHO NEVER LOGGED IN: ' + neverLoggedInUsers.size() + ' ===');\nfor (User userRecord : neverLoggedInUsers) {\n    System.debug(userRecord.Name + ' | ' + userRecord.Username + ' | Created=' + userRecord.CreatedDate + ' | Profile=' + userRecord.Profile.Name);\n}"
        },
        {
          id: 'permission-set-license-usage',
          label: 'Permission Set License Usage',
          description: 'Shows assigned permission set licenses and current user usage.',
          tooltip: 'Helpful for license exhaustion and provisioning incidents.',
          code: "List<PermissionSetLicense> licenses = [\n    SELECT Id, MasterLabel, DeveloperName, TotalLicenses, UsedLicenses, ExpirationDate, Status\n    FROM PermissionSetLicense\n    ORDER BY MasterLabel\n    LIMIT 500\n];\nSystem.debug('=== PERMISSION SET LICENSE USAGE ===');\nfor (PermissionSetLicense licenseRecord : licenses) {\n    System.debug(licenseRecord.MasterLabel + ' | Used=' + licenseRecord.UsedLicenses + '/' + licenseRecord.TotalLicenses + ' | Status=' + licenseRecord.Status + ' | Exp=' + licenseRecord.ExpirationDate);\n}"
        }
      ]
    },
    {
      id: 'data-fixes-purging',
      label: 'Data Fixes & Purging',
      description: 'Safe helper templates for orphan cleanup analysis, undelete actions, duplicate review, and configuration resets.',
      macros: [
        {
          id: 'clean-orphaned-content-documents',
          label: 'Clean Orphaned ContentDocuments',
          description: 'Finds ContentDocuments with no ContentDocumentLink rows and prints a cleanup candidate inventory.',
          tooltip: 'Analysis-only helper for storage cleanup; review results carefully before deletion governance decisions.',
          code: "List<ContentDocument> candidateDocuments = [\n    SELECT Id, Title, FileType, ContentSize, CreatedDate, OwnerId\n    FROM ContentDocument\n    ORDER BY CreatedDate DESC\n    LIMIT 1000\n];\nSet<Id> documentIds = new Set<Id>();\nfor (ContentDocument documentRecord : candidateDocuments) {\n    documentIds.add(documentRecord.Id);\n}\nMap<Id, Integer> linkCountByDocumentId = new Map<Id, Integer>();\nif (!documentIds.isEmpty()) {\n    for (AggregateResult ar : [\n        SELECT ContentDocumentId documentId, COUNT(Id) linkCount\n        FROM ContentDocumentLink\n        WHERE ContentDocumentId IN :documentIds\n        GROUP BY ContentDocumentId\n    ]) {\n        linkCountByDocumentId.put((Id) ar.get('documentId'), (Integer) ar.get('linkCount'));\n    }\n}\nInteger orphanCount = 0;\nLong orphanBytes = 0;\nSystem.debug('=== ORPHANED CONTENT DOCUMENT CANDIDATES ===');\nfor (ContentDocument documentRecord : candidateDocuments) {\n    Integer currentLinkCount = linkCountByDocumentId.containsKey(documentRecord.Id) ? linkCountByDocumentId.get(documentRecord.Id) : 0;\n    if (currentLinkCount == 0) {\n        orphanCount++;\n        orphanBytes += documentRecord.ContentSize;\n        System.debug('Document Id: ' + documentRecord.Id + ', Title: ' + documentRecord.Title + ', FileType: ' + documentRecord.FileType + ', SizeBytes: ' + documentRecord.ContentSize + ', Created: ' + documentRecord.CreatedDate);\n    }\n}\nSystem.debug('Total orphan candidates: ' + orphanCount);\nSystem.debug('Estimated bytes eligible for cleanup review: ' + orphanBytes);"
        },
        {
          id: 'bulk-undelete-utility',
          label: 'Bulk Undelete Utility',
          description: 'Template block to restore deleted records from the Recycle Bin by ID using Database.undelete().',
          tooltip: 'Replace the sample IDs and sObject type query with the deleted records you want to restore.',
          code: "List<Id> deletedRecordIds = new List<Id>{\n    '001000000000001AAA',\n    '001000000000002AAA'\n};\nList<Account> recordsToRestore = [\n    SELECT Id, Name, IsDeleted\n    FROM Account\n    WHERE Id IN :deletedRecordIds\n    ALL ROWS\n];\nSystem.debug('Records found for undelete: ' + recordsToRestore.size());\nDatabase.UndeleteResult[] results = Database.undelete(recordsToRestore, false);\nfor (Integer indexPosition = 0; indexPosition < results.size(); indexPosition++) {\n    Database.UndeleteResult resultRecord = results[indexPosition];\n    Account sourceRecord = recordsToRestore[indexPosition];\n    if (resultRecord.isSuccess()) {\n        System.debug('UNDELETE SUCCESS -> ' + sourceRecord.Id + ' / ' + sourceRecord.Name);\n    } else {\n        for (Database.Error errorRecord : resultRecord.getErrors()) {\n            System.debug('UNDELETE FAILED -> ' + sourceRecord.Id + ' / ' + sourceRecord.Name + ' / ' + errorRecord.getStatusCode() + ' / ' + errorRecord.getMessage());\n        }\n    }\n}"
        },
        {
          id: 'duplicate-rule-bypass-audit',
          label: 'Duplicate Rule Bypass Audit',
          description: 'Scans duplicate record sets and jobs to help support understand possible duplicate management drift.',
          tooltip: 'Use when agents report merges, duplicate blocking, or inconsistent dedupe behavior.',
          code: "List<DuplicateRecordSet> duplicateSets = [\n    SELECT Id, Name, RecordCount, CreatedDate, DuplicateRuleId\n    FROM DuplicateRecordSet\n    ORDER BY CreatedDate DESC\n    LIMIT 200\n];\nSystem.debug('=== DUPLICATE RECORD SETS ===');\nfor (DuplicateRecordSet setRecord : duplicateSets) {\n    System.debug('Set Id: ' + setRecord.Id + ', Name: ' + setRecord.Name + ', RecordCount: ' + setRecord.RecordCount + ', DuplicateRuleId: ' + setRecord.DuplicateRuleId + ', Created: ' + setRecord.CreatedDate);\n}\nList<DuplicateRecordItem> duplicateItems = [\n    SELECT Id, DuplicateRecordSetId, RecordId\n    FROM DuplicateRecordItem\n    WHERE DuplicateRecordSetId IN :new Map<Id, DuplicateRecordSet>(duplicateSets).keySet()\n    LIMIT 500\n];\nSystem.debug('Duplicate item sample size: ' + duplicateItems.size());"
        },
        {
          id: 'soft-deleted-record-counts',
          label: 'Soft Deleted Record Counts',
          description: 'Template to count recycle-bin volume on key standard objects.',
          tooltip: 'Useful before bulk undelete or cleanup efforts.',
          code: "List<String> objectApiNames = new List<String>{'Account','Contact','Lead','Opportunity','Case'};\nfor (String objectApiName : objectApiNames) {\n    try {\n        Integer deletedCount = Database.countQuery('SELECT COUNT() FROM ' + objectApiName + ' WHERE IsDeleted = true ALL ROWS');\n        System.debug(objectApiName + ' | Soft Deleted Count=' + deletedCount);\n    } catch (Exception ex) {\n        System.debug(objectApiName + ' | Failed=' + ex.getMessage());\n    }\n}"
        },
        {
          id: 'clear-stuck-custom-settings-metadata',
          label: 'Clear Stuck Custom Settings/Metadata',
          description: 'Template to fetch and reset list or hierarchy custom setting values during controlled support repair.',
          tooltip: 'Update the object API name and fields before running; intended for emergency configuration resets with full change control.',
          code: "String CUSTOM_SETTING_API_NAME = 'Support_Runtime_Config__c';\nString SETUP_OWNER_ID_TO_RESET = UserInfo.getOrganizationId();\nMap<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();\nif (!globalDescribe.containsKey(CUSTOM_SETTING_API_NAME)) {\n    System.debug('Custom setting object not found: ' + CUSTOM_SETTING_API_NAME);\n} else {\n    Schema.DescribeSObjectResult describeResult = globalDescribe.get(CUSTOM_SETTING_API_NAME).getDescribe();\n    if (!describeResult.isCustomSetting()) {\n        System.debug(CUSTOM_SETTING_API_NAME + ' is not a custom setting.');\n    } else {\n        String dynamicSoql = 'SELECT Id, Name, SetupOwnerId FROM ' + CUSTOM_SETTING_API_NAME + ' WHERE SetupOwnerId = :SETUP_OWNER_ID_TO_RESET LIMIT 200';\n        List<SObject> settingRows = Database.query(dynamicSoql);\n        System.debug('Rows found: ' + settingRows.size());\n        for (SObject rowRecord : settingRows) {\n            rowRecord.put('Name', String.valueOf(rowRecord.get('Name')) + '_RESET_' + System.now().getTime());\n        }\n        if (!settingRows.isEmpty()) {\n            update settingRows;\n            System.debug('Updated rows for controlled reset review. Extend this script with explicit field resets as needed.');\n        }\n    }\n}"
        },
        {
          id: 'empty-accounts-without-contacts',
          label: 'Find Accounts Without Contacts',
          description: 'Surfaces business accounts with no related contacts for cleanup or stewardship review.',
          tooltip: 'Useful in CRM data quality programs and ownership audits.',
          code: "List<Account> accounts = [\n    SELECT Id, Name, Owner.Name, CreatedDate\n    FROM Account\n    WHERE Id NOT IN (SELECT AccountId FROM Contact WHERE AccountId != null)\n    ORDER BY CreatedDate DESC\n    LIMIT 500\n];\nSystem.debug('=== ACCOUNTS WITHOUT CONTACTS: ' + accounts.size() + ' ===');\nfor (Account accountRecord : accounts) {\n    System.debug(accountRecord.Id + ' | ' + accountRecord.Name + ' | Owner=' + accountRecord.Owner.Name + ' | Created=' + accountRecord.CreatedDate);\n}"
        },
        {
          id: 'open-cases-without-owner-queue-review',
          label: 'Open Cases Queue Review',
          description: 'Lists open cases by owner and queue footprint for support backlog analysis.',
          tooltip: 'Helpful when support leaders suspect cases are stranded in queues or misowned.',
          code: "for (AggregateResult ar : [\n    SELECT OwnerId ownerId, COUNT(Id) totalCount\n    FROM Case\n    WHERE IsClosed = false\n    GROUP BY OwnerId\n    ORDER BY COUNT(Id) DESC\n    LIMIT 100\n]) {\n    System.debug('OwnerId=' + ar.get('ownerId') + ' | OpenCases=' + ar.get('totalCount'));\n}"
        },
        {
          id: 'stale-records-by-lastmodifieddate',
          label: 'Find Stale Records by Object',
          description: 'Template to identify records not updated for a long time on a target object.',
          tooltip: 'Replace the object and fields to run archival or cleanup discovery safely.',
          code: "String TARGET_OBJECT = 'Lead';\nInteger DAYS_STALE = 365;\nString soql = 'SELECT Id, Name, LastModifiedDate FROM ' + TARGET_OBJECT + ' WHERE LastModifiedDate < :System.now().addDays(-DAYS_STALE) ORDER BY LastModifiedDate ASC LIMIT 500';\nList<SObject> staleRecords = Database.query(soql);\nSystem.debug('=== STALE RECORDS FOR ' + TARGET_OBJECT + ': ' + staleRecords.size() + ' ===');\nfor (SObject rowRecord : staleRecords) {\n    System.debug('Id=' + rowRecord.get('Id') + ' | Name=' + rowRecord.get('Name') + ' | LastModifiedDate=' + rowRecord.get('LastModifiedDate'));\n}"
        },
        {
          id: 'null-critical-fields-audit',
          label: 'Null Critical Fields Audit',
          description: 'Template to inspect records missing critical business fields.',
          tooltip: 'Replace the object and field API names to build fast targeted data-fix investigations.',
          code: "String TARGET_OBJECT = 'Opportunity';\nString REQUIRED_FIELD = 'CloseDate';\nString soql = 'SELECT Id, Name, ' + REQUIRED_FIELD + ' FROM ' + TARGET_OBJECT + ' WHERE ' + REQUIRED_FIELD + ' = null LIMIT 500';\nList<SObject> results = Database.query(soql);\nSystem.debug('=== NULL FIELD AUDIT: ' + TARGET_OBJECT + '.' + REQUIRED_FIELD + ' => ' + results.size() + ' ===');\nfor (SObject rowRecord : results) {\n    System.debug('Id=' + rowRecord.get('Id') + ' | Name=' + rowRecord.get('Name'));\n}"
        }
      ]
    },
    {
      id: 'limits-automation-auditing',
      label: 'Recursive & Governor Limit Auditing',
      description: 'Diagnostics for data skew, metadata overlap, automation collision, and runtime headroom analysis.',
      macros: [
        {
          id: 'governor-headroom-snapshot',
          label: 'Governor Headroom Snapshot',
          description: 'Prints current transaction governor usage so engineers can compare remaining limits while refining support scripts.',
          tooltip: 'Useful while tuning ad hoc remediation logic and confirming a script remains safe inside Anonymous Apex runtime.',
          code: "System.debug('=== GOVERNOR HEADROOM SNAPSHOT ===');\nSystem.debug('SOQL Queries: ' + Limits.getQueries() + ' / ' + Limits.getLimitQueries());\nSystem.debug('Query Rows: ' + Limits.getQueryRows() + ' / ' + Limits.getLimitQueryRows());\nSystem.debug('DML Statements: ' + Limits.getDmlStatements() + ' / ' + Limits.getLimitDmlStatements());\nSystem.debug('DML Rows: ' + Limits.getDmlRows() + ' / ' + Limits.getLimitDmlRows());\nSystem.debug('CPU Time: ' + Limits.getCpuTime() + ' / ' + Limits.getLimitCpuTime());\nSystem.debug('Heap Size: ' + Limits.getHeapSize() + ' / ' + Limits.getLimitHeapSize());\nSystem.debug('Callouts: ' + Limits.getCallouts() + ' / ' + Limits.getLimitCallouts());\nSystem.debug('Email Invocations: ' + Limits.getEmailInvocations() + ' / ' + Limits.getLimitEmailInvocations());\nSystem.debug('Future Calls: ' + Limits.getFutureCalls() + ' / ' + Limits.getLimitFutureCalls());\nSystem.debug('Queueable Jobs: ' + Limits.getQueueableJobs() + ' / ' + Limits.getLimitQueueableJobs());"
        },
        {
          id: 'trigger-density-by-object',
          label: 'Trigger Density by Object',
          description: 'Counts active triggers per object to identify crowded automation surfaces.',
          tooltip: 'Useful for architect-level support investigations into recursion and handler overlap.',
          code: "for (AggregateResult ar : [\n    SELECT TableEnumOrId objectName, COUNT(Id) triggerCount\n    FROM ApexTrigger\n    WHERE Status = 'Active'\n    GROUP BY TableEnumOrId\n    ORDER BY COUNT(Id) DESC\n    LIMIT 200\n]) {\n    System.debug('Object=' + ar.get('objectName') + ' | ActiveTriggers=' + ar.get('triggerCount'));\n}"
        },
        {
          id: 'profile-data-skew-record-count',
          label: 'Profile Data Skew / Record Count',
          description: 'Safely counts records across common standard objects using dynamic SOQL and exception handling.',
          tooltip: 'Use to spot extreme object volumes that may correlate with data skew, ownership hotspots, and locking incidents.',
          code: "List<String> objectApiNames = new List<String>{\n    'Account', 'Contact', 'Lead', 'Opportunity', 'Case', 'Task', 'Event', 'Asset',\n    'Contract', 'Order', 'Campaign', 'User', 'ContentDocument', 'EmailMessage'\n};\nMap<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();\nSystem.debug('=== STANDARD OBJECT RECORD COUNT AUDIT ===');\nfor (String objectApiName : objectApiNames) {\n    if (!globalDescribe.containsKey(objectApiName)) {\n        System.debug(objectApiName + ' -> Not available in this org.');\n        continue;\n    }\n    try {\n        Integer totalCount = Database.countQuery('SELECT COUNT() FROM ' + objectApiName);\n        System.debug(objectApiName + ' -> ' + totalCount);\n    } catch (Exception ex) {\n        System.debug(objectApiName + ' -> Count failed: ' + ex.getMessage());\n    }\n}"
        },
        {
          id: 'audit-process-automation-overlap',
          label: 'Audit Process Automation Overlap',
          description: 'Cross-checks objects with active triggers and active flows to highlight potential automation race conditions.',
          tooltip: 'Best for troubleshooting duplicate updates, recursion, validation timing, and mixed automation side effects.',
          code: "Map<String, List<String>> activeTriggersByObject = new Map<String, List<String>>();\nfor (ApexTrigger triggerRecord : [\n    SELECT Name, TableEnumOrId, Status\n    FROM ApexTrigger\n    WHERE Status = 'Active'\n    LIMIT 1000\n]) {\n    if (!activeTriggersByObject.containsKey(triggerRecord.TableEnumOrId)) {\n        activeTriggersByObject.put(triggerRecord.TableEnumOrId, new List<String>());\n    }\n    activeTriggersByObject.get(triggerRecord.TableEnumOrId).add(triggerRecord.Name);\n}\nMap<String, List<String>> activeFlowsByObject = new Map<String, List<String>>();\nfor (FlowDefinitionView flowRecord : [\n    SELECT ApiName, Label, ProcessType, TriggerObjectOrEventLabel, TriggerObjectOrEventApiName, ActiveVersion.VersionNumber\n    FROM FlowDefinitionView\n    WHERE ActiveVersionId != null\n    LIMIT 1000\n]) {\n    String targetObject = flowRecord.TriggerObjectOrEventApiName;\n    if (String.isBlank(targetObject)) {\n        continue;\n    }\n    if (!activeFlowsByObject.containsKey(targetObject)) {\n        activeFlowsByObject.put(targetObject, new List<String>());\n    }\n    activeFlowsByObject.get(targetObject).add(flowRecord.Label + ' [v' + flowRecord.ActiveVersion.VersionNumber + ']');\n}\nSystem.debug('=== ACTIVE TRIGGER + FLOW OVERLAP ===');\nfor (String objectApiName : activeTriggersByObject.keySet()) {\n    if (activeFlowsByObject.containsKey(objectApiName)) {\n        System.debug('Object: ' + objectApiName);\n        System.debug('Triggers: ' + String.join(activeTriggersByObject.get(objectApiName), ', '));\n        System.debug('Flows: ' + String.join(activeFlowsByObject.get(objectApiName), ', '));\n        System.debug('----------------------------------------');\n    }\n}"
        },
        {
          id: 'ownership-skew-scan',
          label: 'Ownership Skew Scan',
          description: 'Template to measure concentration of child records under a single owner or parent for hotspot analysis.',
          tooltip: 'Replace the target object and relationship fields to evaluate potential lookup or account data skew.',
          code: "String CHILD_OBJECT = 'Case';\nString GROUPING_FIELD = 'OwnerId';\nString dynamicAggregateSoql = 'SELECT ' + GROUPING_FIELD + ' groupField, COUNT(Id) recordCount FROM ' + CHILD_OBJECT + ' GROUP BY ' + GROUPING_FIELD + ' ORDER BY COUNT(Id) DESC LIMIT 25';\nSystem.debug('Running aggregate: ' + dynamicAggregateSoql);\nfor (AggregateResult aggregateRow : Database.query(dynamicAggregateSoql)) {\n    System.debug('Group Value: ' + aggregateRow.get('groupField') + ' -> Count: ' + aggregateRow.get('recordCount'));\n}"
        },
        {
          id: 'large-batch-risk-objects',
          label: 'Large Batch Risk Objects',
          description: 'Counts high-volume objects commonly associated with batch and reporting pressure.',
          tooltip: 'Use for org health baselining before large cleanup or backfill jobs.',
          code: "List<String> objectApiNames = new List<String>{'Task','Event','Case','Opportunity','EmailMessage','ContentDocumentLink'};\nfor (String objectApiName : objectApiNames) {\n    try {\n        Integer totalCount = Database.countQuery('SELECT COUNT() FROM ' + objectApiName);\n        System.debug(objectApiName + ' | Count=' + totalCount);\n    } catch (Exception ex) {\n        System.debug(objectApiName + ' | Failed=' + ex.getMessage());\n    }\n}"
        },
        {
          id: 'flow-density-by-object',
          label: 'Flow Density by Object',
          description: 'Reports active flow density by target object or event.',
          tooltip: 'Helps detect objects overloaded with record-triggered automation.',
          code: "Map<String, Integer> flowCountByTarget = new Map<String, Integer>();\nfor (FlowDefinitionView flowRecord : [\n    SELECT Label, TriggerObjectOrEventApiName\n    FROM FlowDefinitionView\n    WHERE ActiveVersionId != null\n    LIMIT 1000\n]) {\n    String target = String.isBlank(flowRecord.TriggerObjectOrEventApiName) ? 'UNSPECIFIED' : flowRecord.TriggerObjectOrEventApiName;\n    flowCountByTarget.put(target, (flowCountByTarget.containsKey(target) ? flowCountByTarget.get(target) : 0) + 1);\n}\nfor (String target : flowCountByTarget.keySet()) {\n    System.debug('Target=' + target + ' | ActiveFlows=' + flowCountByTarget.get(target));\n}"
        },
        {
          id: 'query-selectivity-sample',
          label: 'Query Selectivity Sample',
          description: 'Template to compare total object count and filtered count while tuning support queries.',
          tooltip: 'Replace object and filter criteria to validate whether a support query is likely selective enough.',
          code: "String TARGET_OBJECT = 'Case';\nString FILTER_CLAUSE = 'CreatedDate = LAST_N_DAYS:30';\nInteger totalCount = Database.countQuery('SELECT COUNT() FROM ' + TARGET_OBJECT);\nInteger filteredCount = Database.countQuery('SELECT COUNT() FROM ' + TARGET_OBJECT + ' WHERE ' + FILTER_CLAUSE);\nSystem.debug('Object=' + TARGET_OBJECT + ' | Total=' + totalCount + ' | Filtered=' + filteredCount + ' | Filter=' + FILTER_CLAUSE);"
        }
      ]
    },
    {
      id: 'integration-api-monitoring',
      label: 'Integration & API Monitoring',
      description: 'Macros for integration-user review, platform events, outbound health, and API-adjacent diagnostics.',
      macros: [
        {
          id: 'integration-users-last-login',
          label: 'Integration Users Last Login Audit',
          description: 'Lists active users with common integration indicators and their last login dates.',
          tooltip: 'Good starting point for identifying stale or overused integration users.',
          code: "List<User> users = [\n    SELECT Id, Name, Username, Profile.Name, UserType, LastLoginDate, IsActive\n    FROM User\n    WHERE IsActive = true\n    ORDER BY LastLoginDate DESC\n    LIMIT 1000\n];\nSystem.debug('=== INTEGRATION-LIKE USER AUDIT ===');\nfor (User userRecord : users) {\n    String token = (userRecord.Username + ' ' + userRecord.Profile.Name).toLowerCase();\n    if (token.contains('integration') || token.contains('api') || token.contains('svc') || token.contains('service')) {\n        System.debug(userRecord.Name + ' | ' + userRecord.Username + ' | Profile=' + userRecord.Profile.Name + ' | LastLogin=' + userRecord.LastLoginDate);\n    }\n}"
        },
        {
          id: 'email-message-volume-last-30-days',
          label: 'EmailMessage Volume Last 30 Days',
          description: 'Counts recent email message records as a proxy for support communications and email-to-case load.',
          tooltip: 'Helpful when inbox-driven support pipelines seem delayed or overloaded.',
          code: "Integer emailCount = [SELECT COUNT() FROM EmailMessage WHERE CreatedDate = LAST_N_DAYS:30];\nSystem.debug('=== EMAILMESSAGE COUNT LAST 30 DAYS: ' + emailCount + ' ===');"
        },
        {
          id: 'platform-event-usage-baseline',
          label: 'Platform Event Usage Baseline',
          description: 'Template to count records for known platform event objects available in the org.',
          tooltip: 'Replace event API names with org-specific events to assess throughput patterns.',
          code: "List<String> eventObjectApiNames = new List<String>{'Your_Event__e'};\nMap<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();\nfor (String objectApiName : eventObjectApiNames) {\n    if (!globalDescribe.containsKey(objectApiName)) {\n        System.debug(objectApiName + ' | Not found in org');\n        continue;\n    }\n    try {\n        Integer totalCount = Database.countQuery('SELECT COUNT() FROM ' + objectApiName);\n        System.debug(objectApiName + ' | Count=' + totalCount);\n    } catch (Exception ex) {\n        System.debug(objectApiName + ' | Failed=' + ex.getMessage());\n    }\n}"
        },
        {
          id: 'recent-failed-platform-events-template',
          label: 'Recent Failed Platform Event Processing Template',
          description: 'Template macro for org-specific event monitoring using EventBusSubscriber objects where available.',
          tooltip: 'Adapt this template where custom platform event observability objects exist in the org.',
          code: "System.debug('Template macro: adapt for org-specific event monitoring tables, subscriber state objects, or custom logging objects.');"
        },
        {
          id: 'outbound-message-health-template',
          label: 'Outbound Message Health Template',
          description: 'Placeholder-free guidance macro for teams using workflow outbound messaging and custom logs.',
          tooltip: 'This macro documents a standard support pattern when no universal queryable object is available.',
          code: "System.debug('Review workflow outbound messaging from Setup plus any custom integration log object. Add org-specific SOQL here if a log table exists.');"
        }
      ]
    },
    {
      id: 'storage-data-governance',
      label: 'Storage & Data Governance',
      description: 'Macros for file growth, large data sets, attachment aging, and general storage-pressure discovery.',
      macros: [
        {
          id: 'largest-files-snapshot',
          label: 'Largest Files Snapshot',
          description: 'Lists the largest ContentDocuments in the org for storage triage.',
          tooltip: 'Useful during data storage incidents and cleanup planning.',
          code: "List<ContentDocument> docs = [\n    SELECT Id, Title, FileType, ContentSize, CreatedDate, OwnerId\n    FROM ContentDocument\n    ORDER BY ContentSize DESC\n    LIMIT 200\n];\nSystem.debug('=== LARGEST FILES SNAPSHOT ===');\nfor (ContentDocument docRecord : docs) {\n    System.debug(docRecord.Title + ' | SizeBytes=' + docRecord.ContentSize + ' | FileType=' + docRecord.FileType + ' | Created=' + docRecord.CreatedDate + ' | Id=' + docRecord.Id);\n}"
        },
        {
          id: 'old-files-snapshot',
          label: 'Old Files Snapshot',
          description: 'Lists older file content that may be suitable for archival review.',
          tooltip: 'Use for governance programs and long-term storage reduction analysis.',
          code: "List<ContentDocument> docs = [\n    SELECT Id, Title, FileType, ContentSize, CreatedDate\n    FROM ContentDocument\n    WHERE CreatedDate < :System.now().addYears(-2)\n    ORDER BY CreatedDate ASC\n    LIMIT 500\n];\nSystem.debug('=== FILES OLDER THAN 2 YEARS: ' + docs.size() + ' ===');\nfor (ContentDocument docRecord : docs) {\n    System.debug(docRecord.CreatedDate + ' | ' + docRecord.Title + ' | SizeBytes=' + docRecord.ContentSize + ' | Id=' + docRecord.Id);\n}"
        },
        {
          id: 'task-volume-last-year',
          label: 'Task Volume Last 12 Months',
          description: 'Counts task growth over the last year as a proxy for activity data pressure.',
          tooltip: 'Useful in orgs where Task is a major contributor to storage and reporting drag.',
          code: "for (AggregateResult ar : [\n    SELECT CALENDAR_MONTH(CreatedDate) monthNumber, COUNT(Id) totalCount\n    FROM Task\n    WHERE CreatedDate = LAST_N_MONTHS:12\n    GROUP BY CALENDAR_MONTH(CreatedDate)\n    ORDER BY CALENDAR_MONTH(CreatedDate)\n]) {\n    System.debug('Month=' + ar.get('monthNumber') + ' | TaskCount=' + ar.get('totalCount'));\n}"
        },
        {
          id: 'attachment-volume-template',
          label: 'Legacy Attachment Volume Template',
          description: 'Counts legacy Attachment records where still used in the org.',
          tooltip: 'Useful during migration from legacy attachments to Files.',
          code: "try {\n    Integer countValue = [SELECT COUNT() FROM Attachment];\n    System.debug('=== ATTACHMENT COUNT: ' + countValue + ' ===');\n} catch (Exception ex) {\n    System.debug('Attachment query failed: ' + ex.getMessage());\n}"
        },
        {
          id: 'record-growth-baseline-template',
          label: 'Record Growth Baseline Template',
          description: 'Template to baseline monthly growth for a target object.',
          tooltip: 'Replace the target object to track growth trends before archival design.',
          code: "String TARGET_OBJECT = 'Case';\nString soql = 'SELECT CALENDAR_YEAR(CreatedDate) yr, CALENDAR_MONTH(CreatedDate) mon, COUNT(Id) totalCount FROM ' + TARGET_OBJECT + ' WHERE CreatedDate = LAST_N_MONTHS:12 GROUP BY CALENDAR_YEAR(CreatedDate), CALENDAR_MONTH(CreatedDate) ORDER BY CALENDAR_YEAR(CreatedDate), CALENDAR_MONTH(CreatedDate)';\nfor (AggregateResult ar : Database.query(soql)) {\n    System.debug('Year=' + ar.get('yr') + ' | Month=' + ar.get('mon') + ' | Count=' + ar.get('totalCount'));\n}"
        }
      ]
    },
    {
      id: 'org-configuration-audit',
      label: 'Org Configuration Audit',
      description: 'Macros to inspect profiles, queues, record types, roles, business hours, and general setup footprint.',
      macros: [
        {
          id: 'queue-membership-summary',
          label: 'Queue Membership Summary',
          description: 'Lists queues and membership counts for support-owned queue troubleshooting.',
          tooltip: 'Useful when work is not routing as expected or queue access seems broken.',
          code: "Map<Id, Integer> memberCountByQueue = new Map<Id, Integer>();\nfor (AggregateResult ar : [\n    SELECT GroupId queueId, COUNT(Id) totalCount\n    FROM GroupMember\n    GROUP BY GroupId\n]) {\n    memberCountByQueue.put((Id) ar.get('queueId'), (Integer) ar.get('totalCount'));\n}\nList<Group> queues = [\n    SELECT Id, Name, Type\n    FROM Group\n    WHERE Type = 'Queue'\n    ORDER BY Name\n    LIMIT 500\n];\nSystem.debug('=== QUEUE MEMBERSHIP SUMMARY ===');\nfor (Group queueRecord : queues) {\n    System.debug(queueRecord.Name + ' | Members=' + (memberCountByQueue.containsKey(queueRecord.Id) ? memberCountByQueue.get(queueRecord.Id) : 0));\n}"
        },
        {
          id: 'record-type-inventory-template',
          label: 'Record Type Inventory',
          description: 'Lists record types for common business objects.',
          tooltip: 'Useful in data-fix and page-layout mismatch investigations.',
          code: "List<RecordType> recordTypes = [\n    SELECT Id, Name, DeveloperName, SObjectType, IsActive\n    FROM RecordType\n    ORDER BY SObjectType, DeveloperName\n    LIMIT 1000\n];\nSystem.debug('=== RECORD TYPE INVENTORY ===');\nfor (RecordType recordTypeRecord : recordTypes) {\n    System.debug(recordTypeRecord.SObjectType + ' | ' + recordTypeRecord.DeveloperName + ' | Active=' + recordTypeRecord.IsActive);\n}"
        },
        {
          id: 'business-hours-holiday-audit',
          label: 'Business Hours & Holiday Audit',
          description: 'Lists configured business hours and holidays for SLA troubleshooting.',
          tooltip: 'Useful in Case escalation and entitlement investigations.',
          code: "List<BusinessHours> hoursList = [\n    SELECT Id, Name, IsActive, TimeZoneSidKey\n    FROM BusinessHours\n    ORDER BY Name\n    LIMIT 200\n];\nSystem.debug('=== BUSINESS HOURS ===');\nfor (BusinessHours bh : hoursList) {\n    System.debug(bh.Name + ' | Active=' + bh.IsActive + ' | TZ=' + bh.TimeZoneSidKey);\n}\ntry {\n    List<Holiday> holidayList = [SELECT Id, Name, ActivityDate FROM Holiday ORDER BY ActivityDate LIMIT 500];\n    System.debug('=== HOLIDAYS ===');\n    for (Holiday holidayRecord : holidayList) {\n        System.debug(holidayRecord.ActivityDate + ' | ' + holidayRecord.Name);\n    }\n} catch (Exception ex) {\n    System.debug('Holiday query failed: ' + ex.getMessage());\n}"
        },
        {
          id: 'role-hierarchy-depth-snapshot',
          label: 'Role Hierarchy Snapshot',
          description: 'Lists roles and parent relationships for quick sharing model support review.',
          tooltip: 'Helpful in visibility debugging and org-design mapping.',
          code: "List<UserRole> roles = [\n    SELECT Id, Name, ParentRoleId, RollupDescription, OpportunityAccessForAccountOwner, CaseAccessForAccountOwner, ContactAccessForAccountOwner\n    FROM UserRole\n    ORDER BY Name\n    LIMIT 1000\n];\nSystem.debug('=== ROLE HIERARCHY SNAPSHOT ===');\nfor (UserRole roleRecord : roles) {\n    System.debug(roleRecord.Name + ' | Parent=' + roleRecord.ParentRoleId + ' | OppAccess=' + roleRecord.OpportunityAccessForAccountOwner + ' | CaseAccess=' + roleRecord.CaseAccessForAccountOwner + ' | ContactAccess=' + roleRecord.ContactAccessForAccountOwner);\n}"
        },
        {
          id: 'profile-inventory',
          label: 'Profile Inventory',
          description: 'Lists profiles and core admin-style permissions for fast org-access review.',
          tooltip: 'Useful in support transitions and access governance baselining.',
          code: "List<Profile> profiles = [\n    SELECT Id, Name, PermissionsModifyAllData, PermissionsApiEnabled, PermissionsViewAllData, UserLicense.Name\n    FROM Profile\n    ORDER BY Name\n    LIMIT 1000\n];\nSystem.debug('=== PROFILE INVENTORY ===');\nfor (Profile profileRecord : profiles) {\n    System.debug(profileRecord.Name + ' | License=' + (profileRecord.UserLicense != null ? profileRecord.UserLicense.Name : 'N/A') + ' | API=' + profileRecord.PermissionsApiEnabled + ' | ViewAll=' + profileRecord.PermissionsViewAllData + ' | ModifyAll=' + profileRecord.PermissionsModifyAllData);\n}"
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
