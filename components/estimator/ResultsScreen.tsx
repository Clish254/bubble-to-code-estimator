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
import type { EstimateResult } from "@/lib/types";

interface ResultsScreenProps {
  estimate: EstimateResult;
  onRecalculate: () => void;
}

function ResultsScreen({ estimate, onRecalculate }: ResultsScreenProps) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card
        className="overflow-hidden rounded-[2rem] border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,242,237,0.92))] p-6 sm:p-8"
        eyebrow="Your estimate"
      >
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Estimated price range
              </p>
              <h2 className="text-balance text-4xl leading-[0.95] font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                {formatCurrency(estimate.costLow)} - {formatCurrency(estimate.costHigh)}
              </h2>
            </div>
            <p className="max-w-[56ch] text-base leading-7 text-muted-foreground">
              This is the client-facing range for your Bubble-to-code rebuild based on the inputs you shared.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Estimated timeline
              </p>
              <p className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {formatMonths(estimate.monthsLow)} - {formatMonths(estimate.monthsHigh)} months
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                That translates to roughly {estimate.totalWeeks.toFixed(1)} total weeks including the discovery sprint.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-border/75 bg-white/75 p-4">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Recommended tier
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--gs-deep)] px-3 py-1.5 text-sm font-semibold tracking-[0.02em] text-white">
                  {estimate.tier}
                </span>
                <p className="max-w-[42ch] text-sm leading-6 text-muted-foreground">
                  {estimate.tierDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-[1.6rem] border border-border/75 bg-[color-mix(in_srgb,var(--primary)_14%,white)] p-5">
            <div className="space-y-2">
              <p className="text-lg font-semibold tracking-[-0.03em]">
                Ready to pressure-test the range?
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                We’ll turn this estimate into a sharper conversation around architecture, risk, and delivery sequencing.
              </p>
            </div>

            <a
              href="https://goodspeed.studio/contact"
              className="inline-flex min-h-12 w-full items-center justify-between rounded-[1.1rem] bg-primary px-4 py-3 text-base font-semibold tracking-[-0.02em] text-primary-foreground shadow-[0_18px_38px_-20px_rgba(54,73,60,0.55)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Book a Call</span>
              <span className="inline-flex size-9 items-center justify-center rounded-[0.85rem] bg-[var(--gs-deep)] text-white">
                <ArrowUpRight className="size-4" />
              </span>
            </a>

            <Button type="button" variant="outline" className="w-full" onClick={onRecalculate}>
              Recalculate
            </Button>

            <p className="text-sm leading-6 text-muted-foreground">
              200+ products launched · Bubble Agency of the Year · 5.0 on Clutch
            </p>
          </div>
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
              Breakdown summary
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              A quick look at the major contributors behind the range.
            </p>
          </div>
          <CollapsibleTrigger className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/65">
            {isBreakdownOpen ? "Hide details" : "Show details"}
            <ChevronDown
              className={cn("size-4 transition-transform", isBreakdownOpen && "rotate-180")}
            />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="pt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {estimate.breakdown.map((group) => (
              <Card key={group.title} className="h-full border-border/75 bg-white/75 p-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-base font-semibold tracking-[-0.02em]">{group.title}</p>
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
                        <span className="text-muted-foreground">{item.label}</span>
                        <span
                          className={cn(
                            "text-right font-medium text-foreground",
                            item.emphasis && "text-[var(--gs-deep)]"
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function formatCurrency(value: number) {
  const rounded = Math.round(value / 100) * 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rounded);
}

function formatMonths(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

export { ResultsScreen };
