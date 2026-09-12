import { MenuService } from "./menuService.js";
import { ViewService } from "./viewService.js";
import { GuidanceRoute, GuidanceStep, GuidanceRequest } from "../types/guidance.js";
import { ViewFieldInfo } from "../types/axelor.js";

export class GuidanceService {
  private menuService: MenuService;
  private viewService: ViewService;

  constructor(menuService: MenuService, viewService: ViewService) {
    this.menuService = menuService;
    this.viewService = viewService;
  }

  /**
   * Build a concrete step-by-step navigation roadmap
   */
  async resolveRoute(request: GuidanceRequest): Promise<GuidanceRoute> {
    const steps: GuidanceStep[] = [];
    const routeId = `route_${Date.now()}`;
    let routeTitle = request.description || "Navigation Guidance";

    // 1. Resolve Menu Steps if targetMenu is provided
    if (request.targetMenu) {
      const menuResults = await this.menuService.searchMenu(request.targetMenu, 5);
      if (menuResults.length > 0) {
        const bestMenu = menuResults[0];
        const segments = bestMenu.breadcrumb.split(" > ").map((s) => s.trim()).filter(Boolean);
        routeTitle = `Go to ${bestMenu.title}`;

        segments.forEach((segment, idx) => {
          const isLeaf = idx === segments.length - 1;
          steps.push({
            id: `step_menu_${idx + 1}`,
            type: "menu",
            selector: `[data-menu-title="${segment}"], a:contains("${segment}"), .nav-item:has(span:contains("${segment}"))`,
            fallbackSelectors: [
              `a[title="${segment}"]`,
              `span:contains("${segment}")`,
              `[data-menu-name="${bestMenu.name}"]`,
            ],
            label: segment,
            hint: isLeaf
              ? `Cliquez sur l'élément de menu final "${segment}" pour ouvrir la vue.`
              : `Cliquez pour déplier le dossier de menu "${segment}".`,
            breadcrumb: segments.slice(0, idx + 1),
          });
        });
      }
    }

    // 2. Resolve View & Target Field Steps if targetModel / targetField are provided
    if (request.targetModel) {
      const modelName = request.targetModel;
      
      // Step to open / create record if we're guiding towards a form or field
      if (request.targetField) {
        steps.push({
          id: `step_btn_new`,
          type: "button",
          selector: `button[name="new"], button.btn-new, button:has(i.fa-plus), button:contains("Nouveau"), button:contains("New")`,
          fallbackSelectors: [
            `button[title*="New"]`,
            `button[title*="Nouveau"]`,
            `.btn-primary:has(i.fa-plus)`,
          ],
          label: "Nouveau",
          hint: `Cliquez sur le bouton "Nouveau" ou "+" pour ouvrir le formulaire de création.`,
          expectedView: `${modelName}.form`,
        });

        // Inspect the view fields to get accurate field metadata & label
        let fieldLabel = request.targetField;
        try {
          const inspected = await this.viewService.inspectView({
            nameOrModel: modelName,
            viewType: "form",
            limit: 1,
          });
          if (inspected.length > 0 && inspected[0].fields) {
            const matchedField = inspected[0].fields.find(
              (f: ViewFieldInfo) => f.name.toLowerCase() === request.targetField?.toLowerCase()
            );
            if (matchedField && matchedField.title) {
              fieldLabel = matchedField.title;
            }
          }
        } catch {
          // Fallback to field name
        }

        steps.push({
          id: `step_field_${request.targetField}`,
          type: "field",
          selector: `[name="${request.targetField}"], [data-field="${request.targetField}"], #${request.targetField}, input[ng-model*="${request.targetField}"]`,
          fallbackSelectors: [
            `[data-field-name="${request.targetField}"] input`,
            `[data-field-name="${request.targetField}"] select`,
            `label:contains("${fieldLabel}") + div input`,
          ],
          label: fieldLabel,
          hint: `Renseignez ou sélectionnez la valeur pour le champ "${fieldLabel}".`,
          expectedView: `${modelName}.form`,
        });
      }
    }

    return {
      id: routeId,
      title: routeTitle,
      description: request.description,
      targetMenu: request.targetMenu,
      targetModel: request.targetModel,
      targetField: request.targetField,
      currentStepIndex: 0,
      totalSteps: steps.length,
      steps,
      createdAt: new Date().toISOString(),
    };
  }
}
