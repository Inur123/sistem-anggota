import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select";

const MONTHS = [
    { value: 0, label: "Januari", short: "Jan" },
    { value: 1, label: "Februari", short: "Feb" },
    { value: 2, label: "Maret", short: "Mar" },
    { value: 3, label: "April", short: "Apr" },
    { value: 4, label: "Mei", short: "Mei" },
    { value: 5, label: "Juni", short: "Jun" },
    { value: 6, label: "Juli", short: "Jul" },
    { value: 7, label: "Agustus", short: "Agu" },
    { value: 8, label: "September", short: "Sep" },
    { value: 9, label: "Oktober", short: "Okt" },
    { value: 10, label: "November", short: "Nov" },
    { value: 11, label: "Desember", short: "Des" },
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatIndonesianDate(isoString?: string): string {
    if (!isoString) return "";
    const parts = isoString.split("-");
    if (parts.length !== 3) return isoString;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return isoString;
    const monthName = MONTHS[month]?.label || `${month + 1}`;
    return `${day} ${monthName} ${year}`;
}

export interface DatePickerProps {
    id?: string;
    value?: string; // YYYY-MM-DD
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    min?: string; // YYYY-MM-DD
    max?: string; // YYYY-MM-DD
    fromYear?: number;
    toYear?: number;
    defaultYear?: number;
    className?: string;
}

export function DatePicker({
    id,
    value,
    onChange,
    placeholder = "dd/mm/yyyy",
    disabled = false,
    min,
    max,
    fromYear = 1960,
    toYear = new Date().getFullYear() + 2,
    defaultYear,
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // Parse initial date from value if present
    const parsedDate = React.useMemo(() => {
        if (!value) return null;
        const parts = value.split("-");
        if (parts.length !== 3) return null;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
        return { year: y, month: m, day: d };
    }, [value]);

    const initialYear = parsedDate?.year ?? defaultYear ?? new Date().getFullYear();
    const initialMonth = parsedDate?.month ?? (parsedDate ? 0 : new Date().getMonth());

    const [viewYear, setViewYear] = React.useState<number>(initialYear);
    const [viewMonth, setViewMonth] = React.useState<number>(initialMonth);

    // Sync view with incoming value if opened
    React.useEffect(() => {
        if (parsedDate) {
            setViewYear(parsedDate.year);
            setViewMonth(parsedDate.month);
        } else if (defaultYear) {
            setViewYear(defaultYear);
        }
    }, [value, defaultYear]);

    // Years list from toYear down to fromYear
    const years = React.useMemo(() => {
        const list: number[] = [];
        for (let y = toYear; y >= fromYear; y--) {
            list.push(y);
        }
        return list;
    }, [fromYear, toYear]);

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => Math.max(y - 1, fromYear));
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => Math.min(y + 1, toYear));
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    // Calculate calendar grid days
    const daysMatrix = React.useMemo(() => {
        const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const cells: {
            day: number;
            month: number;
            year: number;
            isCurrentMonth: boolean;
            dateString: string;
            isDisabled: boolean;
            isSelected: boolean;
            isToday: boolean;
        }[] = [];

        const todayObj = new Date();
        const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

        // Previous month trailing days
        const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
        const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const str = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isDisabled = Boolean((min && str < min) || (max && str > max));
            cells.push({
                day: d,
                month: prevMonth,
                year: prevYear,
                isCurrentMonth: false,
                dateString: str,
                isDisabled,
                isSelected: str === value,
                isToday: str === todayStr,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInCurrentMonth; d++) {
            const str = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isDisabled = Boolean((min && str < min) || (max && str > max));
            cells.push({
                day: d,
                month: viewMonth,
                year: viewYear,
                isCurrentMonth: true,
                dateString: str,
                isDisabled,
                isSelected: str === value,
                isToday: str === todayStr,
            });
        }

        // Next month leading days (fill up grid to multiples of 7)
        const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
        const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        const remaining = 7 - (cells.length % 7);
        if (remaining > 0 && remaining < 7) {
            for (let d = 1; d <= remaining; d++) {
                const str = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const isDisabled = Boolean((min && str < min) || (max && str > max));
                cells.push({
                    day: d,
                    month: nextMonth,
                    year: nextYear,
                    isCurrentMonth: false,
                    dateString: str,
                    isDisabled,
                    isSelected: str === value,
                    isToday: str === todayStr,
                });
            }
        }

        return cells;
    }, [viewYear, viewMonth, min, max, value]);

    const handleSelectDate = (dateStr: string) => {
        onChange?.(dateStr);
        setOpen(false);
    };

    const handleClear = () => {
        onChange?.("");
        setOpen(false);
    };

    const handleToday = () => {
        const todayObj = new Date();
        const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;
        if (!((min && todayStr < min) || (max && todayStr > max))) {
            onChange?.(todayStr);
            setViewYear(todayObj.getFullYear());
            setViewMonth(todayObj.getMonth());
            setOpen(false);
        }
    };

    const displayLabel = value ? formatIndonesianDate(value) : placeholder;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    id={id}
                    disabled={disabled}
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-lg border border-[#dde7e2] bg-white px-3.5 py-2 text-sm text-[#11281e] transition-colors hover:border-[#b8cec4] focus:outline-none focus:border-[#146949] data-[state=open]:border-[#146949] disabled:cursor-not-allowed disabled:bg-[#f8faf9] disabled:text-[#566e63] cursor-pointer",
                        !value && "text-[#566e63]/60",
                        className
                    )}
                >
                    <span className="truncate">{displayLabel}</span>
                    <CalendarIcon className="h-4 w-4 text-[#146949] shrink-0 ml-2" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-3.5 bg-white border border-[#dde7e2] shadow-xl rounded-xl select-none"
                align="start"
            >
                {/* Header with Month/Year dropdowns and Prev/Next buttons */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-[#dde7e2]">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#146949] hover:bg-[#eaf5f0] hover:text-[#0e4832] rounded-lg cursor-pointer"
                        onClick={handlePrevMonth}
                        aria-label="Bulan sebelumnya"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                        {/* Month Selector */}
                        <Select
                            value={String(viewMonth)}
                            onValueChange={(val) => setViewMonth(Number(val))}
                        >
                            <SelectTrigger className="h-8 px-2 border-none bg-transparent hover:bg-[#eaf5f0] text-xs font-bold text-[#11281e] gap-1 shadow-none focus:border-transparent">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                                {MONTHS.map((m) => (
                                    <SelectItem
                                        key={m.value}
                                        value={String(m.value)}
                                        className="text-xs font-semibold"
                                    >
                                        {m.short} ({m.label})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Year Selector */}
                        <Select
                            value={String(viewYear)}
                            onValueChange={(val) => setViewYear(Number(val))}
                        >
                            <SelectTrigger className="h-8 px-2 border-none bg-transparent hover:bg-[#eaf5f0] text-xs font-bold text-[#11281e] gap-1 shadow-none focus:border-transparent">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                                {years.map((y) => (
                                    <SelectItem
                                        key={y}
                                        value={String(y)}
                                        className="text-xs font-semibold"
                                    >
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#146949] hover:bg-[#eaf5f0] hover:text-[#0e4832] rounded-lg cursor-pointer"
                        onClick={handleNextMonth}
                        aria-label="Bulan berikutnya"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Weekdays Row */}
                <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-bold uppercase tracking-wider text-[#566e63] mb-2">
                    {WEEKDAYS.map((wd) => (
                        <div key={wd} className="h-6 flex items-center justify-center">
                            {wd}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                    {daysMatrix.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            disabled={item.isDisabled}
                            onClick={() => handleSelectDate(item.dateString)}
                            className={cn(
                                "h-8 w-8 text-xs font-medium rounded-xl flex items-center justify-center transition-all cursor-pointer relative",
                                item.isSelected &&
                                    "bg-[#146949] text-white font-bold shadow-xs hover:bg-[#0e4832]",
                                !item.isSelected &&
                                    item.isCurrentMonth &&
                                    "text-[#11281e] hover:bg-[#eaf5f0] hover:text-[#0e4832]",
                                !item.isSelected &&
                                    !item.isCurrentMonth &&
                                    "text-slate-300 hover:bg-slate-100 hover:text-[#566e63]",
                                item.isToday &&
                                    !item.isSelected &&
                                    "border border-[#146949] font-bold text-[#146949]",
                                item.isDisabled &&
                                    "opacity-25 pointer-events-none cursor-not-allowed"
                            )}
                        >
                            {item.day}
                        </button>
                    ))}
                </div>

                {/* Footer Quick Actions */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#dde7e2]">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-[#566e63] hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={handleClear}
                    >
                        Hapus
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs font-bold text-[#146949] hover:bg-[#eaf5f0] hover:text-[#0e4832] cursor-pointer"
                        onClick={handleToday}
                    >
                        Hari ini
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
