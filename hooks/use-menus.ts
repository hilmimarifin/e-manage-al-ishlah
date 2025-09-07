import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Menu } from "@/types";
import { showToast } from "@/lib/toast";

export function useMenus() {
  return useQuery({
    queryKey: ["menus"],
    queryFn: () => apiClient.get<Menu[]>("/menus"),
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post("/menus", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      showToast.success(
        "Menu created successfully",
        "New menu has been added to the system"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to create menu",
        error.message || "Please try again"
      );
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.put(`/menus/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      showToast.success(
        "Menu updated successfully",
        "Menu information has been updated"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to update menu",
        error.message || "Please try again"
      );
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/menus/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      showToast.success(
        "Menu deleted successfully",
        "Menu has been removed from the system"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to delete menu",
        error.message || "Please try again"
      );
    },
  });
}

export function useRoleMenus(roleId?: string) {
  return useQuery({
    queryKey: ["role-menus", roleId],
    queryFn: () =>
      apiClient.get(`/role-menus${roleId ? `?roleId=${roleId}` : ""}`),
    enabled: !!roleId,
  });
}

export function useAssignMenuToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post("/role-menus", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-menus"] });
      showToast.success(
        "Menu permissions updated",
        "Role menu permissions have been updated successfully"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to update permissions",
        error.message || "Please try again"
      );
    },
  });
}
