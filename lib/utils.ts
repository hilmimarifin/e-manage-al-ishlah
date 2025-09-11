import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { prisma } from "./prisma";

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

export async function isAdmin(id: string): Promise<boolean> {
  const unrestricted = ["Super admin", "Admin"];
  const user = await prisma.user.findUnique({
          where: {
            id: id || undefined
          },
          include: {
            role: true,
          },
        });
        const isAdmin = unrestricted.includes(user?.role?.name || "");
        return isAdmin;
}