import {
  ADMIN_HOURS,
  ADMIN_REPORTING_HOURS,
  APP_SIZE_HOURS,
  BUFFER_MULTIPLIER,
  DATA_MIGRATION_HOURS,
  DESIGN_PHASE_HOURS,
  DEVICE_SUPPORT_MULTIPLIERS,
  DISCOVERY_WEEKS,
  DOCUMENTATION_MULTIPLIERS,
  EXISTING_DESIGN_EXTRA_HOURS,
  EXISTING_DESIGN_MULTIPLIERS,
  FEATURE_HOURS,
  HIGH_RANGE_MULTIPLIER,
  HOURLY_RATE,
  LOW_RANGE_MULTIPLIER,
  PRODUCTIVE_HOURS_PER_WEEK,
  PROJECT_MANAGEMENT_MULTIPLIER,
  QA_MULTIPLIERS,
  REBUILD_TYPE_MULTIPLIERS,
  TECH_DEBT_HOURS,
  TIER_DESCRIPTIONS,
  TIER_THRESHOLDS,
  UI_QUALITY_DESIGN_SYSTEM_HOURS,
  UI_QUALITY_MULTIPLIERS,
  USER_ROLE_HOURS,
  USER_ROLE_PERMISSION_HOURS,
  WEEKS_PER_MONTH,
} from "@/lib/constants";
import { INTEGRATION_HOURS } from "@/lib/integrations";
import type {
  BreakdownGroup,
  EstimateInput,
  EstimateResult,
  EstimateTier,
  EstimatorAnswers,
  IntegrationClassification,
} from "@/lib/types";

export function isEstimateReady(answers: EstimatorAnswers): boolean {
  return Boolean(
    answers.appSize &&
      answers.userRoles &&
      answers.rebuildType &&
      answers.uiQuality &&
      answers.deviceSupport &&
      answers.existingDesigns &&
      answers.adminDashboard &&
      answers.dataMigration &&
      answers.techDebt &&
      answers.documentation
  );
}

