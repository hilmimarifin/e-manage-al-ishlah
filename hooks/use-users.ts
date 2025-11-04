import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { User } from "@/types";
import { showToast } from "@/lib/toast";

export function useUsers({
  classId,
  year,
}: {
  classId?: string;
  year?: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", classId, year],
    queryFn: () =>
      apiClient.get<User[]>("/users", { params: { classId, year } }),
  });
  const options = data?.map((user) => ({
    value: user.id,
    label: user.name,
  })) || [];
  return { data, isLoading, error, options };
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast.success(
        "User created successfully",
        "New user has been added to the system"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to create user",
        error.message || "Please try again"
      );
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast.success(
        "User updated successfully",
        "User information has been updated"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to update user",
        error.message || "Please try again"
      );
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast.success(
        "User deleted successfully",
        "User has been removed from the system"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to delete user",
        error.message || "Please try again"
      );
    },
  });
}
