"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTimeline, weeksToDays } from "@/lib/calculator";
import type { EstimateResult, EstimatorAnswers } from "@/lib/types";

interface ResultsScreenProps {
  estimate: EstimateResult;
  answers: EstimatorAnswers;
  onRecalculate: () => void;
}

function ResultsScreen({ estimate, answers, onRecalculate }: ResultsScreenProps) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const daysLow = weeksToDays(estimate.totalWeeks * 0.85);
  const daysHigh = weeksToDays(estimate.totalWeeks * 1.2);
  const timelineLabel = formatTimeline(daysLow, daysHigh);

  const savingsTips = buildSavingsTips(answers);

  return (
    <div className="space-y-6">
      <Card
        className="overflow-hidden rounded-[2rem] border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,242,237,0.92))] p-6 sm:p-8"
        eyebrow="Your estimate"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Estimated price
              </p>
              <h2 className="text-balance text-4xl leading-[0.95] font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Starts at {formatCurrency(estimate.costLow)}
              </h2>
              <p className="text-sm font-medium text-muted-foreground sm:text-base">
                {formatCurrency(estimate.costLow)} – {formatCurrency(estimate.costHigh)}
              </p>
            </div>
            {savingsTips.length > 0 ? (
              <div className="space-y-3 rounded-[1.25rem] border border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--gs-accent)_18%,white)] p-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--gs-deep)] uppercase">
                  Ways to bring this down
                </p>
                <ul className="space-y-2 text-sm leading-6 text-foreground">
                  {savingsTips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-[var(--gs-deep)]"
                      />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="space-y-2">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Estimated timeline
              </p>
              <p className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {timelineLabel}
              </p>
            </div>
          </div>

          <div className="space-y-5 rounded-[1.6rem] border border-border/75 bg-[color-mix(in_srgb,var(--primary)_14%,white)] p-5">
            <a
              href="https://goodspeed.studio/contact"
              className="inline-flex min-h-12 w-full items-center justify-between rounded-[1.1rem] bg-primary px-4 py-3 text-base font-semibold tracking-[-0.02em] text-primary-foreground shadow-[0_18px_38px_-20px_rgba(54,73,60,0.55)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Book a 15 min call</span>
              <span className="inline-flex size-9 items-center justify-center rounded-[0.85rem] bg-[var(--gs-deep)] text-white">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
            <p className="text-xs leading-5 text-muted-foreground">
              Most teams leave with a lower number.
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onRecalculate}
            >
              Recalculate
            </Button>

            <p className="text-sm leading-6 text-muted-foreground">
              200+ products launched · Bubble Agency of the Year · 5.0 on Clutch
            </p>
          </div>
        </div>
      </Card>

      <Collapsible
        open={isBreakdownOpen}
        onOpenChange={setIsBreakdownOpen}
        className="rounded-[1.6rem] border border-border/75 bg-white/65 px-5 py-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em]">
              See how we got this number
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              The details behind the range, which answers moved it, and why.
            </p>
          </div>
          <CollapsibleTrigger className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/65">
            {isBreakdownOpen ? "Hide details" : "Show details"}
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isBreakdownOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="pt-5">
          <div className="space-y-4">
            <Card className="border-border/75 bg-white/75 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--gs-deep)] px-3 py-1.5 text-sm font-semibold tracking-[0.02em] text-white">
                  {estimate.tier}
                </span>
                <p className="max-w-[54ch] text-sm leading-6 text-muted-foreground">
                  {estimate.tierDescription}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                About {weeksToDays(estimate.totalWeeks)} working days in total,
                including a short planning phase before we start building.
              </p>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              {estimate.breakdown.map((group) => (
                <Card
                  key={group.title}
                  className="h-full border-border/75 bg-white/75 p-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-base font-semibold tracking-[-0.02em]">
                        {group.title}
                      </p>
                      {group.subtotalLabel && group.subtotalValue ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          {group.subtotalLabel}:{" "}
                          <span className="font-semibold text-foreground">
                            {group.subtotalValue}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div
                          key={`${group.title}-${item.label}`}
                          className="flex items-start justify-between gap-4 text-sm leading-6"
                        >
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              "text-right font-medium text-foreground",
                              item.emphasis && "text-[var(--gs-deep)]",
                            )}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function buildSavingsTips(answers: EstimatorAnswers): string[] {
  const tips: string[] = [];

  if (answers.existingDesigns === "none" || answers.existingDesigns === "partial") {
    tips.push("Bring finished designs — save ~10–15%");
  }

  if (answers.dataMigration && answers.dataMigration !== "none") {
    tips.push("Skip or simplify migration — save ~$2–5k");
  }

  if (answers.techDebt === "major") {
    tips.push("Handle cleanup in-house — save ~$3k");
  }

  if (answers.qaLevel === "full") {
    tips.push("Start with basic QA — save ~10%");
  }

  if (answers.uiQuality === "premium") {
    tips.push("Start with polished UI, upgrade later");
  }

  return tips.slice(0, 3);
}

function formatCurrency(value: number) {
  const rounded = Math.ceil(value / 1000) * 1000;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rounded);
}

export { ResultsScreen };
