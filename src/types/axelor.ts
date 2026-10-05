export interface AxelorResponse<T> {
  status: number;
  total?: number;
  data: T[];
  error?: string;
  message?: string;
}

export interface AxelorSearchCriteria {
  fields?: string[];
  sortBy?: string[];
  limit?: number;
  offset?: number;
  domain?: string;
  domainContext?: Record<string, unknown>;
}

export interface MetaMenuRecord {
  id: number;
  name: string;
  title: string;
  parent?: {
    id: number;
    name?: string;
    title?: string;
  } | null;
  action?: string;
  order?: number;
  help?: string;
}

export interface AxelorConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  apiKey?: string;
  cookie?: string;
}

export interface AxelorSessionInput {
  cookie: string;
  url: string;
}

export interface MetaViewRecord {
  id: number;
  name: string;
  title?: string;
  type: string;
  model?: string;
  xml?: string;
}

export interface ViewFieldInfo {
  name: string;
  title?: string;
  widget?: string;
  readonly?: boolean;
  required?: boolean;
  target?: string;
  type?: string;
  selection?: string;
  colSpan?: number;
}

export interface ViewPanelInfo {
  name?: string;
  title?: string;
  itemType: "panel" | "panel-tabs" | "panel-dashlet" | "panel-related" | "panel-include";
  colSpan?: number;
  sidebar?: boolean;
  fields: ViewFieldInfo[];
  panels?: ViewPanelInfo[];
}

export interface InspectedViewResult {
  id: number;
  name: string;
  title?: string;
  type: string;
  model?: string;
  isPrimary?: boolean;
  priorityScore?: number;
  fields: ViewFieldInfo[];
  panels?: ViewPanelInfo[];
  rawXml?: string;
}

