import { StepShell } from "@/components/estimator/StepShell";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "@/components/ui/radio-option";
import type { AppSizeOption } from "@/lib/types";

interface StepAppSizeProps {
  value: AppSizeOption | null;
  onChange: (value: AppSizeOption) => void;
}

const OPTIONS: Array<{
  value: AppSizeOption;
  title: string;
  description: string;
}> = [
  {
    value: "mvp",
    title: "Small",
    description: "3–5 main screens. An MVP or a focused product.",
  },
  {
    value: "mid",
    title: "Medium",
    description: "6–15 screens with a few connected flows.",
  },
  {
    value: "large",
    title: "Large",
    description: "16+ screens, multiple user types, bigger product.",
  },
];

function StepAppSize({ value, onChange }: StepAppSizeProps) {
  return (
    <StepShell
      eyebrow="Step 1"
      title="How big is your app?"
      description="Pick the closest match to the product you have today."
      aside="Not sure where you land? Go with your gut. We can refine it on a call."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as AppSizeOption)}
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

export { StepAppSize };
