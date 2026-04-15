import { Card } from "@/components/ui/card";
import { StepShell } from "@/components/estimator/StepShell";
import { TextInput } from "@/components/ui/text-input";
import type { IntegrationClassification } from "@/lib/types";

interface StepIntegrationsProps {
  value: string;
  status: "idle" | "loading" | "ready" | "error";
  message: string | null;
  classifications: IntegrationClassification[];
  onChange: (value: string) => void;
}

function StepIntegrations({
  value,
  status,
  message,
  classifications,
  onChange,
}: StepIntegrationsProps) {
  return (
    <StepShell
      eyebrow="Step 5"
      title="Which tools does your app connect to?"
      description="Think Stripe, HubSpot, logins, anything your app talks to. Leave blank if none."
      aside="List them however you like. Commas or one per line both work."
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
          eyebrow="Thinking..."
          title="Checking your integrations"
          description="One moment. We're sizing each one up."
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

      {status === "ready" && classifications.length ? (
        <div className="space-y-4">
          {classifications.map((classification) => (
            <Card
              key={classification.name}
              className="border-border/75 bg-white/78 p-4"
              data-testid={`integration-${classification.name}`}
            >
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em]">
                  {classification.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {classification.reason}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {!value.trim() && status !== "loading" ? (
        <Card
          className="bg-white/60"
          eyebrow="Optional"
          title="No integrations? No problem."
          description="Skip ahead. We'll keep the rest of the estimate simple."
        />
      ) : null}
    </StepShell>
  );
}

export { StepIntegrations };
