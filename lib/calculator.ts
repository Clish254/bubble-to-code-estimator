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
  MINIMUM_ESTIMATE,
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
  const rawCostMid = bufferedHours * HOURLY_RATE;
  const rawCostLow = rawCostMid * LOW_RANGE_MULTIPLIER;
  const rawCostHigh = rawCostMid * HIGH_RANGE_MULTIPLIER;
  const floored = rawCostLow < MINIMUM_ESTIMATE;
  const costLow = floored ? MINIMUM_ESTIMATE : rawCostLow;
  const costHigh = floored ? MINIMUM_ESTIMATE * 1.25 : rawCostHigh;
  const costMid = floored ? (costLow + costHigh) / 2 : rawCostMid;
  const devWeeks = bufferedHours / PRODUCTIVE_HOURS_PER_WEEK;
  const totalWeeks = devWeeks + DISCOVERY_WEEKS;
  const monthsLow = (totalWeeks * LOW_RANGE_MULTIPLIER) / WEEKS_PER_MONTH;
  const monthsHigh = (totalWeeks * HIGH_RANGE_MULTIPLIER) / WEEKS_PER_MONTH;
  const tier = getTier(costLow);

  const breakdown: BreakdownGroup[] = [
    {
      title: "The basics",
      subtotalLabel: "Days",
      subtotalValue: formatDays(
        APP_SIZE_HOURS[input.appSize] +
          USER_ROLE_HOURS[input.userRoles] +
          permissionsHours +
          designSystemHours
      ),
      items: [
        {
          label: "App size",
          value: formatDays(APP_SIZE_HOURS[input.appSize]),
        },
        {
          label: "User types",
          value: formatDays(USER_ROLE_HOURS[input.userRoles]),
        },
        {
          label: "Permissions",
          value: formatDays(permissionsHours),
        },
        {
          label: "Design system",
          value: formatDays(designSystemHours),
        },
      ],
    },
    {
      title: "Features and integrations",
      subtotalLabel: "Days",
      subtotalValue: formatDays(featureHours + integrationHours),
      items: [
        {
          label: "Features",
          value: formatDays(featureHours),
        },
        {
          label: "Integrations",
          value: input.integrations.length
            ? formatDays(integrationHours)
            : "None",
        },
        ...input.integrations.map((integration) => ({
          label: integration.name,
          value: formatDays(integration.hours),
        })),
      ],
    },
    {
      title: "Design, admin, and data work",
      subtotalLabel: "Days",
      subtotalValue: formatDays(
        noDesignHours +
          adminHours +
          reportingHours +
          migrationHours +
          techDebtHours +
          designPhaseHours
      ),
      items: [
        {
          label: "Design effort",
          value: formatDays(noDesignHours),
        },
        {
          label: "Admin dashboard",
          value: formatDays(adminHours),
        },
        {
          label: "Reports and exports",
          value: formatDays(reportingHours),
        },
        {
          label: "Data migration",
          value: formatDays(migrationHours),
        },
        {
          label: "Cleanup work",
          value: formatDays(techDebtHours),
        },
        {
          label: "Design phase",
          value: formatDays(designPhaseHours),
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

const HOURS_PER_DAY = 8;
const DAYS_PER_WEEK = 4;
const DAYS_PER_MONTH = 20;

export function formatDays(hours: number): string {
  const days = Math.ceil(hours / HOURS_PER_DAY);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function hoursToDays(hours: number): number {
  return Math.ceil(hours / HOURS_PER_DAY);
}

export function weeksToDays(weeks: number): number {
  return Math.ceil(weeks * DAYS_PER_WEEK);
}

export function formatTimeline(daysLow: number, daysHigh: number): string {
  if (daysHigh <= DAYS_PER_MONTH) {
    if (daysLow === daysHigh) {
      return `${daysHigh} ${daysHigh === 1 ? "day" : "days"}`;
    }
    return `${daysLow}–${daysHigh} days`;
  }
  const monthsLow = Math.ceil(daysLow / DAYS_PER_MONTH);
  const monthsHigh = Math.ceil(daysHigh / DAYS_PER_MONTH);
  if (monthsLow === monthsHigh) {
    return `${monthsHigh} ${monthsHigh === 1 ? "month" : "months"}`;
  }
  return `${monthsLow}–${monthsHigh} months`;
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
