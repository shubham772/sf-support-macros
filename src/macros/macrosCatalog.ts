/*
 * Compact support macros catalog with practical Salesforce development snippets.
 */
export const SUPPORT_MACROS_CATALOG = {
  categories: [
    {
      id: 'apex-lwc-development',
      label: 'Apex & LWC',
      description:
        'Reusable development snippets for Apex architecture, testability, and LWC integration.',
      macros: [
        {
          id: 'bulk-safe-trigger-handler-template',
          label: 'Bulk-Safe Trigger Handler Template',
          description:
            'Template for one-trigger-per-object pattern with before/after event routing.',
          tooltip:
            'Use as a starting point for scalable trigger handler architecture.',
          code:
            "public with sharing class AccountTriggerHandler {\n    public static void beforeInsert(List<Account> newList) {\n        // Validate records before insert\n    }\n\n    public static void beforeUpdate(Map<Id, Account> oldMap, Map<Id, Account> newMap) {\n        // Compare old vs new and stage DML outside loops\n    }\n\n    public static void afterInsert(List<Account> newList) {\n        // Enqueue async work if needed\n    }\n}\n\ntrigger AccountTrigger on Account (before insert, before update, after insert) {\n    if (Trigger.isBefore && Trigger.isInsert) {\n        AccountTriggerHandler.beforeInsert(Trigger.new);\n    }\n    if (Trigger.isBefore && Trigger.isUpdate) {\n        AccountTriggerHandler.beforeUpdate(Trigger.oldMap, Trigger.newMap);\n    }\n    if (Trigger.isAfter && Trigger.isInsert) {\n        AccountTriggerHandler.afterInsert(Trigger.new);\n    }\n}"
        },
        {
          id: 'queueable-with-callout-template',
          label: 'Queueable with Callout Template',
          description:
            'Queueable class implementing Database.AllowsCallouts with structured response handling.',
          tooltip:
            'Use for non-blocking integrations and external API retries.',
          code:
            "public with sharing class ExampleCalloutJob implements Queueable, Database.AllowsCallouts {\n    private final Set<Id> recordIds;\n\n    public ExampleCalloutJob(Set<Id> recordIds) {\n        this.recordIds = recordIds == null ? new Set<Id>() : recordIds.clone();\n    }\n\n    public void execute(QueueableContext qc) {\n        HttpRequest req = new HttpRequest();\n        req.setMethod('POST');\n        req.setEndpoint('callout:My_Named_Credential/v1/sync');\n        req.setHeader('Content-Type', 'application/json');\n        req.setBody(JSON.serialize(new Map<String, Object>{ 'ids' => recordIds }));\n\n        HttpResponse res = new Http().send(req);\n        if (res.getStatusCode() >= 300) {\n            System.debug(LoggingLevel.ERROR, 'Callout failed: ' + res.getBody());\n        }\n    }\n}\n\n// Example enqueue\nSystem.enqueueJob(new ExampleCalloutJob(new Set<Id>{ '001000000000001AAA' }));"
        },
        {
          id: 'lwc-imperative-apex-template',
          label: 'LWC Imperative Apex + Error Pattern',
          description:
            'Template for imperative Apex call with consistent loading and error state handling.',
          tooltip:
            'Improves LWC UX by normalizing async success/error states.',
          code:
            "import { LightningElement, track } from 'lwc';\nimport findAccounts from '@salesforce/apex/AccountSearchController.findAccounts';\n\nexport default class AccountSearch extends LightningElement {\n    @track rows = [];\n    @track errorMessage;\n    isLoading = false;\n\n    async handleSearch(term) {\n        this.isLoading = true;\n        this.errorMessage = undefined;\n\n        try {\n            const result = await findAccounts({ searchText: term });\n            this.rows = result || [];\n        } catch (error) {\n            this.errorMessage = error?.body?.message || error?.message || 'Unknown error';\n        } finally {\n            this.isLoading = false;\n        }\n    }\n}"
        },
        {
          id: 'apex-selector-pattern-template',
          label: 'Apex Selector Pattern Template',
          description:
            'Selector class for centralized SOQL access and field-set reuse.',
          tooltip:
            'Use selectors to reduce duplicated SOQL across services and triggers.',
          code:
            "public with sharing class AccountSelector {\n    public static final List<String> BASE_FIELDS = new List<String>{\n        'Id', 'Name', 'Type', 'OwnerId', 'CreatedDate'\n    };\n\n    public static List<Account> selectByIds(Set<Id> accountIds) {\n        if (accountIds == null || accountIds.isEmpty()) {\n            return new List<Account>();\n        }\n\n        return [\n            SELECT Id, Name, Type, OwnerId, CreatedDate\n            FROM Account\n            WHERE Id IN :accountIds\n        ];\n    }\n\n    public static List<Account> selectRecent(Integer limitSize) {\n        Integer safeLimit = Math.max(1, Math.min(limitSize == null ? 50 : limitSize, 500));\n        return [\n            SELECT Id, Name, Type, OwnerId, CreatedDate\n            FROM Account\n            ORDER BY CreatedDate DESC\n            LIMIT :safeLimit\n        ];\n    }\n}"
        },
        {
          id: 'apex-service-layer-template',
          label: 'Apex Service Layer Template',
          description:
            'Service class template that centralizes business logic and validation.',
          tooltip:
            'Use service layer to keep triggers/controllers thin and testable.',
          code:
            "public with sharing class OpportunityService {\n    public static void applyStageDefaults(List<Opportunity> records) {\n        if (records == null || records.isEmpty()) {\n            return;\n        }\n\n        for (Opportunity opp : records) {\n            if (String.isBlank(opp.StageName)) {\n                opp.StageName = 'Prospecting';\n            }\n            if (opp.CloseDate == null) {\n                opp.CloseDate = Date.today().addDays(30);\n            }\n        }\n    }\n}"
        },
        {
          id: 'apex-domain-layer-template',
          label: 'Apex Domain Layer Template',
          description:
            'Domain wrapper template for encapsulating object-specific behavior.',
          tooltip:
            'Use domain classes for invariants and lifecycle-specific behavior.',
          code:
            "public with sharing class AccountDomain {\n    private final List<Account> records;\n\n    public AccountDomain(List<Account> records) {\n        this.records = records == null ? new List<Account>() : records;\n    }\n\n    public void normalize() {\n        for (Account a : records) {\n            if (a.Name != null) {\n                a.Name = a.Name.trim();\n            }\n        }\n    }\n\n    public void enforceInvariants() {\n        for (Account a : records) {\n            if (String.isBlank(a.Name)) {\n                a.addError('Account Name is required.');\n            }\n        }\n    }\n}"
        },
        {
          id: 'apex-unit-of-work-template',
          label: 'Apex Unit Of Work (No Library)',
          description:
            'Simple unit-of-work style staging for insert/update/delete in one commit block.',
          tooltip:
            'Supports consistent DML orchestration and easier rollback strategy.',
          code:
            "public with sharing class SimpleUnitOfWork {\n    public List<SObject> inserts = new List<SObject>();\n    public List<SObject> updates = new List<SObject>();\n    public List<SObject> deletes = new List<SObject>();\n\n    public void registerInsert(SObject row) { if (row != null) inserts.add(row); }\n    public void registerUpdate(SObject row) { if (row != null) updates.add(row); }\n    public void registerDelete(SObject row) { if (row != null) deletes.add(row); }\n\n    public void commit() {\n        if (!inserts.isEmpty()) insert inserts;\n        if (!updates.isEmpty()) update updates;\n        if (!deletes.isEmpty()) delete deletes;\n    }\n}\n\n// Usage\n// SimpleUnitOfWork uow = new SimpleUnitOfWork();\n// uow.registerUpdate(myAccount);\n// uow.commit();"
        },
        {
          id: 'trigger-recursion-guard-template',
          label: 'Trigger Recursion Guard Template',
          description:
            'Static recursion guard pattern for update loops and chained DML operations.',
          tooltip:
            'Use when same-object DML can re-enter trigger logic.',
          code:
            "public with sharing class TriggerExecutionGuard {\n    private static Set<String> scopeKeys = new Set<String>();\n\n    public static Boolean shouldRun(String key) {\n        if (scopeKeys.contains(key)) {\n            return false;\n        }\n        scopeKeys.add(key);\n        return true;\n    }\n}\n\n// In trigger handler\nif (!TriggerExecutionGuard.shouldRun('Account.afterUpdate')) {\n    return;\n}"
        },
        {
          id: 'invocable-method-template',
          label: 'Invocable Method for Flow Template',
          description:
            'Flow-ready invocable method with request/response wrapper classes.',
          tooltip:
            'Use for reusable business actions from Flow and Process orchestration.',
          code:
            "public with sharing class CaseEscalationAction {\n    public class Request {\n        @InvocableVariable(required=true) public Id caseId;\n        @InvocableVariable public String reason;\n    }\n\n    public class Response {\n        @InvocableVariable public Id caseId;\n        @InvocableVariable public String status;\n    }\n\n    @InvocableMethod(label='Escalate Cases' description='Escalates selected cases')\n    public static List<Response> escalate(List<Request> requests) {\n        List<Response> responses = new List<Response>();\n        for (Request req : requests) {\n            Response res = new Response();\n            res.caseId = req.caseId;\n            res.status = 'Escalated';\n            responses.add(res);\n        }\n        return responses;\n    }\n}"
        },
        {
          id: 'batchable-template-stateful',
          label: 'Batchable + Stateful Template',
          description:
            'Batch Apex template with stateful counters for large data operations.',
          tooltip:
            'Use for millions of records and summary reporting in finish().',
          code:
            "global with sharing class AccountBatchJob implements Database.Batchable<SObject>, Database.Stateful {\n    global Integer processed = 0;\n\n    global Database.QueryLocator start(Database.BatchableContext bc) {\n        return Database.getQueryLocator([\n            SELECT Id, Name FROM Account WHERE IsDeleted = false\n        ]);\n    }\n\n    global void execute(Database.BatchableContext bc, List<Account> scope) {\n        for (Account a : scope) {\n            processed++;\n        }\n    }\n\n    global void finish(Database.BatchableContext bc) {\n        System.debug('Batch completed. Processed=' + processed);\n    }\n}\n\n// Database.executeBatch(new AccountBatchJob(), 200);"
        },
        {
          id: 'schedulable-template',
          label: 'Schedulable Template',
          description:
            'Schedulable Apex class template for periodic orchestration jobs.',
          tooltip:
            'Pair with Queueable/Batchable for resilient scheduled processing.',
          code:
            "global with sharing class NightlyMaintenanceScheduler implements Schedulable {\n    global void execute(SchedulableContext sc) {\n        System.enqueueJob(new ExampleCalloutJob(new Set<Id>()));\n    }\n}\n\n// Schedule expression: second minute hour day month day_of_week optional_year\n// System.schedule('Nightly Maintenance', '0 0 2 * * ?', new NightlyMaintenanceScheduler());"
        },
        {
          id: 'platform-event-publisher-template',
          label: 'Platform Event Publisher Template',
          description:
            'Template to publish custom platform events with save result checks.',
          tooltip:
            'Use for loose coupling across domains and external subscribers.',
          code:
            "My_Integration_Event__e evt = new My_Integration_Event__e(\n    Correlation_Id__c = String.valueOf(Crypto.getRandomLong()),\n    Event_Type__c = 'ORDER_SYNC',\n    Payload__c = '{\"status\":\"STARTED\"}'\n);\n\nDatabase.SaveResult sr = EventBus.publish(evt);\nif (!sr.isSuccess()) {\n    for (Database.Error err : sr.getErrors()) {\n        System.debug(LoggingLevel.ERROR, err.getMessage());\n    }\n}"
        },
        {
          id: 'platform-event-trigger-template',
          label: 'Platform Event Trigger Template',
          description:
            'Trigger template for processing incoming platform event payloads.',
          tooltip:
            'Use idempotency keys to protect downstream systems from duplicates.',
          code:
            "trigger MyIntegrationEventTrigger on My_Integration_Event__e (after insert) {\n    for (My_Integration_Event__e evt : Trigger.New) {\n        System.debug('Correlation=' + evt.Correlation_Id__c + ', Type=' + evt.Event_Type__c);\n        // Route by event type, then enqueue worker queueable\n    }\n}"
        },
        {
          id: 'strip-inaccessible-template',
          label: 'FLS with Security.stripInaccessible',
          description:
            'Read/write field-level security sanitization template for Apex services.',
          tooltip:
            'Use before DML and before returning records to caller contexts.',
          code:
            "List<Account> rows = [SELECT Id, Name, AnnualRevenue FROM Account LIMIT 200];\nSecurity.SObjectAccessDecision readable = Security.stripInaccessible(\n    AccessType.READABLE,\n    rows\n);\nList<Account> safeRows = (List<Account>) readable.getRecords();\n\nfor (Account a : safeRows) {\n    a.Name = a.Name + ' - reviewed';\n}\n\nSecurity.SObjectAccessDecision updatable = Security.stripInaccessible(\n    AccessType.UPDATABLE,\n    safeRows\n);\nupdate (List<Account>) updatable.getRecords();"
        },
        {
          id: 'with-sharing-user-mode-template',
          label: 'User Mode DML/SOQL Pattern',
          description:
            'Shows USER_MODE database operations for least-privilege access.',
          tooltip:
            'Use when enforcing running-user row/object permissions in Apex.',
          code:
            "List<Account> rows = [SELECT Id, Name FROM Account WITH USER_MODE LIMIT 50];\nfor (Account a : rows) {\n    a.Name = a.Name + ' (User Mode)';\n}\nDatabase.update(rows, AccessLevel.USER_MODE);"
        },
        {
          id: 'apex-http-callout-named-credential-template',
          label: 'HTTP Callout with Named Credential',
          description:
            'REST callout template using Named Credential endpoint and robust status checks.',
          tooltip:
            'Use Named Credentials for secure auth and endpoint management.',
          code:
            "HttpRequest req = new HttpRequest();\nreq.setEndpoint('callout:My_Named_Credential/v1/accounts');\nreq.setMethod('GET');\nreq.setTimeout(20000);\n\nHttpResponse res = new Http().send(req);\nInteger code = res.getStatusCode();\nif (code >= 200 && code < 300) {\n    System.debug('Success: ' + res.getBody());\n} else {\n    System.debug(LoggingLevel.ERROR, 'Callout failed [' + code + '] ' + res.getBody());\n}"
        },
        {
          id: 'apex-test-data-factory-template',
          label: 'Apex Test Data Factory Template',
          description:
            'Reusable @isTest data factory pattern for deterministic test setup.',
          tooltip:
            'Use centralized builders to reduce duplicated test setup code.',
          code:
            "@isTest\npublic class TestDataFactory {\n    public static Account createAccount(Boolean doInsert) {\n        Account a = new Account(Name = 'TDF Account ' + System.now().getTime());\n        if (doInsert) {\n            insert a;\n        }\n        return a;\n    }\n\n    public static Contact createContact(Id accountId, Boolean doInsert) {\n        Contact c = new Contact(FirstName = 'TDF', LastName = 'Contact', AccountId = accountId);\n        if (doInsert) {\n            insert c;\n        }\n        return c;\n    }\n}"
        },
        {
          id: 'apex-test-callout-mock-template',
          label: 'Apex HttpCalloutMock Test Template',
          description:
            'Template for mocking HTTP callouts in unit tests with Test.setMock.',
          tooltip:
            'Use to keep tests isolated from external systems and network.',
          code:
            "@isTest\nprivate class ExampleCalloutMock implements HttpCalloutMock {\n    public HttpResponse respond(HttpRequest req) {\n        HttpResponse res = new HttpResponse();\n        res.setStatusCode(200);\n        res.setBody('{\"ok\":true}');\n        return res;\n    }\n}\n\n@isTest\nstatic void testCallout() {\n    Test.setMock(HttpCalloutMock.class, new ExampleCalloutMock());\n    Test.startTest();\n    // invoke code that performs Http.send()\n    Test.stopTest();\n    System.assert(true);\n}"
        },
        {
          id: 'lwc-wire-refreshapex-template',
          label: 'LWC @wire + refreshApex Template',
          description:
            'LWC template for caching wired data and performing explicit refresh.',
          tooltip:
            'Useful for record save flows and post-mutation refresh UX.',
          code:
            "import { LightningElement, wire } from 'lwc';\nimport getOpenCases from '@salesforce/apex/CaseController.getOpenCases';\nimport { refreshApex } from '@salesforce/apex';\n\nexport default class OpenCaseList extends LightningElement {\n    rows = [];\n    wiredResult;\n\n    @wire(getOpenCases)\n    wiredCases(result) {\n        this.wiredResult = result;\n        if (result.data) {\n            this.rows = result.data;\n        }\n    }\n\n    async handleRefresh() {\n        await refreshApex(this.wiredResult);\n    }\n}"
        },
        {
          id: 'lwc-datatable-row-action-template',
          label: 'LWC Datatable Row Action Template',
          description:
            'Datatable columns and row-action handler template for admin UX flows.',
          tooltip:
            'Use for quick admin actions like view/edit/delete on list records.',
          code:
            "import { LightningElement } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\n\nconst actions = [\n    { label: 'View', name: 'view' },\n    { label: 'Edit', name: 'edit' }\n];\n\nconst columns = [\n    { label: 'Name', fieldName: 'Name' },\n    { label: 'Status', fieldName: 'Status__c' },\n    { type: 'action', typeAttributes: { rowActions: actions } }\n];\n\nexport default class RecordGrid extends NavigationMixin(LightningElement) {\n    columns = columns;\n\n    handleRowAction(event) {\n        const actionName = event.detail.action.name;\n        const row = event.detail.row;\n\n        if (actionName === 'view') {\n            this[NavigationMixin.Navigate]({\n                type: 'standard__recordPage',\n                attributes: { recordId: row.Id, actionName: 'view' }\n            });\n        }\n    }\n}"
        },
        {
          id: 'lwc-lightning-message-service-template',
          label: 'LWC Lightning Message Service Template',
          description:
            'Publish/subscribe template for cross-component communication.',
          tooltip:
            'Use LMS when sibling or unrelated components need decoupled messaging.',
          code:
            "import { LightningElement, wire } from 'lwc';\nimport { publish, subscribe, MessageContext } from 'lightning/messageService';\nimport SAMPLE_CHANNEL from '@salesforce/messageChannel/SampleChannel__c';\n\nexport default class LmsExample extends LightningElement {\n    subscription;\n\n    @wire(MessageContext)\n    messageContext;\n\n    connectedCallback() {\n        this.subscription = subscribe(this.messageContext, SAMPLE_CHANNEL, (message) => {\n            // handle message\n            console.log(message);\n        });\n    }\n\n    sendMessage() {\n        publish(this.messageContext, SAMPLE_CHANNEL, { source: 'publisher', value: 'hello' });\n    }\n}"
        },
        {
          id: 'lwc-navigation-mixin-template',
          label: 'LWC NavigationMixin Template',
          description:
            'Template for record, list view, and web page navigation actions.',
          tooltip:
            'Use for consistent UX navigation without hard-coded URLs.',
          code:
            "import { LightningElement } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\n\nexport default class Navigator extends NavigationMixin(LightningElement) {\n    goToRecord(recordId) {\n        this[NavigationMixin.Navigate]({\n            type: 'standard__recordPage',\n            attributes: { recordId, actionName: 'view' }\n        });\n    }\n\n    goToListView() {\n        this[NavigationMixin.Navigate]({\n            type: 'standard__objectPage',\n            attributes: { objectApiName: 'Account', actionName: 'list' },\n            state: { filterName: 'Recent' }\n        });\n    }\n}"
        },
        {
          id: 'lwc-record-edit-form-template',
          label: 'LWC lightning-record-edit-form Template',
          description:
            'LWC template for declarative create/update forms with submit hooks.',
          tooltip:
            'Use when standard LDS form behavior is enough and code should stay light.',
          code:
            "<template>\n    <lightning-record-edit-form object-api-name='Contact' onsuccess={handleSuccess} onsubmit={handleSubmit}>\n        <lightning-messages></lightning-messages>\n        <lightning-input-field field-name='FirstName'></lightning-input-field>\n        <lightning-input-field field-name='LastName'></lightning-input-field>\n        <lightning-button type='submit' variant='brand' label='Save'></lightning-button>\n    </lightning-record-edit-form>\n</template>\n\n// JS\nhandleSubmit(event) {\n    // event.preventDefault(); // mutate fields if needed\n}\n\nhandleSuccess(event) {\n    console.log('Saved Id', event.detail.id);\n}"
        },
        {
          id: 'lwc-toast-error-util-template',
          label: 'LWC Toast + Error Utility Template',
          description:
            'Reusable helper for extracting Apex/UI API errors and showing toasts.',
          tooltip:
            'Standardized user feedback pattern across components.',
          code:
            "import { ShowToastEvent } from 'lightning/platformShowToastEvent';\n\nexport function reduceErrors(error) {\n    if (!error) return ['Unknown error'];\n\n    if (Array.isArray(error.body)) {\n        return error.body.map((e) => e.message);\n    }\n\n    if (error.body && typeof error.body.message === 'string') {\n        return [error.body.message];\n    }\n\n    return [error.message || 'Unknown error'];\n}\n\nexport function showErrorToast(component, error) {\n    component.dispatchEvent(\n        new ShowToastEvent({\n            title: 'Error',\n            message: reduceErrors(error).join('; '),\n            variant: 'error'\n        })\n    );\n}"
        },
        {
          id: 'lwc-debounce-search-template',
          label: 'LWC Debounced Search Template',
          description:
            'Debounce pattern for search inputs to avoid server call storms.',
          tooltip:
            'Use for responsive lookup/search experiences in LWC.',
          code:
            "import { LightningElement } from 'lwc';\nimport searchAccounts from '@salesforce/apex/AccountSearchController.search';\n\nexport default class DebouncedSearch extends LightningElement {\n    searchTerm = '';\n    delayTimeout;\n    rows = [];\n\n    handleChange(event) {\n        this.searchTerm = event.target.value;\n        window.clearTimeout(this.delayTimeout);\n\n        this.delayTimeout = setTimeout(async () => {\n            this.rows = await searchAccounts({ term: this.searchTerm });\n        }, 300);\n    }\n}"
        },
        {
          id: 'lwc-jest-test-template',
          label: 'LWC Jest Test Template',
          description:
            'Jest unit test skeleton for rendering and interaction assertions.',
          tooltip:
            'Use for fast frontend regression coverage on LWC components.',
          code:
            "import { createElement } from 'lwc';\nimport MyComponent from 'c/myComponent';\n\ndescribe('c-my-component', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n    });\n\n    it('renders and handles click', async () => {\n        const element = createElement('c-my-component', {\n            is: MyComponent\n        });\n        document.body.appendChild(element);\n\n        const button = element.shadowRoot.querySelector('lightning-button');\n        button.click();\n\n        await Promise.resolve();\n        expect(element).not.toBeNull();\n    });\n});"
        },
        {
          id: 'lwc-paginated-list-template',
          label: 'LWC Client Pagination Template',
          description:
            'Client-side pagination helpers for medium-sized result sets.',
          tooltip:
            'Good for UX when result set is already loaded in memory.',
          code:
            "import { LightningElement, track } from 'lwc';\n\nexport default class PaginatedList extends LightningElement {\n    @track rows = [];\n    pageSize = 20;\n    pageNumber = 1;\n\n    get totalPages() {\n        return Math.max(1, Math.ceil(this.rows.length / this.pageSize));\n    }\n\n    get pagedRows() {\n        const start = (this.pageNumber - 1) * this.pageSize;\n        return this.rows.slice(start, start + this.pageSize);\n    }\n\n    nextPage() {\n        this.pageNumber = Math.min(this.totalPages, this.pageNumber + 1);\n    }\n\n    prevPage() {\n        this.pageNumber = Math.max(1, this.pageNumber - 1);\n    }\n}"
        },
        {
          id: 'lwc-static-resource-loader-template',
          label: 'LWC Static Resource Loader Template',
          description:
            'Template for loading JS/CSS static resources safely in renderedCallback.',
          tooltip:
            'Use for controlled integration of third-party client libraries.',
          code:
            "import { LightningElement } from 'lwc';\nimport { loadScript, loadStyle } from 'lightning/platformResourceLoader';\nimport LIB_RESOURCE from '@salesforce/resourceUrl/myLib';\n\nexport default class ResourceLoader extends LightningElement {\n    initialized = false;\n\n    async renderedCallback() {\n        if (this.initialized) {\n            return;\n        }\n        this.initialized = true;\n\n        await Promise.all([\n            loadScript(this, LIB_RESOURCE + '/myLib.js'),\n            loadStyle(this, LIB_RESOURCE + '/myLib.css')\n        ]);\n    }\n}"
        },
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
      id: 'debugging-and-diagnostics',
      label: 'Debugging',
      description: 'Targeted diagnostics for limits, async failures, and runtime exceptions.',
      macros: [
        {
          id: 'governor-limits-snapshot',
          label: 'Governor Limits Snapshot',
          description: 'Prints current transaction limit usage for quick triage.',
          tooltip: 'Useful inside handlers to detect approaching limits early.',
          code:
            "System.debug('DML Statements: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());\nSystem.debug('DML Rows: ' + Limits.getDmlRows() + '/' + Limits.getLimitDmlRows());\nSystem.debug('SOQL Queries: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());\nSystem.debug('SOQL Rows: ' + Limits.getQueryRows() + '/' + Limits.getLimitQueryRows());\nSystem.debug('CPU Time: ' + Limits.getCpuTime() + '/' + Limits.getLimitCpuTime());\nSystem.debug('Heap Size: ' + Limits.getHeapSize() + '/' + Limits.getLimitHeapSize());"
        },
        {
          id: 'recent-apex-exceptions',
          label: 'Query Recent Apex Exceptions',
          description: 'Queries ApexLog for likely exception events in the last 24 hours.',
          tooltip: 'Helps correlate failures to users, operations, and timestamps.',
          code:
            "Datetime sinceTime = System.now().addHours(-24);\nfor (ApexLog logRow : [\n    SELECT Id, LogUser.Name, Operation, Status, StartTime, DurationMilliseconds\n    FROM ApexLog\n    WHERE StartTime >= :sinceTime\n    AND (Status = 'Error' OR Status = 'Assert')\n    ORDER BY StartTime DESC\n    LIMIT 200\n]) {\n    System.debug(logRow.StartTime + ' | ' + logRow.LogUser.Name + ' | ' + logRow.Operation + ' | ' + logRow.Status + ' | ' + logRow.DurationMilliseconds + 'ms');\n}"
        },
        {
          id: 'scheduled-jobs-health-check',
          label: 'Scheduled Jobs Health Check',
          description: 'Lists recently completed or failed scheduled jobs.',
          tooltip: 'Verify scheduler health and timing drift after deployments.',
          code:
            "Datetime sinceTime = System.now().addDays(-3);\nfor (CronTrigger ct : [\n    SELECT Id, CronJobDetail.Name, State, NextFireTime, PreviousFireTime, TimesTriggered\n    FROM CronTrigger\n    WHERE CreatedDate >= :sinceTime\n    ORDER BY PreviousFireTime DESC\n    LIMIT 200\n]) {\n    System.debug(ct.CronJobDetail.Name + ' | State=' + ct.State + ' | Next=' + ct.NextFireTime + ' | Prev=' + ct.PreviousFireTime + ' | Runs=' + ct.TimesTriggered);\n}"
        },
        {
          id: 'track-frozen-user-accounts',
          label: 'Track Frozen User Accounts',
          description: 'Lists frozen user login rows.',
          tooltip: 'Run to surface frozen UserLogin records.',
          code:
            "for (UserLogin ul : [SELECT Id, User.Username, User.Name, IsFrozen FROM UserLogin WHERE IsFrozen = true LIMIT 200]) {\n    System.debug(ul.User.Name + ' (' + ul.User.Username + ') - Frozen=' + ul.IsFrozen);\n}"
        },
        {
          id: 'permission-set-assignment-check',
          label: 'Permission Set Assignment Check',
          description:
            'Checks whether a user has a specific permission set assignment.',
          tooltip: 'Replace targetUsername and permissionSetApiName before running.',
          code:
            "String targetUsername = 'user@example.com';\nString permissionSetApiName = 'My_Permission_Set';\n\nList<PermissionSetAssignment> psa = [\n    SELECT Assignee.Username, PermissionSet.Name\n    FROM PermissionSetAssignment\n    WHERE Assignee.Username = :targetUsername\n    AND PermissionSet.Name = :permissionSetApiName\n    LIMIT 10\n];\n\nSystem.debug('Assignments found: ' + psa.size());\nfor (PermissionSetAssignment row : psa) {\n    System.debug(row.Assignee.Username + ' -> ' + row.PermissionSet.Name);\n}"
        }
      ]
    },
    {
      id: 'deployment-and-cli',
      label: 'Deployment & CLI',
      description: 'Snippets for deployment readiness and post-deploy verification.',
      macros: [
        {
          id: 'run-specified-tests-snippet',
          label: 'Run Specified Tests Command',
          description: 'CLI command template for running selected Apex tests.',
          tooltip: 'Update class names and run in terminal.',
          code:
            "sf apex run test --class-names AccountServiceTest,OpportunityServiceTest --result-format human --wait 30"
        },
        {
          id: 'deploy-checkonly-snippet',
          label: 'Deploy Check-Only Command',
          description: 'CLI command template for validation-only deployment.',
          tooltip: 'Use before production deployment to validate metadata and tests.',
          code:
            "sf project deploy start --manifest manifest/package.xml --test-level RunLocalTests --dry-run"
        },
        {
          id: 'quick-package-xml-template',
          label: 'Minimal package.xml Template',
          description: 'Minimal package.xml starter for targeted metadata deployment.',
          tooltip: 'Edit members and API version to match your org and metadata set.',
          code:
            "<?xml version='1.0' encoding='UTF-8'?>\n<Package xmlns='http://soap.sforce.com/2006/04/metadata'>\n    <types>\n        <members>AccountTrigger</members>\n        <name>ApexTrigger</name>\n    </types>\n    <types>\n        <members>AccountTriggerHandler</members>\n        <name>ApexClass</name>\n    </types>\n    <version>62.0</version>\n</Package>"
        }
      ]
    },
    {
      id: 'data-operations',
      label: 'Data Operations',
      description: 'SOQL and data quality snippets for development and support triage.',
      macros: [
        {
          id: 'selective-soql-check',
          label: 'Selective SOQL Check Template',
          description:
            'Query pattern that encourages indexed filters and explicit field selection.',
          tooltip: 'Replace filter fields with indexed or selective predicates.',
          code:
            "Datetime sinceDate = System.now().addDays(-30);\nList<Case> rows = [\n    SELECT Id, CaseNumber, Status, Priority, OwnerId, CreatedDate\n    FROM Case\n    WHERE IsClosed = false\n    AND CreatedDate >= :sinceDate\n    ORDER BY CreatedDate DESC\n    LIMIT 200\n];\nSystem.debug('Rows fetched: ' + rows.size());"
        },
        {
          id: 'duplicate-detection-scan',
          label: 'Potential Duplicate Email Scan',
          description:
            'Aggregates contacts by email to quickly identify possible duplicates.',
          tooltip: 'Run in sandbox first; tune filters for data volume.',
          code:
            "for (AggregateResult ar : [\n    SELECT Email email, COUNT(Id) total\n    FROM Contact\n    WHERE Email != null\n    GROUP BY Email\n    HAVING COUNT(Id) > 1\n    LIMIT 200\n]) {\n    System.debug((String) ar.get('email') + ' -> ' + ar.get('total'));\n}"
        },
        {
          id: 'orphaned-contact-check',
          label: 'Orphaned Contact Check',
          description: 'Finds contacts that are missing Account relationships.',
          tooltip: 'Useful when migration jobs or integrations skip account binding.',
          code:
            "List<Contact> orphaned = [\n    SELECT Id, Name, Email, CreatedDate\n    FROM Contact\n    WHERE AccountId = null\n    ORDER BY CreatedDate DESC\n    LIMIT 200\n];\nSystem.debug('Orphaned contacts: ' + orphaned.size());\nfor (Contact c : orphaned) {\n    System.debug(c.Id + ' | ' + c.Name + ' | ' + c.Email);\n}"
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
