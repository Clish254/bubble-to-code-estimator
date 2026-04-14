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
      title="What extras should we include?"
      description="Use this final step to reflect the delivery envelope you want Goodspeed to own, from design through QA."
      aside="Project management and QA act as multipliers. The design phase adds direct hours. Basic QA and full QA are mutually exclusive."
    >
      <div className="space-y-3">
        <SelectableCheckbox
          title="Design phase"
          description="Goodspeed runs the discovery sprint and UX/UI design before implementation."
          meta="+80 hrs"
          checked={includeDesignPhase}
          onChange={onDesignPhaseChange}
        />
        <SelectableCheckbox
          title="Project management"
          description="Dedicated PM coordination, communication, and delivery oversight."
          meta="×1.10"
          checked={includeProjectManagement}
          onChange={onProjectManagementChange}
        />
        <SelectableCheckbox
          title="Basic QA"
          description="A manual testing pass before delivery."
          meta="×1.10"
          checked={qaLevel === "basic"}
          onChange={(checked) => onQaLevelChange(checked ? "basic" : "none")}
        />
        <SelectableCheckbox
          title="Full QA plus automated tests"
          description="A deeper QA track with automated coverage in the delivery scope."
          meta="×1.25"
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
  meta: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SelectableCheckbox({
  title,
  description,
  meta,
  checked,
  onChange,
}: SelectableCheckboxProps) {
  return (
    <label
      className={cn(
        "flex min-h-28 cursor-pointer items-start gap-4 rounded-[1.4rem] border border-border/80 bg-white/75 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--gs-soft)] hover:bg-white",
        checked &&
          "border-[var(--gs-deep)] bg-[color-mix(in_srgb,var(--primary)_18%,white)] shadow-[0_18px_38px_-28px_rgba(54,73,60,0.45)]"
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
        className="mt-1 size-5 rounded-[0.45rem] border-border/90 bg-white data-checked:border-[var(--gs-deep)] data-checked:bg-[var(--gs-deep)]"
      />
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold tracking-[-0.02em]">{title}</span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {meta}
          </span>
        </div>
        <p className="max-w-[52ch] text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </label>
  );
}

export { StepExtras };
