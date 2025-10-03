"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  options: MultiSelectOption[];
  error?: string;
  disabled?: boolean;
  className?: string;
  rootClassName?: string;
  required?: boolean;
  id?: string;
  isLoading?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder = "Pilih siswa...",
  searchPlaceholder = "Cari...",
  emptyMessage = "Data tidak ditemukan.",
  values,
  onValuesChange,
  options,
  error,
  disabled = false,
  className,
  rootClassName,
  required = false,
  isLoading = false,
  id,
}) => {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedOptions = React.useMemo(
    () => options.filter((o) => values.includes(o.value)),
    [values, options]
  );

  // Auto-adjust height based on content
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const content = container.querySelector('.selected-options-container');
      if (content) {
        const height = Math.min(content.scrollHeight, 100); // Max height of 100px
        container.style.height = `${height}px`;
      }
    }
  }, [selectedOptions]);


  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    const s = searchTerm.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s)
    );
  }, [options, searchTerm]);

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onValuesChange(values.filter((v) => v !== val));
    } else {
      onValuesChange([...values, val]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange([]);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative" ref={containerRef}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "min-h-[30px] text-xs justify-between bg-background shadow-md w-full pr-10 overflow-hidden",
                error && "border-red-500",
                disabled && "cursor-not-allowed opacity-50",
                rootClassName
              )}
              disabled={disabled}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0 text-left selected-options-container">
                {selectedOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-1 overflow-y-auto max-h-[84px] w-full">
                    {selectedOptions.map((opt) => (
                      <div 
                        key={opt.value} 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground text-[10px] group"
                      >
                        <span>{opt.label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleValue(opt.value);
                          }}
                          className="opacity-100 ml-1"
                          aria-label={`Remove ${opt.label}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground truncate py-2">{placeholder}</span>
                )}
              </div>
              <span className="absolute right-8">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 opacity-50 animate-spin" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                )}
              </span>
            </Button>
          </PopoverTrigger>
          {selectedOptions.length > 0 && (
            <div
              onClick={clearAll}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full "
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5 " />
            </div>
          )}
        </div>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
              autoFocus
            />
          </div>
          <ScrollArea className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1 space-y-1">
                {filteredOptions.map((option) => {
                  const checked = values.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      role="button"
                      aria-disabled={option.disabled}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (!option.disabled) toggleValue(option.value);
                        }
                      }}
                      className={cn(
                        "w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        option.disabled && "cursor-not-allowed opacity-50"
                      )}
                      onClick={() => !option.disabled && toggleValue(option.value)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={checked} 
                          onCheckedChange={() => toggleValue(option.value)}
                          className="pointer-events-none"
                        />
                        <span>{option.label}</span>
                      </div>
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
};

export default MultiSelect;
