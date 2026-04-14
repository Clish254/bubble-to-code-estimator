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
  badge: string;
}> = [
  {
    value: "mvp",
    title: "MVP",
    description: "A focused product with 3 to 5 core screens and a tighter rebuild scope.",
    badge: "120 hrs",
  },
  {
    value: "mid",
    title: "Mid-sized app",
    description: "A product with 6 to 15 screens, multiple flows, and a typical SaaS footprint.",
    badge: "320 hrs",
  },
  {
    value: "large",
    title: "Large platform",
    description: "A 16 to 30+ screen product with broader internal tooling and deeper system needs.",
    badge: "600 hrs",
  },
];

function StepAppSize({ value, onChange }: StepAppSizeProps) {
  return (
    <StepShell
      eyebrow="Step 1"
      title="How big is your Bubble app?"
      description="Choose the option that best reflects the product you have today, not the roadmap you hope to add later."
      aside="Screen count is the strongest single scope signal in the model, so it anchors the rest of the estimate."
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
            badge={option.badge}
            checked={value === option.value}
          />
        ))}
      </RadioGroup>
    </StepShell>
  );
}

export { StepAppSize };
