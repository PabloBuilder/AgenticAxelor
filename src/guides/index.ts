import { GuidanceRoute } from "../types/guidance.js";
import { salesRightsGuide } from "./salesRightsGuide.js";
import { accountingRightsGuide } from "./accountingRightsGuide.js";
import { subWindowGuide } from "./subWindowGuide.js";
import { complexGuide } from "./complexGuide.js";
import { setPasswordGuide } from "./setPasswordGuide.js";

export {
  salesRightsGuide,
  accountingRightsGuide,
  subWindowGuide,
  complexGuide,
  setPasswordGuide,
};

export const GUIDE_REGISTRY: Record<string, GuidanceRoute> = {
  "sales-rights": salesRightsGuide,
  "accounting-rights": accountingRightsGuide,
  "sub-window": subWindowGuide,
  "complex-customer": complexGuide,
  "set-password": setPasswordGuide,
};
