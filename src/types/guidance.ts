export type GuidanceStepType = "menu" | "button" | "field" | "tab" | "row";

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
   * Value context or suggested input note
   */
  valueHint?: string;
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
