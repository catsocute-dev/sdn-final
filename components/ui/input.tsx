import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-stone-800 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 shadow-[2px_2px_0px_#292524] transition-all placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:bg-amber-50/60 focus-visible:shadow-[3px_3px_0px_#292524] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
