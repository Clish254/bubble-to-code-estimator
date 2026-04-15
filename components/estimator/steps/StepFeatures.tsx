import { Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StepShell } from "@/components/estimator/StepShell";
import { TextInput } from "@/components/ui/text-input";
import type { FeatureClassification } from "@/lib/types";

interface StepFeaturesProps {
  value: string;
  status: "idle" | "loading" | "ready" | "error";
  message: string | null;
  classification: FeatureClassification | null;
  onChange: (value: string) => void;
}

function StepFeatures({
  value,
  status,
  message,
  classification,
  onChange,
}: StepFeaturesProps) {
  const totalCount =
    classification !== null
      ? classification.simple + classification.medium + classification.complex
      : 0;

  return (
    <StepShell
      eyebrow="Step 4"
      title="What are the main things people do in your app?"
      description="Describe it in a sentence or two, in plain language."
      aside="Think about sign-ups, dashboards, search, messaging, payments, whatever your app does today."
    >
      <TextInput
        label="Main things users do"
        description="Example: users sign up, browse listings, book appointments, pay with a card, and message the provider."
        value={value}
        onChange={onChange}
        placeholder="Users sign up, create a profile, book a session, and pay."
      />

      {status === "loading" ? (
        <Card
          eyebrow="Thinking..."
          title="Reading your description"
          description="One moment. We're sizing it up."
        >
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-white/70 px-4 py-4">
            <div className="size-3 animate-pulse rounded-full bg-primary" />
            <p className="text-sm leading-6 text-muted-foreground">
              This usually takes just a second.
            </p>
          </div>
        </Card>
      ) : null}

      {status !== "loading" && message ? (
        <div className="rounded-[1.2rem] border border-[var(--gs-soft)]/30 bg-[color-mix(in_srgb,var(--primary)_14%,white)] px-4 py-3 text-sm leading-6 text-[var(--gs-deep)]">
          {message}
        </div>
      ) : null}

      {status === "ready" && classification ? (
        <Card
          className="border-border/75 bg-white/78 p-4"
          data-testid="feature-classification"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-lg font-semibold tracking-[-0.03em]">
                We picked up around {totalCount} core {totalCount === 1 ? "thing" : "things"} your app does.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {classification.summary}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              <Sparkles className="size-3.5" />
              Got it
            </div>
          </div>
        </Card>
      ) : null}

      {!value.trim() && status !== "loading" ? (
        <Card
          className="bg-white/60"
          eyebrow="Tip"
          title="A sentence or two is plenty."
          description="No need to list everything. We'll dig into the detail on a call."
        />
      ) : null}
    </StepShell>
  );
}

export { StepFeatures };
