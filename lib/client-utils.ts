import { useAuthStore } from "@/store/auth-store";
import moment from "moment";

export function isAdminClient(): boolean {
  const unrestricted = ["Super admin", "Admin"];
  const user = useAuthStore.getState().user;
  const isAdmin = unrestricted.includes(user?.role?.name || "");
  return isAdmin;
}

export function getCurrentAcademicYear() {
  const now = moment();
  const currentYear = now.year();
  const currentMonth = now.month(); // 0-based (0 = January, 6 = July)

  // If current month is July (6) or later, we're in the new academic year
  // that started in July of current year
  if (currentMonth >= 6) {
    return `${currentYear}/${currentYear + 1}`;
  } else {
    // If current month is before July, we're still in the academic year
    // that started in July of previous year
    return `${currentYear - 1}/${currentYear}`;
  }
}