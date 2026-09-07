import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

interface AlertDialogContextValue {
    open?: boolean;
    setOpen?: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({});

const AlertDialog = ({
    open,
    onOpenChange,
    ...props
}: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const currentOpen = isControlled ? open : uncontrolledOpen;

    const handleOpenChange = React.useCallback(
        (nextOpen: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(nextOpen);
            }
            onOpenChange?.(nextOpen);
        },
        [isControlled, onOpenChange]
    );

    return (
        <AlertDialogContext.Provider
            value={{ open: currentOpen, setOpen: handleOpenChange }}
        >
            <AlertDialogPrimitive.Root
                open={currentOpen}
                onOpenChange={handleOpenChange}
                {...props}
            />
        </AlertDialogContext.Provider>
    );
};

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
        className={cn(
            "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
        ref={ref}
    />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
        showCloseButton?: boolean;
    }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
    const { setOpen } = React.useContext(AlertDialogContext);

    return (
        <AlertDialogPortal>
            <AlertDialogOverlay
                onClick={() => {
                    setOpen?.(false);
                }}
            />
            <AlertDialogPrimitive.Content
                ref={ref}
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-[#dde7e2] bg-white p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <AlertDialogPrimitive.Cancel asChild>
                        <button
                            type="button"
                            className="absolute right-4 top-4 rounded-lg p-1 text-[#566e63] hover:text-[#11281e] hover:bg-[#f8faf9] transition-colors cursor-pointer focus:outline-none disabled:pointer-events-none"
                            aria-label="Tutup dialog"
                        >
                            <X size={18} />
                            <span className="sr-only">Tutup dialog</span>
                        </button>
                    </AlertDialogPrimitive.Cancel>
                )}
            </AlertDialogPrimitive.Content>
        </AlertDialogPortal>
    );
});
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2.5 gap-2 pt-2",
            className
        )}
        {...props}
    />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-bold text-[#11281e]", className)}
        {...props}
    />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-[#566e63] leading-relaxed", className)}
        {...props}
    />
));
AlertDialogDescription.displayName =
    AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
        ref={ref}
        className={cn(buttonVariants(), className)}
        {...props}
    />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn(
            buttonVariants({ variant: "outline" }),
            className
        )}
        {...props}
    />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