export interface AxelorActionRequest {
  action: string;
  model?: string;
  data?: {
    context?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface AxelorActionResponse {
  status: number;
  data?: Array<Record<string, any>>;
  error?: string;
  message?: string;
}

export interface AxelorDeleteRecordItem {
  id: number;
  version?: number;
}

export interface AxelorErrorDetails {
  title?: string;
  message: string;
  causeString?: string;
  targetTable?: string;
}

export class AxelorApiError extends Error {
  public readonly status: number;
  public readonly details?: AxelorErrorDetails;

  constructor(status: number, message: string, details?: AxelorErrorDetails) {
    super(message);
    this.name = "AxelorApiError";
    this.status = status;
    this.details = details;
  }
}

export interface MetaFieldRecord {
  id: number;
  name: string;
  label?: string;
  typeName?: string;
  packageName?: string;
  relationship?: string;
  target?: string;
  targetModel?: string;
  required?: boolean;
  readonly?: boolean;
  selection?: string;
  selectionText?: string;
  columnName?: string;
  mappedBy?: string;
  help?: string;
  json?: boolean;
}

export interface MetaModelRecord {
  id: number;
  name: string;
  packageName?: string;
  fullName?: string;
  tableName?: string;
  title?: string;
  description?: string;
}

export interface InspectedModelField {
  name: string;
  label?: string;
  type?: string;
  relationship?: string;
  targetModel?: string;
  required?: boolean;
  readonly?: boolean;
  selection?: string;
  columnName?: string;
  mappedBy?: string;
  help?: string;
}

export interface InspectedModelResult {
  id: number;
  name: string;
  fullName: string;
  packageName?: string;
  tableName?: string;
  title?: string;
  description?: string;
  fieldsCount: number;
  fields: InspectedModelField[];
}

export interface ModelSearchResult {
  id: number;
  name: string;
  fullName: string;
  packageName?: string;
  tableName?: string;
  title?: string;
  description?: string;
}

export interface MetaFileRecord {
  id: number;
  fileName: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  sizeText?: string;
  description?: string;
  createdOn?: string;
  createdBy?: {
    id: number;
    name?: string;
    code?: string;
  } | null;
}

export interface MetaAttachmentRecord {
  id: number;
  objectName: string;
  objectId: number;
  metaFile?: MetaFileRecord | null;
  createdOn?: string;
  createdBy?: {
    id: number;
    name?: string;
    code?: string;
  } | null;
}

export interface AxelorAttachmentItem {
  id: number;
  fileId: number;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  sizeText?: string;
  description?: string;
  createdOn?: string;
  createdBy?: string;
  downloadUrl: string;
}

export interface UploadAttachmentOptions {
  model: string;
  recordId: number;
  fileName: string;
  content?: string;
  localFilePath?: string;
  fileType?: string;
  description?: string;
}

export interface UploadAttachmentResult {
  attachmentId: number;
  fileId: number;
  fileName: string;
  fileSize: number;
  sizeText?: string;
  targetModel: string;
  targetRecordId: number;
  downloadUrl: string;
}

export interface DownloadAttachmentOptions {
  fileId: number;
  outputPath?: string;
  includeBase64?: boolean;
}

export interface DownloadAttachmentResult {
  fileId: number;
  fileName: string;
  fileSize: number;
  sizeText: string;
  fileType?: string;
  savedPath?: string;
  base64Content?: string;
}

export type TemplateType = "report" | "mail" | "printing" | "all";

export interface ListTemplatesOptions {
  model?: string;
  templateType?: TemplateType;
  query?: string;
  limit?: number;
}

export interface AxelorTemplateItem {
  id: number;
  name: string;
  templateType: "report" | "mail" | "printing";
  targetModel?: string;
  format?: string;
  templateLink?: string;
  subject?: string;
  isDefault?: boolean;
  engine?: string;
}

export interface GetBpmStateOptions {
  model?: string;
  recordId?: number;
  instanceId?: string;
  limit?: number;
}

export interface BpmInstanceState {
  id: number;
  instanceId: string;
  name?: string;
  modelName?: string;
  modelId?: number;
  processName?: string;
  currentNode?: string;
  currentStatus?: string;
  hasError?: boolean;
  currentError?: string;
  statusSelect?: number;
  createdOn?: string;
  updatedOn?: string;
}

export type ExportFormat = "csv" | "json";

export interface ExportDataOptions {
  model: string;
  fields?: string[];
  domain?: string;
  domainContext?: Record<string, unknown>;
  sortBy?: string[];
  maxRecords?: number;
  format?: ExportFormat;
  outputPath?: string;
}

export interface ExportDataResult {
  model: string;
  totalExported: number;
  format: ExportFormat;
  savedPath?: string;
  content?: string;
  truncated?: boolean;
}

export interface GetAuditLogOptions {
  model?: string;
  recordId?: number;
  userCode?: string;
  limit?: number;
}

export interface AuditLogChangeItem {
  id: number;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  createdOn?: string;
}

export interface AuditLogItem {
  id: number;
  modelName: string;
  recordId: number;
  relatedReference?: string;
  typeSelect?: number;
  actionType: "creation" | "update" | "deletion" | "read" | "export" | "unknown";
  date: string;
  author?: {
    code?: string;
    fullName?: string;
  };
  changesCount: number;
  changes: AuditLogChangeItem[];
}

export interface InspectSelectionOptions {
  name?: string;
  model?: string;
  field?: string;
  query?: string;
  limit?: number;
}

export interface SelectionOptionItem {
  id: number;
  value: string;
  title: string;
  order?: number;
  color?: string;
  icon?: string;
  hidden?: boolean;
}

export interface SelectionResult {
  id: number;
  name: string;
  optionsCount: number;
  options: SelectionOptionItem[];
}

export interface SchemaRelationItem {
  id: number;
  fieldName: string;
  label?: string;
  relationship: string; // "ManyToOne" | "OneToMany" | "ManyToMany" | "OneToOne"
  sourceModel: string;
  targetModel: string;
  mappedBy?: string;
}

export interface SchemaRelationsResult {
  model: string;
  fullName: string;
  tableName?: string;
  outgoingCount: number;
  outgoing: SchemaRelationItem[];
  incomingCount: number;
  incoming: SchemaRelationItem[];
}

export interface GetSchemaRelationsOptions {
  model: string;
  direction?: "all" | "outgoing" | "incoming";
  relationshipType?: string; // e.g. "ManyToOne", "OneToMany", "ManyToMany", "OneToOne"
  limit?: number;
}

export type BatchOperationType = "create" | "update" | "delete";

export interface BatchOperationItem {
  type: BatchOperationType;
  model: string;
  id?: number;
  version?: number;
  data?: Record<string, unknown>;
}

export interface BatchOperationItemResult {
  index: number;
  type: BatchOperationType;
  model: string;
  id?: number;
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

export interface BatchOperationsResult {
  total: number;
  successful: number;
  failed: number;
  hasErrors: boolean;
  results: BatchOperationItemResult[];
}

export interface BatchOperationsOptions {
  operations: BatchOperationItem[];
  continueOnError?: boolean;
}

export interface CustomFieldItem {
  name: string;
  title?: string;
  type?: string;
  widget?: string;
  source: "attrs" | "view_custom" | "view_transient" | "meta_json";
  targetModel?: string;
  selection?: string;
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
  viewName?: string;
}

export interface InspectCustomFieldsResult {
  model: string;
  hasAttrsField: boolean;
  customFieldsCount: number;
  customFields: CustomFieldItem[];
  customViewsCount: number;
  customViews: Array<{
    id: number;
    name: string;
    type: string;
    title?: string;
    version: number;
  }>;
}

export interface InspectCustomFieldsOptions {
  model: string;
  viewName?: string;
}

export interface SimulateOnChangeOptions {
  model: string;
  action?: string;
  field?: string;
  record: Record<string, unknown>;
  viewName?: string;
}

export interface SimulateOnChangeResult {
  model: string;
  actionExecuted: string;
  field?: string;
  values: Record<string, any>;
  attrs?: Record<string, any>;
  alerts?: Array<{
    type?: string;
    message?: string;
  }>;
}

export interface GenerateReportOptions {
  model: string;
  recordId: number;
  reportAction?: string;
  templateId?: number;
  reportType?: number;
  outputPath?: string;
  includeBase64?: boolean;
}

export interface GenerateReportResult {
  model: string;
  recordId: number;
  title?: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  sizeBytes: number;
  savedPath?: string;
  base64?: string;
}