export function normalizeEstimateInput(answers: EstimatorAnswers): EstimateInput {
  const {
    appSize,
    userRoles,
    rebuildType,
    uiQuality,
    deviceSupport,
    existingDesigns,
    adminDashboard,
    dataMigration,
    techDebt,
    documentation,
  } = answers;

  if (
    !appSize ||
    !userRoles ||
    !rebuildType ||
    !uiQuality ||
    !deviceSupport ||
    !existingDesigns ||
    !adminDashboard ||
    !dataMigration ||
    !techDebt ||
    !documentation
  ) {
    throw new Error("Estimator answers are incomplete.");
  }

  return {
    appSize,
    userRoles,
    rebuildType,
    featureCounts: {
      simple: sanitizeCount(answers.simpleFeatureCount),
      medium: sanitizeCount(answers.mediumFeatureCount),
      complex: sanitizeCount(answers.complexFeatureCount),
    },
    integrations: answers.integrationClassifications,
    uiQuality,
    deviceSupport,
    existingDesigns,
    adminDashboard,
    dataMigration,
    techDebt,
    documentation,
    extras: {
      designPhase: answers.includeDesignPhase,
      projectManagement: answers.includeProjectManagement,
      qaLevel: answers.qaLevel,
    },
  };
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const permissionsHours = USER_ROLE_PERMISSION_HOURS[input.userRoles];
  const featureHours =
    input.featureCounts.simple * FEATURE_HOURS.simple +
    input.featureCounts.medium * FEATURE_HOURS.medium +
    input.featureCounts.complex * FEATURE_HOURS.complex;
  const integrationHours = sumIntegrationHours(input.integrations);
  const designSystemHours = UI_QUALITY_DESIGN_SYSTEM_HOURS[input.uiQuality];
  const noDesignHours = EXISTING_DESIGN_EXTRA_HOURS[input.existingDesigns];
  const adminHours = ADMIN_HOURS[input.adminDashboard];
  const reportingHours = ADMIN_REPORTING_HOURS[input.adminDashboard];
  const migrationHours = DATA_MIGRATION_HOURS[input.dataMigration];
  const techDebtHours = TECH_DEBT_HOURS[input.techDebt];
  const designPhaseHours = input.extras.designPhase ? DESIGN_PHASE_HOURS : 0;

  const directHours =
    APP_SIZE_HOURS[input.appSize] +
    USER_ROLE_HOURS[input.userRoles] +
    permissionsHours +
    featureHours +
    integrationHours +
    designSystemHours +
    noDesignHours +
    adminHours +
    reportingHours +
    migrationHours +
    techDebtHours +
    designPhaseHours;

  const multiplierMap = [
    ["Rebuild type", REBUILD_TYPE_MULTIPLIERS[input.rebuildType]],
    ["UI quality", UI_QUALITY_MULTIPLIERS[input.uiQuality]],
    ["Device support", DEVICE_SUPPORT_MULTIPLIERS[input.deviceSupport]],
    ["Design availability", EXISTING_DESIGN_MULTIPLIERS[input.existingDesigns]],
    ["Documentation", DOCUMENTATION_MULTIPLIERS[input.documentation]],
    [
      "Project management",
      input.extras.projectManagement ? PROJECT_MANAGEMENT_MULTIPLIER : 1,
    ],
    ["QA", QA_MULTIPLIERS[input.extras.qaLevel]],
  ] as const;

  const combinedMultiplier = multiplierMap.reduce(
    (accumulator, [, multiplier]) => accumulator * multiplier,
    1
  );

  const baseHours = directHours * combinedMultiplier;
  const bufferHours = baseHours * BUFFER_MULTIPLIER;
  const bufferedHours = baseHours + bufferHours;
  const costMid = bufferedHours * HOURLY_RATE;
  const costLow = costMid * LOW_RANGE_MULTIPLIER;
  const costHigh = costMid * HIGH_RANGE_MULTIPLIER;
  const devWeeks = bufferedHours / PRODUCTIVE_HOURS_PER_WEEK;
  const totalWeeks = devWeeks + DISCOVERY_WEEKS;
  const monthsLow = (totalWeeks * LOW_RANGE_MULTIPLIER) / WEEKS_PER_MONTH;
  const monthsHigh = (totalWeeks * HIGH_RANGE_MULTIPLIER) / WEEKS_PER_MONTH;
  const tier = getTier(costMid);

  const breakdown: BreakdownGroup[] = [
    {
      title: "Scope and foundations",
      subtotalLabel: "Direct hours",
      subtotalValue: formatHours(
        APP_SIZE_HOURS[input.appSize] +
          USER_ROLE_HOURS[input.userRoles] +
          permissionsHours +
          designSystemHours
      ),
      items: [
        {
          label: "App size",
          value: formatHours(APP_SIZE_HOURS[input.appSize]),
        },
        {
          label: "User roles",
          value: formatHours(USER_ROLE_HOURS[input.userRoles]),
        },
        {
          label: "Permissions complexity",
          value: formatHours(permissionsHours),
        },
        {
          label: "Design system depth",
          value: formatHours(designSystemHours),
        },
      ],
    },
    {
      title: "Features and integrations",
      subtotalLabel: "Direct hours",
      subtotalValue: formatHours(featureHours + integrationHours),
      items: [
        {
          label: "Simple features",
          value: `${input.featureCounts.simple} × ${FEATURE_HOURS.simple}h = ${formatHours(
            input.featureCounts.simple * FEATURE_HOURS.simple
          )}`,
        },
        {
          label: "Medium features",
          value: `${input.featureCounts.medium} × ${FEATURE_HOURS.medium}h = ${formatHours(
            input.featureCounts.medium * FEATURE_HOURS.medium
          )}`,
        },
        {
          label: "Complex features",
          value: `${input.featureCounts.complex} × ${FEATURE_HOURS.complex}h = ${formatHours(
            input.featureCounts.complex * FEATURE_HOURS.complex
          )}`,
        },
        {
          label: "Integrations",
          value: input.integrations.length
            ? formatHours(integrationHours)
            : "No integrations included",
        },
        ...input.integrations.map((integration) => ({
          label: integration.name,
          value: `${integration.complexity} • ${formatHours(integration.hours)}`,
        })),
      ],
    },
    {
      title: "Design, admin, and rebuild work",
      subtotalLabel: "Direct hours",
      subtotalValue: formatHours(
        noDesignHours +
          adminHours +
          reportingHours +
          migrationHours +
          techDebtHours +
          designPhaseHours
      ),
      items: [
        {
          label: "No-design lift",
          value: formatHours(noDesignHours),
        },
        {
          label: "Admin dashboard",
          value: formatHours(adminHours),
        },
        {
          label: "Reporting and exports",
          value: formatHours(reportingHours),
        },
        {
          label: "Data migration",
          value: formatHours(migrationHours),
        },
        {
          label: "Tech debt and architecture",
          value: formatHours(techDebtHours),
        },
        {
          label: "Design phase",
          value: formatHours(designPhaseHours),
        },
      ],
    },
    {
      title: "Multipliers and contingency",
      subtotalLabel: "Buffered total",
      subtotalValue: formatHours(bufferedHours),
      items: [
        ...multiplierMap.map(([label, multiplier]) => ({
          label,
          value: `×${multiplier.toFixed(2)}`,
        })),
        {
          label: "Combined multiplier",
          value: `×${combinedMultiplier.toFixed(2)}`,
          emphasis: true,
        },
        {
          label: "Buffer",
          value: formatHours(bufferHours),
        },
      ],
    },
  ];

  return {
    directHours,
    combinedMultiplier,
    baseHours,
    bufferHours,
    bufferedHours,
    costLow,
    costMid,
    costHigh,
    totalWeeks,
    devWeeks,
    monthsLow,
    monthsHigh,
    tier,
    tierDescription: TIER_DESCRIPTIONS[tier],
    breakdown,
  };
}

export function formatHours(hours: number): string {
  return `${trimNumber(hours)} hrs`;
}

function getTier(costMid: number): EstimateTier {
  if (costMid <= TIER_THRESHOLDS.Starter[1]) {
    return "Starter";
  }

  if (costMid <= TIER_THRESHOLDS.Growth[1]) {
    return "Growth";
  }

  if (costMid <= TIER_THRESHOLDS.Scale[1]) {
    return "Scale";
  }

  return "Enterprise";
}

function sanitizeCount(count: number): number {
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

function sumIntegrationHours(integrations: IntegrationClassification[]): number {
  return integrations.reduce((accumulator, integration) => {
    const hours = INTEGRATION_HOURS[integration.complexity] ?? integration.hours ?? 0;
    return accumulator + hours;
  }, 0);
}

function trimNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(2);
}
