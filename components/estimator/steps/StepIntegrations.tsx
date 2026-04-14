import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepShell } from "@/components/estimator/StepShell";
import { TextInput } from "@/components/ui/text-input";
import type { IntegrationClassification, IntegrationComplexity } from "@/lib/types";

interface StepIntegrationsProps {
  value: string;
  status: "idle" | "loading" | "ready" | "error";
  message: string | null;
  classifications: IntegrationClassification[];
  onChange: (value: string) => void;
  onComplexityChange: (
    integrationName: string,
    complexity: IntegrationComplexity
  ) => void;
}

const COMPLEXITY_OPTIONS: Array<{
  value: IntegrationComplexity;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function StepIntegrations({
  value,
  status,
  message,
  classifications,
  onChange,
  onComplexityChange,
}: StepIntegrationsProps) {
  return (
    <StepShell
      eyebrow="Step 5"
      title="What integrations does your Bubble app use?"
      description="List them as plain text. We’ll classify each one into the closest estimator bucket and let you adjust the result before you continue."
      aside="Leave this blank if the app does not depend on third-party integrations yet. If it does, list one item per line or separate them with commas."
    >
      <TextInput
        label="Integrations"
        description="Examples: Stripe, HubSpot, custom SSO, QuickBooks, Google Maps."
        value={value}
        onChange={onChange}
        placeholder="Stripe, HubSpot, custom SSO"
      />

      {status === "loading" ? (
        <Card
          eyebrow="Analyzing"
          title="Analyzing your integrations..."
          description="We’re comparing each integration against Goodspeed’s reference table so the estimate keeps moving without forcing you into manual math."
        >
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-white/70 px-4 py-4">
            <div className="size-3 animate-pulse rounded-full bg-primary" />
            <p className="text-sm leading-6 text-muted-foreground">
              This usually takes a moment. You’ll be able to adjust anything that feels too light or too heavy.
            </p>
          </div>
        </Card>
      ) : null}

      {status !== "loading" && message ? (
        <div className="rounded-[1.2rem] border border-[var(--gs-soft)]/30 bg-[color-mix(in_srgb,var(--primary)_14%,white)] px-4 py-3 text-sm leading-6 text-[var(--gs-deep)]">
          {message}
        </div>
      ) : null}

      {status === "ready" && classifications.length ? (
        <div className="space-y-4">
          {classifications.map((classification) => (
            <Card
              key={classification.name}
              className="border-border/75 bg-white/78 p-4"
              data-testid={`integration-${classification.name}`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.03em]">
                      {classification.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {classification.reason}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    <Sparkles className="size-3.5" />
                    {classification.hours} hrs
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COMPLEXITY_OPTIONS.map((option) => {
                    const selected = classification.complexity === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant={selected ? "secondary" : "outline"}
                        className={selected ? "bg-[var(--gs-deep)] text-white" : ""}
                        onClick={() =>
                          onComplexityChange(classification.name, option.value)
                        }
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {!value.trim() && status !== "loading" ? (
        <Card
          className="bg-white/60"
          eyebrow="Optional"
          title="No integrations listed yet"
          description="That’s completely fine. You can continue with a zero-integration estimate and we’ll keep the rest of the model deterministic."
        />
      ) : null}
    </StepShell>
  );
}

export { StepIntegrations };
