import React, { useState, useEffect } from "react";
import { Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");

  // Parse the initial value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth()));
        setSelectedHour(date.getHours().toString().padStart(2, "0"));
        setSelectedMinute(date.getMinutes().toString().padStart(2, "0"));
      }
    }
  }, [value]);

  const formatDisplayValue = (date: Date) => {
    if (showTime) {
      return date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth()));

    if (showTime) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute));
      onChange(newDate.toISOString().slice(0, 16));
    } else {
      onChange(date.toISOString().slice(0, 10));
      setIsOpen(false);
    }
  };

  const handleTimeChange = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute));
      onChange(newDate.toISOString().slice(0, 16));
      setIsOpen(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    const minDateTime = new Date(minDate);
    return date < minDateTime;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-colors
            ${
              disabled
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-400"
            }
            ${isOpen ? "ring-2 ring-primary-500 border-primary-500" : ""}
          `}
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {showTime && <Clock className="w-4 h-4 text-gray-400" />}
            <span className={selectedDate ? "text-gray-900" : "text-gray-400"}>
              {selectedDate ? formatDisplayValue(selectedDate) : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-medium text-gray-900">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                  disabled={!date || isDateDisabled(date)}
                  className={`
                    h-8 w-8 text-xs rounded-md transition-colors
                    ${!date ? "invisible" : ""}
                    ${
                      date && isDateDisabled(date)
                        ? "text-gray-300 cursor-not-allowed"
                        : date && isSelected(date)
                        ? "bg-primary-600 text-white"
                        : date && isToday(date)
                        ? "bg-primary-100 text-primary-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }
                  `}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>

            {/* Time picker */}
            {showTime && selectedDate && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Select Time</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {HOURS.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">:</span>
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {MINUTES.filter((_, i) => i % 15 === 0).map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={handleTimeChange}
                    className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Set Time
                  </button>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="border-t pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  if (showTime) {
                    today.setHours(9, 0, 0, 0);
                  }
                  handleDateSelect(today);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
