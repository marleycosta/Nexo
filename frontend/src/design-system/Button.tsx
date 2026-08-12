import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-soft hover:brightness-110",
        secondary:
          "bg-neutral-100 text-neutral-800 border border-neutral-200 hover:bg-neutral-200",
        danger: "bg-danger text-danger-foreground shadow-soft hover:brightness-110",
        ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
        outline:
          "bg-transparent border border-neutral-300 text-neutral-800 hover:bg-neutral-100",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
