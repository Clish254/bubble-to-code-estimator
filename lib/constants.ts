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

export const TOTAL_STEPS = 10;
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
  Starter: "Focused rebuilds for lean MVPs and clear, low-complexity scopes.",
  Growth: "A strong fit for established products with several core workflows to rebuild.",
  Scale: "Best for multi-role platforms with integrations, internal tooling, and deeper UX work.",
  Enterprise:
    "Reserved for mission-critical rebuilds with serious architecture, migration, and delivery overhead.",
};

export const STEP_TITLES = [
  "App Size",
  "User Roles",
  "Rebuild Type",
  "Features",
  "Integrations",
  "UI & Devices",
  "Existing Designs",
  "Admin Dashboard",
  "Migration & Tech Debt",
  "Delivery Add-ons",
] as const;

export const APP_SIZE_HOURS: Record<AppSizeOption, number> = {
  mvp: 120,
  mid: 320,
  large: 600,
};

export const USER_ROLE_HOURS: Record<UserRolesOption, number> = {
  one: 0,
  twoToThree: 40,
  fourPlus: 80,
};

export const USER_ROLE_PERMISSION_HOURS: Record<UserRolesOption, number> = {
  one: 8,
  twoToThree: 24,
  fourPlus: 56,
};

export const REBUILD_TYPE_MULTIPLIERS: Record<RebuildTypeOption, number> = {
  sameUx: 0.8,
  redesigned: 1,
  partial: 0.7,
  fullRebuild: 1.3,
};

export const FEATURE_HOURS = {
  simple: 8,
  medium: 24,
  complex: 56,
} as const;

export const UI_QUALITY_MULTIPLIERS: Record<UIQualityOption, number> = {
  basic: 0.8,
  polished: 1,
  premium: 1.3,
};

export const UI_QUALITY_DESIGN_SYSTEM_HOURS: Record<UIQualityOption, number> = {
  basic: 0,
  polished: 24,
  premium: 60,
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
  none: 40,
};

export const ADMIN_HOURS: Record<AdminDashboardOption, number> = {
  none: 0,
  basic: 40,
  advanced: 100,
};

export const ADMIN_REPORTING_HOURS: Record<AdminDashboardOption, number> = {
  none: 0,
  basic: 16,
  advanced: 48,
};

export const DATA_MIGRATION_HOURS: Record<DataMigrationOption, number> = {
  none: 0,
  simple: 24,
  complex: 80,
};

export const TECH_DEBT_HOURS: Record<TechDebtOption, number> = {
  none: 0,
  some: 40,
  major: 100,
};

export const DOCUMENTATION_MULTIPLIERS: Record<DocumentationOption, number> = {
  good: 0.9,
  partial: 1,
  none: 1.15,
};

export const DESIGN_PHASE_HOURS = 80;

export const QA_MULTIPLIERS: Record<QaLevelOption, number> = {
  none: 1,
  basic: 1.1,
  full: 1.25,
};

export const PROJECT_MANAGEMENT_MULTIPLIER = 1.1;
