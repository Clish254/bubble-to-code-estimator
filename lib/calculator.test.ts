import { describe, expect, it } from "vitest";

import { calculateEstimate, normalizeEstimateInput } from "@/lib/calculator";
import type { EstimatorAnswers } from "@/lib/types";

function createBaseAnswers(): EstimatorAnswers {
  return {
    appSize: "mid",
    userRoles: "twoToThree",
    rebuildType: "redesigned",
    simpleFeatureCount: 3,
    mediumFeatureCount: 2,
    complexFeatureCount: 1,
    integrationsText: "Stripe",
    integrationClassifications: [
      {
        name: "Stripe",
        complexity: "low",
        hours: 12,
        reason: "Matches the low-complexity Stripe reference.",
      },
    ],
    uiQuality: "polished",
    deviceSupport: "desktopMobile",
    existingDesigns: "partial",
    adminDashboard: "basic",
    dataMigration: "none",
    techDebt: "none",
    documentation: "partial",
    includeDesignPhase: false,
    includeProjectManagement: false,
    qaLevel: "none",
  };
}

describe("calculateEstimate", () => {
  it("matches the mapping-sheet canonical scenario", () => {
    const result = calculateEstimate(normalizeEstimateInput(createBaseAnswers()));

    expect(result.directHours).toBe(604);
    expect(result.costMid).toBe(57984);
    expect(result.costLow).toBe(49286.4);
    expect(result.costHigh).toBe(69580.8);
    expect(result.totalWeeks).toBe(24.65);
    expect(result.monthsLow).toBeCloseTo(4.83891, 4);
    expect(result.monthsHigh).toBeCloseTo(6.83141, 4);
    expect(result.tier).toBe("Scale");
  });

  it("stacks no-design lift and formal design phase hours", () => {
    const baseline = calculateEstimate(normalizeEstimateInput(createBaseAnswers()));
    const withDesignWork = calculateEstimate(
      normalizeEstimateInput({
        ...createBaseAnswers(),
        existingDesigns: "none",
        includeDesignPhase: true,
      })
    );

    expect(withDesignWork.directHours - baseline.directHours).toBe(120);
  });

  it("applies the full QA multiplier instead of the basic QA multiplier", () => {
    const basicQa = calculateEstimate(
      normalizeEstimateInput({
        ...createBaseAnswers(),
        qaLevel: "basic",
      })
    );
    const fullQa = calculateEstimate(
      normalizeEstimateInput({
        ...createBaseAnswers(),
        qaLevel: "full",
      })
    );

    expect(basicQa.combinedMultiplier).toBeCloseTo(1.1, 5);
    expect(fullQa.combinedMultiplier).toBeCloseTo(1.25, 5);
    expect(fullQa.costMid).toBeGreaterThan(basicQa.costMid);
  });

  it("maps smaller scopes into Starter and large scopes into Enterprise", () => {
    const starter = calculateEstimate(
      normalizeEstimateInput({
        ...createBaseAnswers(),
        appSize: "mvp",
        userRoles: "one",
        rebuildType: "sameUx",
        simpleFeatureCount: 0,
        mediumFeatureCount: 0,
        complexFeatureCount: 0,
        integrationsText: "",
        integrationClassifications: [],
        uiQuality: "basic",
        deviceSupport: "desktop",
        existingDesigns: "ready",
        adminDashboard: "none",
        documentation: "good",
      })
    );

    const enterprise = calculateEstimate(
      normalizeEstimateInput({
        ...createBaseAnswers(),
        appSize: "large",
        userRoles: "fourPlus",
        rebuildType: "fullRebuild",
        simpleFeatureCount: 8,
        mediumFeatureCount: 6,
        complexFeatureCount: 4,
        integrationsText: "Salesforce, QuickBooks, custom SSO",
        integrationClassifications: [
          {
            name: "Salesforce",
            complexity: "high",
            hours: 64,
            reason: "High-complexity CRM sync.",
          },
          {
            name: "QuickBooks",
            complexity: "high",
            hours: 64,
            reason: "High-complexity accounting sync.",
          },
          {
            name: "custom SSO",
            complexity: "high",
            hours: 64,
            reason: "Enterprise auth complexity.",
          },
        ],
        uiQuality: "premium",
        deviceSupport: "fullResponsive",
        existingDesigns: "none",
        adminDashboard: "advanced",
        dataMigration: "complex",
        techDebt: "major",
        documentation: "none",
        includeDesignPhase: true,
        includeProjectManagement: true,
        qaLevel: "full",
      })
    );

    expect(starter.tier).toBe("Starter");
    expect(enterprise.tier).toBe("Enterprise");
  });
});
