import { apiClient } from "@/lib/api";
import { PaymentClass } from "@/types";
import { useQuery } from "@tanstack/react-query";

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
      apiClient.get<PaymentClass[]>("/payment/student", {
        params: { teacherId, year },
      }),
  });
}
