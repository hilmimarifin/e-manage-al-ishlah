import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToAcademicMonthNumber(month: number): number {
  if (month > 6) {
    return month - 6;
  } else {
    return month + 6;
  }
}
  