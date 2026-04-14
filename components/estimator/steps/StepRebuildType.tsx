import { StepShell } from "@/components/estimator/StepShell";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "@/components/ui/radio-option";
import type { RebuildTypeOption } from "@/lib/types";

interface StepRebuildTypeProps {
  value: RebuildTypeOption | null;
  onChange: (value: RebuildTypeOption) => void;
}

const OPTIONS: Array<{
  value: RebuildTypeOption;
  title: string;
  description: string;
  badge: string;
}> = [
  {
    value: "sameUx",
    title: "Same app, same UX",
    description: "A close rebuild of the current product without fresh UX or architectural ambition.",
    badge: "×0.80",
  },
  {
    value: "redesigned",
    title: "Same logic, redesigned",
    description: "A rebuild with thoughtful UI refinement while the underlying feature set stays familiar.",
    badge: "×1.00",
  },
  {
    value: "partial",
    title: "Partial rebuild",
    description: "Only a portion of the product moves to code, keeping the overall scope tighter.",
    badge: "×0.70",
  },
  {
    value: "fullRebuild",
    title: "Full rebuild plus improvements",
    description: "A broader rewrite with improved architecture, UX, and product capability.",
    badge: "×1.30",
  },
];

function StepRebuildType({ value, onChange }: StepRebuildTypeProps) {
  return (
    <StepShell
      eyebrow="Step 3"
      title="What type of rebuild do you need?"
      description="This choice acts as a multiplier across the broader build, rather than adding fixed hours on its own."
      aside="If you're aiming for a cleaner architecture, a more ambitious UX, or meaningful product improvements, choose the fuller rebuild path."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as RebuildTypeOption)}
        className="gap-4"
      >
        {OPTIONS.map((option) => (
          <RadioOption
            key={option.value}
            value={option.value}
            title={option.title}
            description={option.description}
            badge={option.badge}
            checked={value === option.value}
          />
        ))}
      </RadioGroup>
    </StepShell>
  );
}

export { StepRebuildType };
