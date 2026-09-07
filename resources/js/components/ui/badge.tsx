import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#146949] focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[#146949] text-white shadow-2xs hover:bg-[#0e4832]",
                secondary:
                    "border-[#146949]/20 bg-[#eaf5f0] text-[#146949] hover:bg-[#d5ede1]",
                destructive:
                    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                outline:
                    "text-[#11281e] border-[#146949]",
                success:
                    "border-[#146949]/20 bg-[#eaf5f0] text-[#146949]",
                warning:
                    "border-amber-200 bg-amber-50 text-amber-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
