import { StepShell } from "@/components/estimator/StepShell";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "@/components/ui/radio-option";
import type { ExistingDesignsOption } from "@/lib/types";

interface StepDesignsProps {
  value: ExistingDesignsOption | null;
  onChange: (value: ExistingDesignsOption) => void;
}

function StepDesigns({ value, onChange }: StepDesignsProps) {
  return (
    <StepShell
      eyebrow="Step 7"
      title="Do you already have designs?"
      description="Figma, Sketch, or anything our team can build from."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as ExistingDesignsOption)}
        className="gap-4"
      >
        <RadioOption
          value="ready"
          title="Yes, designs are ready"
          description="A complete set our team can build straight from."
          checked={value === "ready"}
        />
        <RadioOption
          value="partial"
          title="Some are done, some aren't"
          description="A few key screens exist, but the rest still need design work."
          checked={value === "partial"}
        />
        <RadioOption
          value="none"
          title="Not yet"
          description="No designs yet. We'll build them before the rebuild starts."
          checked={value === "none"}
        />
      </RadioGroup>
    </StepShell>
  );
}

export { StepDesigns };
