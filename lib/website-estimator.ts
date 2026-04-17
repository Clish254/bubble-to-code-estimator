const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const WEBSITE_PACKAGE_LABEL = "Fixed-price website build";
export const WEBSITE_BASE_PACKAGE_NAME = "Starter Kit";
export const WEBSITE_PLATFORM = "Framer";
export const WEBSITE_BASE_PRICE = 15_000;
export const WEBSITE_EXTRA_PAGE_PRICE = 1_000;

export const WEBSITE_INCLUDED_DELIVERABLES = [
  "Positioning Workshop",
  "Creative Direction",
  "Sitemap Workshop",
  "Homepage",
  "4 Feature pages",
  "Pricing page",
  "About page",
  "Demo / contact page",
  "Blog and content migration",
] as const;

export type WebsiteIncludedDeliverable = (typeof WEBSITE_INCLUDED_DELIVERABLES)[number];

export const WEBSITE_INCLUDED_DELIVERABLE_INFO: Partial<
  Record<WebsiteIncludedDeliverable, string>
> = {
  "Positioning Workshop":
    "We align on your audience, value prop, and positioning before any copy or design starts.",
  "Creative Direction":
    "We define the visual direction, references, and overall site feel so every page stays cohesive.",
  "Sitemap Workshop":
    "We map the core pages and user journeys together so the website structure is clear before the build.",
};

export const WEBSITE_PAGE_CATEGORY_META = [
  {
    key: "featurePages",
    label: "Feature pages",
    description: "Additional product or use-case pages beyond the included four.",
  },
  {
    key: "integrationPages",
    label: "Integration pages",
    description: "Dedicated pages for integrations, partners, or ecosystem workflows.",
  },
  {
    key: "caseStudyPages",
    label: "Case study pages",
    description: "Individual story pages for customer wins and proof.",
  },
  {
    key: "solutionPages",
    label: "Solution pages",
    description: "Pages tailored to personas, industries, or solution angles.",
  },
  {
    key: "competitorComparisonPages",
    label: "Competitor comparison pages",
    description: "Structured alternative pages for comparison-driven traffic.",
  },
  {
    key: "otherPages",
    label: "Other pages",
    description: "Anything else that does not fit the standard buckets above.",
  },
] as const;

export const WEBSITE_INDEX_PAGE_META = [
  {
    key: "featureIndex",
    label: "Feature index",
  },
  {
    key: "integrationIndex",
    label: "Integration index",
  },
  {
    key: "caseStudyIndex",
    label: "Case study index",
  },
  {
    key: "solutionIndex",
    label: "Solution index",
  },
  {
    key: "competitorComparisonIndex",
    label: "Competitor comparison index",
  },
] as const;

export type WebsitePageCategory = (typeof WEBSITE_PAGE_CATEGORY_META)[number]["key"];
export type WebsiteIndexPageKey = (typeof WEBSITE_INDEX_PAGE_META)[number]["key"];

export interface WebsiteEstimateInput {
  featurePages: number;
  integrationPages: number;
  caseStudyPages: number;
  solutionPages: number;
  competitorComparisonPages: number;
  otherPages: number;
  featureIndex: boolean;
  integrationIndex: boolean;
  caseStudyIndex: boolean;
  solutionIndex: boolean;
  competitorComparisonIndex: boolean;
}

export interface WebsiteEstimateLineItem {
  key: WebsitePageCategory | WebsiteIndexPageKey;
  label: string;
  quantity: number;
  amount: number;
  kind: "page" | "index";
}

export interface WebsiteEstimateResult {
  total: number;
  basePackagePrice: number;
  basePackageName: string;
  packageLabel: string;
  platform: string;
  includedDeliverables: readonly WebsiteIncludedDeliverable[];
  itemizedExtras: WebsiteEstimateLineItem[];
  selectedPageCounts: Record<WebsitePageCategory, number>;
  selectedIndexPages: WebsiteIndexPageKey[];
  extraPagesTotal: number;
  indexPagesTotal: number;
  ctaLabelAmount: string;
}

export interface WebsiteEstimateSlackPayload {
  text: string;
  blocks: Array<Record<string, unknown>>;
}

export const DEFAULT_WEBSITE_ESTIMATE_INPUT: WebsiteEstimateInput = {
  featurePages: 0,
  integrationPages: 0,
  caseStudyPages: 0,
  solutionPages: 0,
  competitorComparisonPages: 0,
  otherPages: 0,
  featureIndex: false,
  integrationIndex: false,
  caseStudyIndex: false,
  solutionIndex: false,
  competitorComparisonIndex: false,
};

export function normalizeWebsiteEstimateInput(value: unknown): WebsiteEstimateInput | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    featurePages: sanitizeCount(value.featurePages),
    integrationPages: sanitizeCount(value.integrationPages),
    caseStudyPages: sanitizeCount(value.caseStudyPages),
    solutionPages: sanitizeCount(value.solutionPages),
    competitorComparisonPages: sanitizeCount(value.competitorComparisonPages),
    otherPages: sanitizeCount(value.otherPages),
    featureIndex: sanitizeBoolean(value.featureIndex),
    integrationIndex: sanitizeBoolean(value.integrationIndex),
    caseStudyIndex: sanitizeBoolean(value.caseStudyIndex),
    solutionIndex: sanitizeBoolean(value.solutionIndex),
    competitorComparisonIndex: sanitizeBoolean(value.competitorComparisonIndex),
  };
}

