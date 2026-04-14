import type {
  ClassificationResponse,
  IntegrationClassification,
  IntegrationComplexity,
  IntegrationGuideEntry,
} from "@/lib/types";

export const INTEGRATION_HOURS: Record<IntegrationComplexity, number> = {
  low: 12,
  medium: 32,
  high: 64,
};

export const INTEGRATION_GUIDE: IntegrationGuideEntry[] = [
  {
    name: "Stripe (payments)",
    complexity: "low",
    hours: 12,
    notes: "Well-documented SDK, standard webhooks",
  },
  {
    name: "SendGrid / Mailgun (email)",
    complexity: "low",
    hours: 8,
    notes: "Simple API, templates",
  },
  {
    name: "Twilio (SMS)",
    complexity: "low",
    hours: 10,
    notes: "Standard REST API",
  },
  {
    name: "Cloudinary (media)",
    complexity: "low",
    hours: 8,
    notes: "Upload SDK, transform URLs",
  },
  {
    name: "Google Analytics",
    complexity: "low",
    hours: 4,
    notes: "Script injection plus event tracking",
  },
  {
    name: "Slack notifications",
    complexity: "low",
    hours: 8,
    notes: "Webhook-based setup",
  },
  {
    name: "Basic REST API pull",
    complexity: "low",
    hours: 12,
    notes: "Standard GET/POST with API key auth",
  },
  {
    name: "HubSpot CRM sync",
    complexity: "medium",
    hours: 32,
    notes: "OAuth, pagination, field mapping, webhooks",
  },
  {
    name: "Intercom",
    complexity: "medium",
    hours: 24,
    notes: "User identification and event tracking",
  },
  {
    name: "Zapier / Make (outbound)",
    complexity: "medium",
    hours: 20,
    notes: "Webhook triggers and payload formatting",
  },
  {
    name: "Google Maps / Places",
    complexity: "medium",
    hours: 24,
    notes: "API key, geocoding, autocomplete",
  },
  {
    name: "AWS S3 (file storage)",
    complexity: "medium",
    hours: 20,
    notes: "Presigned URLs, bucket policies, CORS",
  },
  {
    name: "PayPal",
    complexity: "medium",
    hours: 28,
    notes: "More complex than Stripe, older APIs",
  },
  {
    name: "Algolia (search)",
    complexity: "medium",
    hours: 24,
    notes: "Index management, facets, ranking",
  },
  {
    name: "Calendar API (Google/Outlook)",
    complexity: "medium",
    hours: 32,
    notes: "OAuth, event CRUD, timezone handling",
  },
  {
    name: "SSO / SAML / OAuth provider",
    complexity: "high",
    hours: 64,
    notes: "Enterprise auth, token management, multi-tenant concerns",
  },
  {
    name: "Salesforce sync",
    complexity: "high",
    hours: 72,
    notes: "Complex API, rate limits, and bulk operations",
  },
  {
    name: "QuickBooks / Xero (accounting)",
    complexity: "high",
    hours: 56,
    notes: "OAuth, complex data models, reconciliation",
  },
  {
    name: "Custom bidirectional sync",
    complexity: "high",
    hours: 80,
    notes: "Conflict resolution and retry logic",
  },
  {
    name: "Multi-system orchestration",
    complexity: "high",
    hours: 72,
    notes: "Multiple APIs, orchestration, and state recovery",
  },
  {
    name: "Blockchain / Web3 integration",
    complexity: "high",
    hours: 64,
    notes: "Wallet connect, smart contracts, transaction handling",
  },
  {
    name: "Real-time data feeds (WebSocket)",
    complexity: "high",
    hours: 48,
    notes: "Persistent connections and reconnection logic",
  },
];

export function parseIntegrationInput(input: string): string[] {
  const items = input
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const seen = new Set<string>();

  return items.filter((item) => {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export function normalizeIntegrationText(input: string): string {
  return parseIntegrationInput(input).join(", ");
}

export function createFallbackClassifications(
  integrations: string[],
  reason = "We couldn't verify this automatically, so we used the default medium estimate."
): IntegrationClassification[] {
  return integrations.map((name) => ({
    name,
    complexity: "medium",
    hours: INTEGRATION_HOURS.medium,
    reason,
    source: "fallback",
  }));
}

export function sanitizeClassification(
  value: Partial<IntegrationClassification> & Pick<IntegrationClassification, "name">
): IntegrationClassification {
  const complexity = isIntegrationComplexity(value.complexity)
    ? value.complexity
    : "medium";

  return {
    name: value.name.trim(),
    complexity,
    hours: INTEGRATION_HOURS[complexity],
    reason: value.reason?.trim() || "Matched to the closest reference integration.",
    source: value.source ?? "ai",
  };
}

export function toClassificationResponse(
  classifications: IntegrationClassification[],
  message?: string
): ClassificationResponse {
  return {
    classifications,
    ...(message ? { message } : {}),
  };
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

export function buildIntegrationPrompt(integrations: string[]): string {
  const referenceTable = INTEGRATION_GUIDE.map(
    (entry) =>
      `- ${entry.name}: ${entry.complexity.toUpperCase()} (${entry.hours} hrs reference, notes: ${entry.notes})`
  ).join("\n");

  return [
    "Classify each listed integration for a Bubble-to-code project estimator.",
    "Use only three complexity values: low, medium, high.",
    "Always map the final hours to these estimator buckets only: low=12, medium=32, high=64.",
    "If an integration is unfamiliar, compare it to the closest references and choose the most defensible bucket.",
    "Return JSON only with this shape: {\"classifications\":[{\"name\":\"Stripe\",\"complexity\":\"low\",\"reason\":\"...\"}]}",
    "",
    "Reference integrations:",
    referenceTable,
    "",
    "Integrations to classify:",
    integrations.map((integration) => `- ${integration}`).join("\n"),
  ].join("\n");
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return headers.get("x-real-ip") || "unknown";
}

function isIntegrationComplexity(
  value: string | undefined
): value is IntegrationComplexity {
  return value === "low" || value === "medium" || value === "high";
}
