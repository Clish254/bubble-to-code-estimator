import { Checkbox } from "@/components/ui/checkbox";
import { StepShell } from "@/components/estimator/StepShell";
import { cn } from "@/lib/utils";
import type { QaLevelOption } from "@/lib/types";

interface StepExtrasProps {
  includeDesignPhase: boolean;
  includeProjectManagement: boolean;
  qaLevel: QaLevelOption;
  onDesignPhaseChange: (checked: boolean) => void;
  onProjectManagementChange: (checked: boolean) => void;
  onQaLevelChange: (value: QaLevelOption) => void;
}

function StepExtras({
  includeDesignPhase,
  includeProjectManagement,
  qaLevel,
  onDesignPhaseChange,
  onProjectManagementChange,
  onQaLevelChange,
}: StepExtrasProps) {
  return (
    <StepShell
      eyebrow="Step 10"
      title="Anything else to include?"
      description="Optional add-ons. Pick what you want in scope. Leave the rest for later."
    >
      <div className="space-y-3">
        <SelectableCheckbox
          title="Design phase"
          description="We run design and planning before the build starts."
          checked={includeDesignPhase}
          onChange={onDesignPhaseChange}
        />
        <SelectableCheckbox
          title="Project management"
          description="A dedicated PM to keep things on track and communicate with you."
          checked={includeProjectManagement}
          onChange={onProjectManagementChange}
        />
        <SelectableCheckbox
          title="Basic QA"
          description="We manually test everything before launch."
          checked={qaLevel === "basic"}
          onChange={(checked) => onQaLevelChange(checked ? "basic" : "none")}
        />
        <SelectableCheckbox
          title="Full QA with automated tests"
          description="Manual testing plus an automated test suite that keeps running after launch."
          checked={qaLevel === "full"}
          onChange={(checked) => onQaLevelChange(checked ? "full" : "none")}
        />
      </div>
    </StepShell>
  );
}

interface SelectableCheckboxProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SelectableCheckbox({
  title,
  description,
  checked,
  onChange,
}: SelectableCheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-[1.4rem] border border-border/80 bg-white/75 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--gs-soft)] hover:bg-white",
        checked &&
          "border-[var(--gs-deep)] bg-[color-mix(in_srgb,var(--primary)_18%,white)] shadow-[0_18px_38px_-28px_rgba(54,73,60,0.45)]"
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
        className="mt-1 size-5 rounded-[0.45rem] border-border/90 bg-white data-checked:border-[var(--gs-deep)] data-checked:bg-[var(--gs-deep)]"
      />
      <div className="space-y-1">
        <span className="text-base font-semibold tracking-[-0.02em]">{title}</span>
        <p className="max-w-[52ch] text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </label>
  );
}

export { StepExtras };
