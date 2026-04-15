import { StepShell } from "@/components/estimator/StepShell";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "@/components/ui/radio-option";
import type { AdminDashboardOption } from "@/lib/types";

interface StepAdminProps {
  value: AdminDashboardOption | null;
  onChange: (value: AdminDashboardOption) => void;
}

function StepAdmin({ value, onChange }: StepAdminProps) {
  return (
    <StepShell
      eyebrow="Step 8"
      title="Do you need an admin dashboard?"
      description="A private area for your team to manage users, content, or reports."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as AdminDashboardOption)}
        className="gap-4"
      >
        <RadioOption
          value="none"
          title="No, we don't need one"
          description="The app is for customers only."
          checked={value === "none"}
        />
        <RadioOption
          value="basic"
          title="Basic admin"
          description="User lists, quick metrics, and simple exports."
          checked={value === "basic"}
        />
        <RadioOption
          value="advanced"
          title="Advanced admin"
          description="Moderation, reports, and more powerful back-office tools."
          checked={value === "advanced"}
        />
      </RadioGroup>
    </StepShell>
  );
}

export { StepAdmin };
