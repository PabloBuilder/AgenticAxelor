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

