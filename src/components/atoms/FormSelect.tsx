import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id: string;
  options: Option[];
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  className = "",
  id,
  options,
  placeholder = "Select an option",
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          {value ? options.find((opt) => opt.value === value)?.label : placeholder}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
