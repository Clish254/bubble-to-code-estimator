import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CounterInputProps {
  label: string;
  badge?: string;
  value: number;
  onChange: (value: number) => void;
  density?: "default" | "compact";
  className?: string;
}

function CounterInput({
  label,
  badge,
  value,
  onChange,
  density = "default",
  className,
}: CounterInputProps) {
  const isCompact = density === "compact";

  return (
    <div
      className={cn(
        "rounded-[1.4rem] border border-border/75 bg-white/72",
        isCompact
          ? "flex items-center justify-between gap-3 px-3.5 py-3"
          : "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "font-semibold tracking-[-0.02em] text-foreground",
              isCompact ? "text-[0.98rem] leading-6" : "text-base"
            )}
          >
            {label}
          </p>
          {badge ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center",
          isCompact ? "gap-1.5 self-center" : "gap-2 self-start sm:self-center"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Decrease ${label}`}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className={cn(isCompact && "size-10 rounded-[0.95rem]")}
        >
          <Minus />
        </Button>
        <Input
          aria-label={label}
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className={cn(
            "border-border/80 bg-white text-center font-semibold tracking-[-0.02em]",
            isCompact
              ? "h-10 w-16 rounded-[0.95rem] px-2 text-sm"
              : "h-11 w-20 rounded-[1rem] text-base"
          )}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className={cn(isCompact && "size-10 rounded-[0.95rem]")}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}

export { CounterInput };
