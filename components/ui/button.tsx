import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none active:translate-x-[2px] active:translate-y-[2px]",
  {
    variants: {
      variant: {
        default:
          "bg-amber-600 text-white border-2 border-stone-800 shadow-[3px_3px_0px_#292524] hover:bg-amber-500 hover:shadow-[4px_4px_0px_#292524] active:shadow-none",
        destructive:
          "bg-rose-500 text-white border-2 border-stone-800 shadow-[3px_3px_0px_#292524] hover:bg-rose-600 active:shadow-none",
        outline:
          "bg-white text-stone-800 border-2 border-stone-800 shadow-[3px_3px_0px_#292524] hover:bg-amber-50 active:shadow-none",
        secondary:
          "bg-amber-100 text-stone-800 border-2 border-stone-800 shadow-[3px_3px_0px_#292524] hover:bg-amber-200 active:shadow-none",
        ghost:
          "text-stone-800 hover:bg-stone-200/70 border border-transparent hover:border-stone-800 rounded-lg",
        link: "text-amber-700 underline-offset-4 hover:underline font-bold",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-7 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
