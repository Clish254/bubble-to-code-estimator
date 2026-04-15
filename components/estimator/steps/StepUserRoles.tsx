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
}> = [
  {
    value: "one",
    title: "Just one",
    description: "Everyone using the app sees the same thing.",
  },
  {
    value: "twoToThree",
    title: "Two or three",
    description: "For example, users and admins, maybe a manager role too.",
  },
  {
    value: "fourPlus",
    title: "Four or more",
    description: "Several user types, each with different access.",
  },
];

function StepUserRoles({ value, onChange }: StepUserRolesProps) {
  return (
    <StepShell
      eyebrow="Step 2"
      title="How many types of users does your app have?"
      description="Users, admins, managers, anyone who sees a different version of the app."
      aside="We'll handle the permissions details. Just pick the option that feels right."
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
            checked={value === option.value}
          />
        ))}
      </RadioGroup>
    </StepShell>
  );
}

export { StepUserRoles };
