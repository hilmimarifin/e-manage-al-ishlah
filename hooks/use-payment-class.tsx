import { apiClient } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { CreatePaymentClass, PaymentClass } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePaymentClass({
  teacherId,
  year,
}: {
  teacherId?: string;
  year?: string;
}) {
  return useQuery({
    queryKey: ["payment-class", teacherId, year].filter(Boolean),
    queryFn: () =>
      apiClient.get<PaymentClass>("/payment/student", {
        params: { teacherId, year },
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
