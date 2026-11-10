export type GuidanceStepType = "menu" | "button" | "field" | "tab" | "row";

export interface GuidanceFieldInput {
  label: string;
  value: string;
  hint?: string;
}

export interface GuidanceStep {
  id: string;
  type: GuidanceStepType;
  /**
   * Primary CSS or XPath-like selector used by the DOM spotlight engine
   */
  selector: string;
  /**
   * Fallback selectors or attribute matchers (e.g. data-field, text matching)
   */
  fallbackSelectors?: string[];
  /**
   * Concise human label indicating the element
   */
  label: string;
  /**
   * Instructional hint for the user
   */
  hint: string;
  /**
   * Menu hierarchy breadcrumb if applicable
   */
  breadcrumb?: string[];
  /**
   * Expected model or view name after this step
   */
  expectedView?: string;
  /**
   * Value context or suggested input note (Single value)
   */
  valueHint?: string;
  /**
   * Multiple fields to fill in a single step (Multi-values table)
   */
  fields?: GuidanceFieldInput[];
  /**
   * Additional contextual explanation or best practice tip
   */
  explanation?: string;
  /**
   * Target action or interaction directive
   */
  action?: string;
  /**
   * Field identifier or technical name if applicable
   */
  fieldName?: string;
}

export interface GuidanceRoute {
  id: string;
  title: string;
  description?: string;
  targetMenu?: string;
  targetModel?: string;
  targetField?: string;
  currentStepIndex: number;
  totalSteps: number;
  steps: GuidanceStep[];
  createdAt: string;
}

export interface GuidanceRequest {
  targetMenu?: string;
  targetModel?: string;
  targetField?: string;
  description?: string;
}
