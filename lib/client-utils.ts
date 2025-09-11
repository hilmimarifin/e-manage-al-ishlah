import { useAuthStore } from "@/store/auth-store";

export function isAdminClient(): boolean {
  const unrestricted = ["Super admin", "Admin"];
  const user = useAuthStore.getState().user;
  const isAdmin = unrestricted.includes(user?.role?.name || "");
  return isAdmin;
}
