import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[1rem] border border-transparent px-4 py-2 text-sm font-medium tracking-[-0.02em] whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(54,73,60,0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-20px_rgba(54,73,60,0.7)]",
        secondary:
          "bg-accent text-accent-foreground shadow-[0_12px_30px_-22px_rgba(36,47,40,0.55)] hover:-translate-y-0.5 hover:bg-[var(--gs-deeper)]",
        outline:
          "border-border bg-white/85 text-foreground hover:-translate-y-0.5 hover:bg-white",
        ghost:
          "text-foreground hover:bg-secondary/75",
        destructive:
          "bg-destructive text-white shadow-[0_12px_30px_-20px_rgba(221,94,69,0.65)] hover:-translate-y-0.5 hover:brightness-[1.04]",
        link: "h-auto rounded-none px-0 py-0 text-[var(--gs-deep)] underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "min-h-10 rounded-[0.9rem] px-3.5 py-2 text-sm",
        lg: "min-h-12 rounded-[1.15rem] px-5 py-3 text-base",
        icon: "size-11 rounded-[1rem] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
