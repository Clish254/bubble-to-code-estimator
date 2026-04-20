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
      title="Do you have Figma designs ready?"
      description="Building from Figma is faster than relying solely on your Bubble app, especially if you're making changes."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as ExistingDesignsOption)}
        className="gap-4"
      >
        <RadioOption
          value="ready"
          title="Yes, fully designed in Figma"
          description="A complete set of screens we can build straight from."
          checked={value === "ready"}
        />
        <RadioOption
          value="partial"
          title="Some screens are in Figma"
          description="Key pages are designed, but others still need work."
          checked={value === "partial"}
        />
        <RadioOption
          value="none"
          title="No Figma designs yet"
          description="We'll design them before starting the code rebuild."
          checked={value === "none"}
        />
      </RadioGroup>
    </StepShell>
  );
}

export { StepDesigns };
