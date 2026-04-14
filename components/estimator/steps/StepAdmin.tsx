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
      description="Internal tooling and reporting can add meaningful scope, especially once a product needs moderation, support operations, or exports."
      aside="This answer also auto-maps the hidden reporting overhead: None 0 hrs, Basic 16 hrs, Advanced 48 hrs."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as AdminDashboardOption)}
        className="gap-4"
      >
        <RadioOption
          value="none"
          title="No admin dashboard"
          description="The coded rebuild can stay focused on the customer-facing product only."
          badge="+0 hrs"
          checked={value === "none"}
        />
        <RadioOption
          value="basic"
          title="Basic admin"
          description="A lighter internal surface for user lists, metrics, and straightforward exports."
          badge="+40 hrs"
          meta="Includes hidden reporting time for basic exports."
          checked={value === "basic"}
        />
        <RadioOption
          value="advanced"
          title="Advanced admin"
          description="A broader internal back office with moderation, overrides, CMS behavior, or heavier operations flows."
          badge="+100 hrs"
          meta="Includes hidden reporting time for advanced reporting."
          checked={value === "advanced"}
        />
      </RadioGroup>
    </StepShell>
  );
}

export { StepAdmin };
