import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheck, Info, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";

type SonnerProps = ToasterProps;

const Toaster = ({ ...props }: SonnerProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-4 text-emerald-600" />,
        info: <Info className="size-4 text-blue-600" />,
        warning: <AlertTriangle className="size-4 text-amber-600" />,
        error: <AlertCircle className="size-4 text-red-600" />,
        loading: <Loader2 className="size-4 animate-spin text-emerald-600" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-emerald-600 group-[.toast]:text-white group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600",
          error: "group-[.toaster]:border-red-200 group-[.toaster]:text-red-700",
          success: "group-[.toaster]:border-emerald-200 group-[.toaster]:text-emerald-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
