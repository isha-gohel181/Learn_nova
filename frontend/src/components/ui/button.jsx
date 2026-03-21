import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out outline-none select-none backdrop-blur-xl shadow-[0_0_18px_rgba(59,130,246,0.16)] hover:shadow-[0_0_28px_rgba(59,130,246,0.32)] hover:-translate-y-0.5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/60 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white shadow-[0_0_22px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]",
        outline:
          "border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-foreground hover:bg-[rgba(255,255,255,0.08)] aria-expanded:bg-[rgba(255,255,255,0.08)] aria-expanded:text-foreground",
        secondary:
          "bg-[rgba(59,130,246,0.15)] text-[#93C5FD] hover:bg-[rgba(59,130,246,0.25)] aria-expanded:bg-[rgba(59,130,246,0.2)] aria-expanded:text-[#E5E7EB]",
        ghost:
          "border-transparent bg-transparent hover:bg-[rgba(255,255,255,0.08)] hover:text-foreground aria-expanded:bg-[rgba(255,255,255,0.08)]",
        destructive:
          "border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.1)] text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.2)] focus-visible:border-destructive/60 focus-visible:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
