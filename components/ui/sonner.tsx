"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      closeButton
      richColors
      position="top-center"
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            "border border-border/80 bg-[var(--gs-surface-strong)] text-foreground shadow-[0_20px_44px_-28px_rgba(36,47,40,0.35)]",
          title: "text-sm font-semibold tracking-[-0.02em]",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          closeButton:
            "border-border/80 bg-white text-muted-foreground hover:bg-secondary",
        },
      }}
    />
  );
}

export { Toaster, toast };
