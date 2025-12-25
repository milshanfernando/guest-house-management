import { useMutation } from "@tanstack/react-query";
import api from "../api/axios";

interface PaymentPayload {
  reservationId: number;
  date: string;
  amount: number;
  platform: string;
  note?: string;
  propertyId: number;
}

export const useReservationPayment = () => {
  return useMutation({
    mutationFn: async (payload: PaymentPayload) => {
      const { data } = await api.post("/incomes/updateReservation", payload);
      return data;
    },
  });
};
