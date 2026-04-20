import type {
  AdminDashboardOption,
  AppSizeOption,
  DataMigrationOption,
  DeviceSupportOption,
  DocumentationOption,
  EstimateTier,
  ExistingDesignsOption,
  QaLevelOption,
  RebuildTypeOption,
  TechDebtOption,
  UIQualityOption,
  UserRolesOption,
} from "@/lib/types";

export const TOTAL_STEPS = 9;
export const RESULT_STEP_INDEX = TOTAL_STEPS;

export const HOURLY_RATE = 80;
export const BUFFER_MULTIPLIER = 0.2;
export const PRODUCTIVE_HOURS_PER_WEEK = 32;
export const DISCOVERY_WEEKS = 2;
export const LOW_RANGE_MULTIPLIER = 0.85;
export const HIGH_RANGE_MULTIPLIER = 1.2;
export const WEEKS_PER_MONTH = 4.33;

export const TIER_THRESHOLDS: Record<EstimateTier, [number, number]> = {
  Starter: [0, 14399.99],
  Growth: [14400, 36000],
  Scale: [36000, 64000],
  Enterprise: [64000.01, Number.POSITIVE_INFINITY],
};

export const TIER_DESCRIPTIONS: Record<EstimateTier, string> = {
  Starter: "A focused rebuild for a small, straightforward app.",
  Growth: "A good fit for an established app with a few core workflows.",
  Scale: "For bigger apps with multiple user types, integrations, and more UI work.",
  Enterprise:
    "For large, business-critical rebuilds with heavy architecture and migration work.",
};

export const STEP_TITLES = [
  "Size",
  "Users",
  "Rebuild",
  "Features",
  "Integrations",
  "Look and feel",
  "Designs",
  "Admin",
  "Data and docs",
] as const;

export const APP_SIZE_HOURS: Record<AppSizeOption, number> = {
  mvp: 72,
  mid: 192,
  large: 360,
};

export const USER_ROLE_HOURS: Record<UserRolesOption, number> = {
  one: 0,
  twoToThree: 24,
  fourPlus: 48,
};

export const USER_ROLE_PERMISSION_HOURS: Record<UserRolesOption, number> = {
  one: 5,
  twoToThree: 14,
  fourPlus: 34,
};

export const REBUILD_TYPE_MULTIPLIERS: Record<RebuildTypeOption, number> = {
  sameUx: 0.8,
  redesigned: 1,
  partial: 0.7,
  fullRebuild: 1.3,
};

export const FEATURE_HOURS = {
  simple: 5,
  medium: 14,
  complex: 34,
} as const;

export const UI_QUALITY_MULTIPLIERS: Record<UIQualityOption, number> = {
  basic: 0.8,
  polished: 1,
  premium: 1.3,
};

export const UI_QUALITY_DESIGN_SYSTEM_HOURS: Record<UIQualityOption, number> = {
  basic: 0,
  polished: 14,
  premium: 36,
};

export const DEVICE_SUPPORT_MULTIPLIERS: Record<DeviceSupportOption, number> = {
  desktop: 0.85,
  desktopMobile: 1,
  fullResponsive: 1.2,
};

export const EXISTING_DESIGN_MULTIPLIERS: Record<ExistingDesignsOption, number> = {
  ready: 0.9,
  partial: 1,
  none: 1,
};

export const EXISTING_DESIGN_EXTRA_HOURS: Record<ExistingDesignsOption, number> = {
  ready: 0,
  partial: 0,
  none: 24,
};

export const ADMIN_HOURS: Record<AdminDashboardOption, number> = {
  none: 0,
  basic: 24,
  advanced: 60,
};

export const ADMIN_REPORTING_HOURS: Record<AdminDashboardOption, number> = {
  none: 0,
  basic: 10,
  advanced: 29,
};

export const DATA_MIGRATION_HOURS: Record<DataMigrationOption, number> = {
  none: 0,
  simple: 14,
  complex: 48,
};

export const TECH_DEBT_HOURS: Record<TechDebtOption, number> = {
  none: 0,
  some: 24,
  major: 60,
};

export const DOCUMENTATION_MULTIPLIERS: Record<DocumentationOption, number> = {
  good: 0.9,
  partial: 1,
  none: 1.15,
};

export const DESIGN_PHASE_HOURS = 48;

export const QA_MULTIPLIERS: Record<QaLevelOption, number> = {
  none: 1,
  basic: 1.1,
  full: 1.25,
};

export const PROJECT_MANAGEMENT_MULTIPLIER = 1.1;
