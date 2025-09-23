import { apiClient } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { CreatePaymentClass, PaymentClass, UpdatePaymentClass } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePaymentClass({
  teacherId,
  year,
  classId,
}: {
  teacherId?: string;
  year?: string;
  classId?: string;
}) {
  return useQuery({
    queryKey: ["payment-class", teacherId, year, classId].filter(Boolean),
    queryFn: () =>
      apiClient.get<PaymentClass[]>("/payment/student", {
        params: { teacherId, year, classId },
      }),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentClass) =>
      apiClient.post<PaymentClass>("/payment/student", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-class"] });
      showToast.success(
        "Payment created successfully",
        "Payment information has been updated"
      );
    },
    onError: () => {
      showToast.error(
        "Gagal menambahkan pembayaran",
        "Silahkan coba lagi"
      );
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePaymentClass) =>
      apiClient.put<PaymentClass>("/payment/student", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-class"] });
      showToast.success(
        "Pembayaran berhasil diupdate",
        "Informasi pembayaran telah diperbarui"
      );
    },
    onError: () => {
      showToast.error(
        "Gagal mengupdate pembayaran",
        "Silahkan coba lagi"
      );
    },
  });
}
