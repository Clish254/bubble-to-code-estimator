import type {
  AppSizeOption,
  FeatureClassification,
  FeatureClassificationResponse,
} from "@/lib/types";

const FALLBACK_COUNTS: Record<AppSizeOption, {
  simple: number;
  medium: number;
  complex: number;
}> = {
  mvp: { simple: 3, medium: 1, complex: 0 },
  mid: { simple: 5, medium: 3, complex: 1 },
  large: { simple: 8, medium: 5, complex: 2 },
};

export function createFallbackFeatureClassification(
  appSize: AppSizeOption | null,
  summary = "We used a baseline set of features for your app size. You can refine the details on a call."
): FeatureClassification {
  const counts = FALLBACK_COUNTS[appSize ?? "mid"];

  return {
    simple: counts.simple,
    medium: counts.medium,
    complex: counts.complex,
    summary,
    source: "fallback",
  };
}

export function sanitizeFeatureClassification(
  value: Partial<FeatureClassification>
): FeatureClassification {
  return {
    simple: sanitizeCount(value.simple),
    medium: sanitizeCount(value.medium),
    complex: sanitizeCount(value.complex),
    summary: value.summary?.trim() || "We mapped your description to a balanced feature mix.",
    source: value.source ?? "ai",
  };
}

export function toFeatureClassificationResponse(
  classification: FeatureClassification | null,
  message?: string
): FeatureClassificationResponse {
  return {
    classification,
    ...(message ? { message } : {}),
  };
}

export function buildFeaturePrompt(
  description: string,
  appSize: AppSizeOption | null
): string {
  return [
    "Classify the described app features for a Bubble-to-code project estimator.",
    "Count how many features fall into three buckets:",
    "- simple: CRUD screens, lists, forms, basic product flows (5 hrs each)",
    "- medium: search, filtering, dashboards, logic-heavy but familiar app behaviors (14 hrs each)",
    "- complex: payments, AI, real-time behavior, orchestration, operationally sensitive workflows (34 hrs each)",
    "",
    "If the description is vague, lean on the app size signal to produce a reasonable count. Never return zero across all three buckets unless the description is truly empty.",
    "",
    "Return JSON only with this shape:",
    '{"classification":{"simple":3,"medium":2,"complex":1,"summary":"Short plain-language recap of what you counted."}}',
    "",
    `App size hint: ${appSize ?? "unknown"}.`,
    "",
    "Feature description:",
    description.trim() || "(no description provided)",
  ].join("\n");
}

export function normalizeFeaturesText(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

function sanitizeCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

export function extractJsonObject(payload: string): unknown {
  const trimmed = payload.trim();

  if (!trimmed) {
    return {};
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? trimmed;

  return JSON.parse(candidate);
}
