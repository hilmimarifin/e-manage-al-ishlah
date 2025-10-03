"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const user = useAuthStore.getState().user;
  const assignedRole = isAuthenticated && user?.role?.name !== "User";
  const logout = useLogout();
  const handleLogout = () => {
    logout.mutate();
  };
  useEffect(() => {
    if (isAuthenticated) {
      if (
        user?.role?.name === "Super admin" ||
        user?.role?.name === "Kepala Sekolah"
      ) {
        return router.replace("/dashboard");
      }
      if (user?.role?.name !== "User") {
        return router.replace("/transaction");
      }
    } else {
      return router.replace("/login");
    }
  }, [isAuthenticated, router, user, assignedRole]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {assignedRole ? (
          <>
            <h1 className="text-2xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Menuju ke halaman...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">
              HARAP HUBUNGI ADMIN / KEPALA SEKOLAH
            </h1>
            <p className="text-muted-foreground cursor-pointer hover:text-primary-foreground" onClick={handleLogout}>
              Log out
            </p>
          </>
        )}
      </div>
    </div>
  );
}
