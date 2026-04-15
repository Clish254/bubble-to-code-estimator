export type IntegrationComplexity = "low" | "medium" | "high";

export type AppSizeOption = "mvp" | "mid" | "large";
export type UserRolesOption = "one" | "twoToThree" | "fourPlus";
export type RebuildTypeOption =
  | "sameUx"
  | "redesigned"
  | "partial"
  | "fullRebuild";
export type UIQualityOption = "basic" | "polished" | "premium";
export type DeviceSupportOption = "desktop" | "desktopMobile" | "fullResponsive";
export type ExistingDesignsOption = "ready" | "partial" | "none";
export type AdminDashboardOption = "none" | "basic" | "advanced";
export type DataMigrationOption = "none" | "simple" | "complex";
export type TechDebtOption = "none" | "some" | "major";
export type DocumentationOption = "good" | "partial" | "none";
export type QaLevelOption = "none" | "basic" | "full";
export type EstimateTier = "Starter" | "Growth" | "Scale" | "Enterprise";

export interface IntegrationClassification {
  name: string;
  complexity: IntegrationComplexity;
  hours: number;
  reason: string;
  source?: "ai" | "fallback" | "manual";
}

export interface FeatureClassification {
  simple: number;
  medium: number;
  complex: number;
  summary: string;
  source: "ai" | "fallback";
}

export interface EstimatorAnswers {
  appSize: AppSizeOption | null;
  userRoles: UserRolesOption | null;
  rebuildType: RebuildTypeOption | null;
  featuresText: string;
  featureClassification: FeatureClassification | null;
  simpleFeatureCount: number;
  mediumFeatureCount: number;
  complexFeatureCount: number;
  integrationsText: string;
  integrationClassifications: IntegrationClassification[];
  uiQuality: UIQualityOption | null;
  deviceSupport: DeviceSupportOption | null;
  existingDesigns: ExistingDesignsOption | null;
  adminDashboard: AdminDashboardOption | null;
  dataMigration: DataMigrationOption | null;
  techDebt: TechDebtOption | null;
  documentation: DocumentationOption | null;
  includeDesignPhase: boolean;
  includeProjectManagement: boolean;
  qaLevel: QaLevelOption;
}

export interface EstimateInput {
  appSize: AppSizeOption;
  userRoles: UserRolesOption;
  rebuildType: RebuildTypeOption;
  featureCounts: {
    simple: number;
    medium: number;
    complex: number;
  };
  integrations: IntegrationClassification[];
  uiQuality: UIQualityOption;
  deviceSupport: DeviceSupportOption;
  existingDesigns: ExistingDesignsOption;
  adminDashboard: AdminDashboardOption;
  dataMigration: DataMigrationOption;
  techDebt: TechDebtOption;
  documentation: DocumentationOption;
  extras: {
    designPhase: boolean;
    projectManagement: boolean;
    qaLevel: QaLevelOption;
  };
}

export interface BreakdownItem {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface BreakdownGroup {
  title: string;
  subtotalLabel?: string;
  subtotalValue?: string;
  items: BreakdownItem[];
}

export interface EstimateResult {
  directHours: number;
  combinedMultiplier: number;
  baseHours: number;
  bufferHours: number;
  bufferedHours: number;
  costLow: number;
  costMid: number;
  costHigh: number;
  totalWeeks: number;
  devWeeks: number;
  monthsLow: number;
  monthsHigh: number;
  tier: EstimateTier;
  tierDescription: string;
  breakdown: BreakdownGroup[];
}

export interface IntegrationGuideEntry {
  name: string;
  complexity: IntegrationComplexity;
  hours: number;
  notes: string;
}

export interface ClassificationResponse {
  classifications: IntegrationClassification[];
  message?: string;
}

export interface FeatureClassificationResponse {
  classification: FeatureClassification | null;
  message?: string;
}

export interface EstimatorState {
  currentStep: number;
  direction: 1 | -1;
  answers: EstimatorAnswers;
  integrationStatus: "idle" | "loading" | "ready" | "error";
  integrationMessage: string | null;
  lastClassifiedText: string;
  featureStatus: "idle" | "loading" | "ready" | "error";
  featureMessage: string | null;
  lastClassifiedFeaturesText: string;
}
