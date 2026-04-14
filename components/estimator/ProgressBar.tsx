"use client";

import {
  Progress,
} from "@/components/ui/progress";
import { TOTAL_STEPS } from "@/lib/constants";

interface ProgressBarProps {
  currentStep: number;
  currentTitle: string;
}

function ProgressBar({ currentStep, currentTitle }: ProgressBarProps) {
  const completedSteps = currentStep >= TOTAL_STEPS ? TOTAL_STEPS : currentStep + 1;
  const progressValue = (completedSteps / TOTAL_STEPS) * 100;

  return (
    <div className="rounded-[1.6rem] border border-border/75 bg-white/65 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Step {completedSteps} of {TOTAL_STEPS}
        </p>
        <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {Math.round(progressValue)}%
        </p>
      </div>
      <Progress value={progressValue} />
      <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">{currentTitle}</p>
    </div>
  );
}

export { ProgressBar };
