import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StepShellProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

function StepShell({
  eyebrow,
  title,
  description,
  aside,
  children,
  className,
}: StepShellProps) {
  return (
    <div
      className={cn(
        "grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.12fr)] lg:gap-10",
        className
      )}
    >
      <div className="space-y-5">
        <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <div className="space-y-3">
          <h2 className="max-w-[15ch] text-balance text-3xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[2.4rem]">
            {title}
          </h2>
          <div className="max-w-[52ch] text-base leading-7 text-muted-foreground">
            {description}
          </div>
        </div>
        {aside ? (
          <div className="rounded-[1.4rem] border border-border/70 bg-white/55 p-4 text-sm leading-6 text-[var(--gs-deep)]">
            {aside}
          </div>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export { StepShell };
