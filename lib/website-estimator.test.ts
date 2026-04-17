import { describe, expect, it } from "vitest";

import {
  calculateWebsiteEstimate,
  normalizeWebsiteEstimateInput,
} from "@/lib/website-estimator";

describe("calculateWebsiteEstimate", () => {
  it("returns the base package total by default", () => {
    const configuration = normalizeWebsiteEstimateInput({});

    expect(configuration).not.toBeNull();

    const result = calculateWebsiteEstimate(configuration!);

    expect(result.total).toBe(15_000);
    expect(result.ctaLabelAmount).toBe("$15,000");
    expect(result.itemizedExtras).toEqual([]);
  });

  it("adds $1,000 for each extra page", () => {
    const result = calculateWebsiteEstimate({
      featurePages: 2,
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
    });

    expect(result.total).toBe(17_000);
    expect(result.extraPagesTotal).toBe(2_000);
  });

  it("adds $1,000 for each selected index page", () => {
    const result = calculateWebsiteEstimate({
      featurePages: 0,
      integrationPages: 0,
      caseStudyPages: 0,
      solutionPages: 0,
      competitorComparisonPages: 0,
      otherPages: 0,
      featureIndex: true,
      integrationIndex: false,
      caseStudyIndex: true,
      solutionIndex: false,
      competitorComparisonIndex: false,
    });

    expect(result.total).toBe(17_000);
    expect(result.indexPagesTotal).toBe(2_000);
  });

  it("totals mixed page counts and index selections correctly", () => {
    const result = calculateWebsiteEstimate({
      featurePages: 2,
      integrationPages: 1,
      caseStudyPages: 0,
      solutionPages: 0,
      competitorComparisonPages: 0,
      otherPages: 1,
      featureIndex: false,
      integrationIndex: false,
      caseStudyIndex: true,
      solutionIndex: false,
      competitorComparisonIndex: false,
    });

    expect(result.total).toBe(20_000);
    expect(result.ctaLabelAmount).toBe("$20,000");
  });

  it("generates itemized extras for counts and indexes", () => {
    const result = calculateWebsiteEstimate({
      featurePages: 3,
      integrationPages: 0,
      caseStudyPages: 0,
      solutionPages: 0,
      competitorComparisonPages: 0,
      otherPages: 0,
      featureIndex: false,
      integrationIndex: true,
      caseStudyIndex: false,
      solutionIndex: false,
      competitorComparisonIndex: false,
    });

    expect(result.itemizedExtras).toEqual([
      {
        key: "featurePages",
        label: "Feature pages",
        quantity: 3,
        amount: 3_000,
        kind: "page",
      },
      {
        key: "integrationIndex",
        label: "Integration index",
        quantity: 1,
        amount: 1_000,
        kind: "index",
      },
    ]);
  });
});
