import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateTimePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  minDate?: string;
  error?: string;
  placeholder?: string;
  showTime?: boolean;
  restrictTimeRange?: boolean;
  minTime?: string;
  maxTime?: string;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const AMPM = ["AM", "PM"];
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  minDate,
  error,
  placeholder = "Select date and time",
  showTime = true,
  restrictTimeRange = false,
  minTime = "08:00",
  maxTime = "20:00",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedAmPm, setSelectedAmPm] = useState("AM");
  const [timeValidationError, setTimeValidationError] = useState<string>("");

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        const hours24 = date.getHours();
        const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
        const ampm = hours24 >= 12 ? "PM" : "AM";
        setSelectedHour(hours12);
        setSelectedMinute(date.getMinutes().toString().padStart(2, "0"));
        setSelectedAmPm(ampm);
      }
    }
  }, [value]);

  const validateTime = (hour: number, minute: string, ampm: string): boolean => {
    if (!restrictTimeRange) return true;

    let hours24 = hour;
    if (ampm === "PM" && hour !== 12) {
      hours24 = hour + 12;
    } else if (ampm === "AM" && hour === 12) {
      hours24 = 0;
    }

    const [minHour, minMin] = minTime.split(":").map(Number);
    const [maxHour, maxMin] = maxTime.split(":").map(Number);
    const minTimeMinutes = minHour * 60 + minMin;
    const maxTimeMinutes = maxHour * 60 + maxMin;
    const currentTimeMinutes = hours24 * 60 + parseInt(minute);

    if (currentTimeMinutes < minTimeMinutes || currentTimeMinutes > maxTimeMinutes) {
      const formatTimeTo12Hour = (time24: string) => {
        const [h, m] = time24.split(":").map(Number);
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ap = h >= 12 ? "PM" : "AM";
        return `${h12}:${m.toString().padStart(2, "0")} ${ap}`;
      };
      setTimeValidationError(
        `Time must be between ${formatTimeTo12Hour(minTime)} and ${formatTimeTo12Hour(maxTime)}`
      );
      return false;
    }

    setTimeValidationError("");
    return true;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleTimeChange = () => {
    if (!selectedDate) return;
    if (!validateTime(selectedHour, selectedMinute, selectedAmPm)) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    let hours24 = selectedHour;
    if (selectedAmPm === "PM" && selectedHour !== 12) {
      hours24 = selectedHour + 12;
    } else if (selectedAmPm === "AM" && selectedHour === 12) {
      hours24 = 0;
    }

    const newDate = new Date(year, month, day, hours24, parseInt(selectedMinute), 0, 0);
    onChange(newDate.toISOString().slice(0, 16));
    setIsOpen(false);
  };

  const minDateObj = minDate ? new Date(minDate) : undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !selectedDate && "text-gray-400",
              error && "border-red-300"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {showTime && <Clock className="mr-2 h-4 w-4" />}
            {selectedDate ? (
              showTime ? (
                format(selectedDate, "PPP p")
              ) : (
                format(selectedDate, "PPP")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => (minDateObj ? date < minDateObj : false)}
              initialFocus
            />
          </div>

          {showTime && selectedDate && (
            <div className="border-t p-3 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                Select Time
              </div>

              <div className="flex items-center justify-center gap-2">
                <select
                  value={selectedHour}
                  onChange={(e) => {
                    const h = parseInt(e.target.value);
                    setSelectedHour(h);
                    validateTime(h, selectedMinute, selectedAmPm);
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {HOURS_12.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={selectedMinute}
                  onChange={(e) => {
                    setSelectedMinute(e.target.value);
                    validateTime(selectedHour, e.target.value, selectedAmPm);
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {MINUTES.filter((_, i) => i % 15 === 0).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedAmPm}
                  onChange={(e) => {
                    setSelectedAmPm(e.target.value);
                    validateTime(selectedHour, selectedMinute, e.target.value);
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {AMPM.map((ap) => (
                    <option key={ap} value={ap}>
                      {ap}
                    </option>
                  ))}
                </select>
              </div>

              {timeValidationError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {timeValidationError}
                </div>
              )}

              <Button
                type="button"
                onClick={handleTimeChange}
                disabled={!!timeValidationError}
                className="w-full bg-primary-700 hover:bg-primary-800 text-white"
                size="sm"
              >
                Set Time
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
