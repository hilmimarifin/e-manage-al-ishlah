"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboBoxProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboBoxOption[];
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  id?: string;
}

export function ComboBox({
  label,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  value,
  onValueChange,
  options,
  error,
  disabled = false,
  className,
  required = false,
  id,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (optionValue: string) => {
    const newValue = optionValue === value ? "" : optionValue;
    onValueChange?.(newValue);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={
            required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""
          }
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between",
              !selectedOption && "text-muted-foreground",
              error && "border-red-500",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                      option.disabled && "pointer-events-none opacity-50",
                      value === option.value &&
                        "bg-accent text-accent-foreground"
                    )}
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
