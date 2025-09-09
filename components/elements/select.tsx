import React from "react";
import { Label } from "../ui/label";
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectComponentProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const Select: React.FC<SelectComponentProps> = ({
  value,
  onValueChange,
  options,
  error,
  label,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = "",
  id,
  name,
}) => {
  const selectId = id || name || "select";

  return (
    <div className={`grid gap-2 ${className}`}>
      {label && (
        <Label htmlFor={selectId}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <SelectComponent
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <SelectTrigger id={selectId} className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn("hover:bg-accent hover:text-accent-foreground")}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectComponent>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default Select;
