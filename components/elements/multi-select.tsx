"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";

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

  const selectedOptions = React.useMemo(
    () => options.filter((o) => values.includes(o.value)),
    [values, options]
  );

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
        <PopoverTrigger asChild className="min-h-[30px]">
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "min-h-[30px] text-xs justify-between shadow-md",
              error && "border-red-500",
              disabled && "cursor-not-allowed opacity-50",
              rootClassName
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-1 max-w-[16rem]">
                  {selectedOptions.slice(0, 3).map((opt) => (
                    <span key={opt.value} className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[10px]">
                      {opt.label}
                    </span>
                  ))}
                  {selectedOptions.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{selectedOptions.length - 3} lainnya</span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedOptions.length > 0 && (
                <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" onClick={clearAll} />
              )}
              {isLoading ? (
                <Loader2 className="h-4 w-4 opacity-50 animate-spin" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </div>
          </Button>
        </PopoverTrigger>
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
                    <button
                      type="button"
                      key={option.value}
                      disabled={option.disabled}
                      className={cn(
                        "w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                        option.disabled && "pointer-events-none opacity-50"
                      )}
                      onClick={() => !option.disabled && toggleValue(option.value)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={checked} onCheckedChange={() => toggleValue(option.value)} />
                        <span>{option.label}</span>
                      </div>
                    </button>
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
