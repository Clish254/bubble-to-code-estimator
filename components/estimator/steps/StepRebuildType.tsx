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
}> = [
  {
    value: "sameUx",
    title: "An exact rebuild",
    description: "Same app, same flows, just moved off Bubble and onto code.",
  },
  {
    value: "partial",
    title: "A partial rebuild",
    description: "Move part of the app to code, leave the rest on Bubble for now.",
  },
  {
    value: "fullRebuild",
    title: "A full redesign",
    description: "A fresh version of the product, with a new look and improved flows.",
  },
];

function StepRebuildType({ value, onChange }: StepRebuildTypeProps) {
  return (
    <StepShell
      eyebrow="Step 3"
      title="What are you looking for?"
      description="How far do you want this rebuild to go?"
      aside="Pick the closest match. We'll dig into the detail on a call."
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
            checked={value === option.value}
          />
        ))}
      </RadioGroup>
    </StepShell>
  );
}

export { StepRebuildType };