export function calculateWebsiteEstimate(
  input: WebsiteEstimateInput
): WebsiteEstimateResult {
  const normalizedInput = {
    featurePages: sanitizeCount(input.featurePages),
    integrationPages: sanitizeCount(input.integrationPages),
    caseStudyPages: sanitizeCount(input.caseStudyPages),
    solutionPages: sanitizeCount(input.solutionPages),
    competitorComparisonPages: sanitizeCount(input.competitorComparisonPages),
    otherPages: sanitizeCount(input.otherPages),
    featureIndex: Boolean(input.featureIndex),
    integrationIndex: Boolean(input.integrationIndex),
    caseStudyIndex: Boolean(input.caseStudyIndex),
    solutionIndex: Boolean(input.solutionIndex),
    competitorComparisonIndex: Boolean(input.competitorComparisonIndex),
  } satisfies WebsiteEstimateInput;

  const selectedPageCounts = WEBSITE_PAGE_CATEGORY_META.reduce<
    Record<WebsitePageCategory, number>
  >((accumulator, category) => {
    accumulator[category.key] = normalizedInput[category.key];
    return accumulator;
  }, {} as Record<WebsitePageCategory, number>);

  const pageExtras = WEBSITE_PAGE_CATEGORY_META.flatMap((category) => {
    const quantity = normalizedInput[category.key];
    if (quantity <= 0) {
      return [];
    }

    return [
      {
        key: category.key,
        label: category.label,
        quantity,
        amount: quantity * WEBSITE_EXTRA_PAGE_PRICE,
        kind: "page" as const,
      },
    ];
  });

  const indexExtras = WEBSITE_INDEX_PAGE_META.flatMap((indexPage) => {
    if (!normalizedInput[indexPage.key]) {
      return [];
    }

    return [
      {
        key: indexPage.key,
        label: indexPage.label,
        quantity: 1,
        amount: WEBSITE_EXTRA_PAGE_PRICE,
        kind: "index" as const,
      },
    ];
  });

  const itemizedExtras = [...pageExtras, ...indexExtras];
  const extraPagesTotal = pageExtras.reduce((total, item) => total + item.amount, 0);
  const indexPagesTotal = indexExtras.reduce((total, item) => total + item.amount, 0);
  const total = WEBSITE_BASE_PRICE + extraPagesTotal + indexPagesTotal;

  return {
    total,
    basePackagePrice: WEBSITE_BASE_PRICE,
    basePackageName: WEBSITE_BASE_PACKAGE_NAME,
    packageLabel: WEBSITE_PACKAGE_LABEL,
    platform: WEBSITE_PLATFORM,
    includedDeliverables: WEBSITE_INCLUDED_DELIVERABLES,
    itemizedExtras,
    selectedPageCounts,
    selectedIndexPages: indexExtras.map((item) => item.key as WebsiteIndexPageKey),
    extraPagesTotal,
    indexPagesTotal,
    ctaLabelAmount: formatWebsiteEstimateCurrency(total),
  };
}

export function formatWebsiteEstimateCurrency(value: number): string {
  return currencyFormatter.format(Math.max(0, Math.round(value)));
}

export function isValidEstimateEmail(value: string): boolean {
  const email = value.trim();

  if (!email) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildWebsiteEstimateSlackPayload(params: {
  email: string;
  configuration: WebsiteEstimateInput;
  estimate: WebsiteEstimateResult;
}): WebsiteEstimateSlackPayload {
  const { email, configuration, estimate } = params;
  const submittedAt = new Date().toISOString();
  const extrasSummary = estimate.itemizedExtras.length
    ? estimate.itemizedExtras
        .map((item) => {
          const quantityLabel = item.quantity > 1 ? ` x${item.quantity}` : "";
          return `• ${item.label}${quantityLabel} — ${formatWebsiteEstimateCurrency(item.amount)}`;
        })
        .join("\n")
    : "No extra pages selected.";
  const pageCountSummary = WEBSITE_PAGE_CATEGORY_META.map((category) => {
    return `${category.label}: ${configuration[category.key]}`;
  }).join("\n");
  const indexSummary =
    estimate.selectedIndexPages.length > 0
      ? estimate.selectedIndexPages
          .map((key) => WEBSITE_INDEX_PAGE_META.find((item) => item.key === key)?.label ?? key)
          .join(", ")
      : "None";

  return {
    text: `New website estimate quote request from ${email} for ${formatWebsiteEstimateCurrency(estimate.total)}.`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "New website estimate quote request",
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Email*\n${email}`,
          },
          {
            type: "mrkdwn",
            text: `*Source*\nwebsite-estimate`,
          },
          {
            type: "mrkdwn",
            text: `*Total estimate*\n${formatWebsiteEstimateCurrency(estimate.total)}`,
          },
          {
            type: "mrkdwn",
            text: `*Platform*\n${estimate.platform}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Base package*\n${estimate.basePackageName} — ${formatWebsiteEstimateCurrency(estimate.basePackagePrice)}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Selected extras*\n${extrasSummary}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Page counts submitted*\n${pageCountSummary}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Index pages selected*\n${indexSummary}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Submitted at ${submittedAt}`,
          },
        ],
      },
    ],
  };
}

function sanitizeCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function sanitizeBoolean(value: unknown): boolean {
  return value === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
