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
  rootClassName?: string;
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
  rootClassName,
  required = false,
  id,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Memoize selected option to prevent unnecessary re-calculations
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  // Debounced search term to improve performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredOptions = React.useMemo(() => {
    if (!debouncedSearchTerm) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [options, debouncedSearchTerm]);

  const handleSelect = React.useCallback((optionValue: string) => {
    const newValue = optionValue === value ? "" : optionValue;
    onValueChange?.(newValue);
    setOpen(false);
    setSearchTerm("");
  }, [value, onValueChange]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

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
      <Popover  open={open} onOpenChange={setOpen}>
        <PopoverTrigger className={cn("h-8 text-xs", rootClassName)} asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between",
              !selectedOption && "text-muted-foreground",
              error && "border-red-500",
              disabled && "cursor-not-allowed opacity-50",
              rootClassName
            )}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={true}
          collisionPadding={8}
          onOpenAutoFocus={(e) => {
            // Prevent auto focus to avoid aria-hidden warning
            e.preventDefault();
          }}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-1 border-0 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
              autoFocus
            />
          </div>
          <ScrollArea className="max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                        option.disabled && "pointer-events-none opacity-50",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() =>
                        !option.disabled && handleSelect(option.value)
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
