import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

type UpdateStatusPayload = {
  id: number;
  status: "CHECKED_IN" | "CHECKED_OUT";
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusPayload) => {
      const { data } = await api.put(`/reservations/${id}`, {
        reservationStatus: status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
};
