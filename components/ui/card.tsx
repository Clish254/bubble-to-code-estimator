import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  eyebrow?: string;
  title?: string;
  description?: ReactNode;
}

function Card({
  className,
  eyebrow,
  title,
  description,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "surface-panel rounded-[1.75rem] border border-border/70 bg-white/70 p-5 sm:p-6",
        className
      )}
      {...props}
    >
      {(eyebrow || title || description) && (
        <div className="mb-5 space-y-2">
          {eyebrow ? (
            <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="text-xl font-semibold tracking-[-0.03em]">{title}</h3>
          ) : null}
          {description ? (
            <div className="max-w-[60ch] text-sm leading-6 text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}

export { Card };
