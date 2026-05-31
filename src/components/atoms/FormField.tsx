import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  id: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  className = "",
  id,
  required = false,
  disabled = false,
  error,
  pattern,
  minLength,
  maxLength,
  min,
  max,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`h-8 text-xs bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
          required={required}
          disabled={disabled}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          min={min}
          max={max}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePassword}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
