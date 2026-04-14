import { StepShell } from "@/components/estimator/StepShell";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "@/components/ui/radio-option";
import type { UserRolesOption } from "@/lib/types";

interface StepUserRolesProps {
  value: UserRolesOption | null;
  onChange: (value: UserRolesOption) => void;
}

const OPTIONS: Array<{
  value: UserRolesOption;
  title: string;
  description: string;
  badge: string;
  meta: string;
}> = [
  {
    value: "one",
    title: "1 role",
    description: "A single experience with minimal permission branching.",
    badge: "+0 hrs",
    meta: "Auto-maps permissions to Simple (8 hrs).",
  },
  {
    value: "twoToThree",
    title: "2 to 3 roles",
    description: "Role-based access, guarded flows, and a more nuanced auth surface.",
    badge: "+40 hrs",
    meta: "Auto-maps permissions to Medium (24 hrs).",
  },
  {
    value: "fourPlus",
    title: "4+ roles",
    description: "A more complex matrix of permissions, access control, and user states.",
    badge: "+80 hrs",
    meta: "Auto-maps permissions to Complex (56 hrs).",
  },
];

function StepUserRoles({ value, onChange }: StepUserRolesProps) {
  return (
    <StepShell
      eyebrow="Step 2"
      title="How many user roles does your app have?"
      description="This shapes both role complexity and the hidden permissions overhead used in the model."
      aside="The role count auto-sets permissions complexity behind the scenes, so you do not need to answer that separately."
    >
      <RadioGroup
        value={value ?? ""}
        onValueChange={(nextValue) => onChange(nextValue as UserRolesOption)}
        className="gap-4"
      >
        {OPTIONS.map((option) => (
          <RadioOption
            key={option.value}
            value={option.value}
            title={option.title}
            description={option.description}
            badge={option.badge}
            meta={option.meta}
            checked={value === option.value}
          />
        ))}
      </RadioGroup>
    </StepShell>
  );
}

export { StepUserRoles };
