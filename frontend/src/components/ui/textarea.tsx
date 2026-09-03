import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-xl border border-input bg-background px-3 py-3 text-base shadow-none transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-muted/65 disabled:text-muted-foreground disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-0 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
