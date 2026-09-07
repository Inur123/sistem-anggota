import * as React from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    fallback: string;
}

export function Avatar({
    src,
    alt,
    fallback,
    className,
    ...props
}: AvatarProps) {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        setHasError(false);
    }, [src]);

    const showImage = Boolean(src && !hasError);

    return (
        <div
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-lg bg-[#146949] text-white font-bold select-none border border-[#146949]/20",
                className
            )}
            {...props}
        >
            {showImage ? (
                <img
                    src={src!}
                    alt={alt || fallback}
                    className="aspect-square size-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className="flex size-full items-center justify-center">
                    {fallback ? fallback.slice(0, 1).toUpperCase() : "A"}
                </span>
            )}
        </div>
    );
}
