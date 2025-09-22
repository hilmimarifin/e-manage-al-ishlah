"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "sm:max-w-[400px]",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-[600px]",
  xl: "sm:max-w-[800px]",
};

export function Modal({
  isOpen,
  onOpenChange,
  title,
  description,
  trigger,
  children,
  footer,
  size = "sm",
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          sizeClasses[size],
          "max-h-[calc(100vh-10rem)] flex flex-col overflow-hidden"
        )}
      >
        <DialogHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 max-h-20 flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-primary-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
        {footer && (
          <DialogFooter className="flex-shrink-0">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
