"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { id as indonesia } from "date-fns/locale";
import { CalendarDaysIcon, ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type MemberDatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  "aria-invalid"?: boolean;
};

function dateFromValue(value: string) {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

export function MemberDatePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled,
  maxDate,
  minDate = new Date(1940, 0, 1),
  "aria-invalid": ariaInvalid,
}: MemberDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = dateFromValue(value);
  const endMonth = maxDate ?? new Date();

  return (
    <Popover open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 w-full justify-start gap-2.5 rounded-xl border border-input bg-background px-3 text-left text-sm font-semibold shadow-none transition-colors hover:bg-background focus-visible:border-primary focus-visible:ring-0 aria-expanded:bg-background data-[popup-open]:border-primary data-[popup-open]:bg-background",
          !selected && "text-muted-foreground",
        )}
      >
        <CalendarDaysIcon className="size-4 text-primary" />
        <span className="min-w-0 flex-1 truncate">
          {selected ? format(selected, "dd MMMM yyyy", { locale: indonesia }) : placeholder}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl border border-border bg-popover p-0 shadow-xl ring-0">
        <Calendar
          mode="single"
          locale={indonesia}
          selected={selected}
          defaultMonth={selected ?? endMonth}
          startMonth={minDate}
          endMonth={endMonth}
          captionLayout="dropdown"
          disabled={maxDate ? { after: maxDate } : undefined}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
