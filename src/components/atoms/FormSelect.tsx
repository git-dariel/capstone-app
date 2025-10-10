import { Label } from "@/components/ui/label";
import React from "react";

export interface FormSelectOption {
  value: string;
  label: string;
  key?: string; // Optional key for React rendering
}

export interface FormSelectProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  className?: string;
  id: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  className = "",
  id,
  required = false,
  disabled = false,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <select
        id={id}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        className="w-full h-8 px-3 text-xs bg-gray-50 border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.key || option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
