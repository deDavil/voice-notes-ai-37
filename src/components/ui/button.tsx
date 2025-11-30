import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] rounded-lg shadow-sm",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg",
        outline: "border border-border bg-background text-foreground hover:bg-secondary rounded-lg shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] rounded-lg shadow-sm",
        soft: "bg-accent text-accent-foreground hover:bg-accent/80 rounded-lg",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-md",
        recording: "bg-recording text-primary-foreground shadow-recording animate-pulse-recording rounded-lg",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-5",
        xl: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
        "icon-xl": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
