import { apiClient } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Classroom } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStudentClassrooms({
  teacherId,
  year,
  classId,
}: {
  teacherId?: string;
  year?: string;
  classId?: string;
}) {
  return useQuery({
    queryKey: ["classrooms", teacherId, year, classId].filter(Boolean),
    queryFn: () =>
      apiClient.get<Classroom[]>("/classrooms/student", {
        params: { teacherId, year, classId },
      }),
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post("/classrooms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      showToast.success(
        "Class created successfully",
        "New class has been added to the system"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to create class",
        error.message || "Please try again"
      );
    },
  });
}
export function useAddStudentToClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post("/classrooms/student", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      showToast.success(
        "Student added to class successfully",
        "Student has been added to the class"
      );
    },
    onError: (error: any) => {
      console.log(error)
      showToast.error(
        error.error,
        error.message || "Please try again"
      );
    },
  });
}

export function useDeleteStudentFromClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classrooms/student/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      showToast.success(
        "Student deleted successfully",
        "Student has been removed from the class"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to delete student from class",
        error.message || "Please try again"
      );
    },
  });
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) =>
      apiClient.put(`/classrooms/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      showToast.success(
        "Class updated successfully",
        "Class information has been updated"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to update class",
        error.message || "Please try again"
      );
    },
  });
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classrooms/student/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      showToast.success(
        "Class deleted successfully",
        "Class has been removed from the system"
      );
    },
    onError: (error: any) => {
      showToast.error(
        "Failed to delete class",
        error.message || "Please try again"
      );
    },
  });
}
