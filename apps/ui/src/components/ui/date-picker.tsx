import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

interface DateTimePickerProps {
  date?: DateRange;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  minDate?: Date;
  maxDate?: Date;
  mode: any;
}

export function DatePicker({
  date,
  open,
  setDate,
  setOpen,
  minDate,
  maxDate,
  mode = "single",
}: DateTimePickerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const previousDateRef = useRef<DateRange | undefined>(date);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Reset click count when popover opens
    if (open) {
      setClickCount(0);
      previousDateRef.current = date;
    }
  }, [open]);

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);

      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);

      // Close after 2 clicks (from + to), or if we have a complete range after first click
      // and user clicked again (changing selection)
      const hasCompleteRange = selectedDate.from && selectedDate.to;

      if (hasCompleteRange && newClickCount >= 2) {
        setTimeout(() => {
          setOpen(false);
          setClickCount(0);
        }, 150);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[200px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              `${format(date.from, "dd-MM-yyyy")} - ${format(
                date.to,
                "dd-MM-yyyy"
              )}`
            ) : (
              format(date.from, "dd-MM-yyyy")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side={isMobile ? "bottom" : "bottom"}
        align={isMobile ? "center" : "end"}
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={isMobile ? 8 : 16}
        className={cn(
          "p-0 z-50",
          isMobile ? "w-[calc(100vw-16px)] max-w-sm mx-auto" : "w-auto"
        )}
        style={{
          maxHeight: isMobile
            ? "min(350px, calc(100vh - 120px))"
            : "min(400px, calc(100vh - 100px))",
          overflow: "hidden",
        }}
      >
        <Calendar
          mode={mode}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          selected={date}
          onSelect={handleDateSelect}
          className={isMobile ? "w-full" : ""}
          numberOfMonths={isMobile ? 1 : 2}
        />
      </PopoverContent>
    </Popover>
  );
}
