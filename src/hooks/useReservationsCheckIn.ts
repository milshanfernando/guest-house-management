import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useReservationsCheckIn = (propertyId?: number, date?: string) => {
  return useQuery({
    queryKey: ["reservations", "today", "check-in", propertyId],
    queryFn: async () => {
      const { data } = await api.get(`/reservations/today/check-in`, {
        params: { propertyId, date },
      });
      return data.data;
    },
    enabled: !!propertyId && !!date,
  });
};
