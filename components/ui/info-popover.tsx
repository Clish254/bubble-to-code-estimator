import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

interface InfoPopoverProps {
  label: string;
  description: string;
  className?: string;
}

function InfoPopover({ label, description, className }: InfoPopoverProps) {
  return (
    <span className={cn("group relative inline-flex shrink-0", className)}>
      <button
        type="button"
        aria-label={`More information about ${label}`}
        className="inline-flex size-4 shrink-0 items-center justify-center bg-transparent text-[#aeb8ad] transition-colors duration-200 hover:text-[#d8e48f] focus-visible:text-[#d8e48f] focus-visible:outline-none"
      >
        <Info className="size-3.5" />
      </button>
      <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 w-56 -translate-y-1/2 rounded-[0.9rem] border border-white/10 bg-[#1f2821] px-3 py-2 text-left text-xs leading-5 text-[#f2eae4] opacity-0 shadow-[0_20px_44px_-30px_rgba(0,0,0,0.8)] transition-all duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {description}
      </span>
    </span>
  );
}

export { InfoPopover };
