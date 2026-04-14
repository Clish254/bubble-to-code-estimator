import { Card } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { StepShell } from "@/components/estimator/StepShell";

interface StepFeaturesProps {
  simpleCount: number;
  mediumCount: number;
  complexCount: number;
  onSimpleChange: (value: number) => void;
  onMediumChange: (value: number) => void;
  onComplexChange: (value: number) => void;
}

function StepFeatures({
  simpleCount,
  mediumCount,
  complexCount,
  onSimpleChange,
  onMediumChange,
  onComplexChange,
}: StepFeaturesProps) {
  const subtotal = simpleCount * 8 + mediumCount * 24 + complexCount * 56;

  return (
    <StepShell
      className="lg:grid-cols-1 xl:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)]"
      eyebrow="Step 4"
      title="How many features sit at each complexity level?"
      description="We use three buckets so you can get a grounded range without manually breaking down every workflow."
      aside="Count the feature modules that carry actual implementation weight: onboarding, dashboards, search, payments, approvals, real-time flows, and so on."
    >
      <div className="space-y-4 xl:max-w-[36rem]">
        <NumberInput
          label="Simple features"
          description="CRUD screens, lists, forms, and standard product flows."
          value={simpleCount}
          hoursLabel="8 hrs each"
          onChange={onSimpleChange}
        />
        <NumberInput
          label="Medium features"
          description="Search, filtering, dashboards, and logic-heavy but familiar app behaviors."
          value={mediumCount}
          hoursLabel="24 hrs each"
          onChange={onMediumChange}
        />
        <NumberInput
          label="Complex features"
          description="Payments, AI, real-time behavior, orchestration, or operationally sensitive workflows."
          value={complexCount}
          hoursLabel="56 hrs each"
          onChange={onComplexChange}
        />
      </div>

      <Card
        className="border-[var(--gs-soft)]/30 bg-[color-mix(in_srgb,var(--primary)_18%,white)]"
        eyebrow="Feature subtotal"
        title={`${subtotal} hours of scoped feature work`}
        description="This excludes integrations, admin tooling, migration, and delivery multipliers, which get added later in the model."
      />
    </StepShell>
  );
}

export { StepFeatures };
