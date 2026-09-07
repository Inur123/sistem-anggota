import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-[#dde7e2] bg-white px-3.5 py-2 text-sm text-[#11281e] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#566e63]/60 hover:border-[#b8cec4] focus:outline-none focus-visible:outline-none focus:border-[#146949] focus-visible:border-[#146949] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8faf9]",
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
