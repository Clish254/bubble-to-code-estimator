import { useId } from "react";
import type { ReactNode } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TextInputProps {
  label: string;
  description?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function TextInput({
  label,
  description,
  value,
  onChange,
  placeholder,
  className,
}: TextInputProps) {
  const inputId = useId();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold tracking-[0.01em] text-foreground"
        >
          {label}
        </label>
        {description ? (
          <div className="text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      <Textarea
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-32 rounded-[1.4rem] border-border/80 bg-white/80 px-4 py-3 text-base leading-7 placeholder:text-muted-foreground/90"
      />
    </div>
  );
}

export { TextInput };
