import React, { useRef, useEffect, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  className,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus on the first empty input
    const firstEmptyIndex = value.split("").findIndex((digit) => !digit);
    const indexToFocus = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    inputRefs.current[indexToFocus]?.focus();
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (digit.length > 1) return;
    if (digit && !/^\d$/.test(digit)) return;

    const newValue = value.split("");
    newValue[index] = digit;
    onChange(newValue.join(""));

    // Move to next input if digit is entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      // Move to previous input if current is empty and backspace is pressed
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const digits = pastedData.replace(/\D/g, "").slice(0, length);
    onChange(digits.padEnd(length, ""));
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg",
            "bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400 focus:outline-none",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-300 focus:border-red-400 focus:ring-red-400 bg-red-50",
            "hover:border-gray-300"
          )}
        />
      ))}
    </div>
  );
};
