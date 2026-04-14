import { useId } from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  label: string;
  description: string;
  value: number;
  hoursLabel: string;
  onChange: (value: number) => void;
}

function NumberInput({
  label,
  description,
  value,
  hoursLabel,
  onChange,
}: NumberInputProps) {
  const inputId = useId();

  return (
    <div className="rounded-[1.4rem] border border-border/75 bg-white/75 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={inputId}
              className="text-base font-semibold tracking-[-0.02em]"
            >
              {label}
            </label>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {hoursLabel}
            </span>
          </div>
          <p className="max-w-[32ch] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-start gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          <Minus />
        </Button>
        <Input
          id={inputId}
          type="number"
          min={0}
          inputMode="numeric"
          value={Number.isNaN(value) ? 0 : value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className={cn(
            "h-11 w-24 rounded-[1rem] border-border/80 bg-white text-center text-base font-semibold tracking-[-0.02em]"
          )}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}

export { NumberInput };
