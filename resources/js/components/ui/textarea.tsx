import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-lg border border-[#dde7e2] bg-white px-3.5 py-2.5 text-sm text-[#11281e] transition-colors placeholder:text-[#566e63]/60 hover:border-[#b8cec4] focus:outline-none focus-visible:outline-none focus:border-[#146949] focus-visible:border-[#146949] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8faf9]",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
