import type { ReactNode } from "react";

import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface RadioOptionProps {
  value: string;
  title: string;
  description: string;
  meta?: ReactNode;
  badge?: string;
  checked?: boolean;
}

function RadioOption({
  value,
  title,
  description,
  meta,
  badge,
  checked,
}: RadioOptionProps) {
  return (
    <label
      className={cn(
        "group flex min-h-28 cursor-pointer items-start gap-4 rounded-[1.4rem] border border-border/80 bg-white/75 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--gs-soft)] hover:bg-white",
        checked &&
          "border-[var(--gs-deep)] bg-[color-mix(in_srgb,var(--primary)_18%,white)] shadow-[0_18px_38px_-28px_rgba(54,73,60,0.45)]"
      )}
    >
      <RadioGroupItem
        value={value}
        className={cn(
          "mt-1 size-5 border-border/90 bg-white data-checked:border-[var(--gs-deep)] data-checked:bg-[var(--gs-deep)]"
        )}
      />
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold tracking-[-0.02em]">{title}</span>
          {badge ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.74rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="max-w-[48ch] text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {meta ? <div className="text-sm text-[var(--gs-deep)]">{meta}</div> : null}
      </div>
    </label>
  );
}

export { RadioOption };
