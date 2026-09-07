import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus:outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-[#146949] text-white shadow-xs hover:bg-[#0e4832] active:scale-[0.98]",
                destructive:
                    "bg-red-600 text-white shadow-xs hover:bg-red-700 active:scale-[0.98]",
                outline:
                    "border border-[#dde7e2] bg-white text-[#11281e] shadow-2xs hover:bg-[#f8faf9] hover:border-[#b8cec4] hover:text-[#0e4832] active:scale-[0.98]",
                secondary:
                    "bg-[#eaf5f0] text-[#146949] shadow-xs hover:bg-[#d5ede1] active:scale-[0.98]",
                ghost: "hover:bg-[#eaf5f0] hover:text-[#0e4832]",
                link: "text-[#146949] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 text-sm",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-11 rounded-md px-8 text-base",
                icon: "h-9 w-9",
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
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
