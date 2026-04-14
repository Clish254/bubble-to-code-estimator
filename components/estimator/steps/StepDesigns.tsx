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
      title="Do you have existing designs?"
      description="We use this to decide how much of the frontend direction is already established before the coded rebuild begins."
      aside="If there are no designs yet, we add the upfront design lift. If you also include a formal design phase later, both pieces stack together."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as ExistingDesignsOption)}
        className="gap-4"
      >
        <RadioOption
          value="ready"
          title="Yes, designs are ready"
          description="You have a clean Figma or Sketch source of truth the rebuild can work from."
          badge="×0.90"
          checked={value === "ready"}
        />
        <RadioOption
          value="partial"
          title="Partial designs"
          description="Some core screens or components are designed, but the system is not fully locked in."
          badge="×1.00"
          checked={value === "partial"}
        />
        <RadioOption
          value="none"
          title="No designs yet"
          description="The coded rebuild still needs upfront design direction before implementation can move quickly."
          badge="+40 hrs"
          checked={value === "none"}
        />
      </RadioGroup>
    </StepShell>
  );
}

export { StepDesigns };
