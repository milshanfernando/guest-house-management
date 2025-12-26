import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useReservationsCheckOut = (propertyId: number, date: string) => {
  return useQuery({
    queryKey: ["reservations", "today", "check-out", propertyId],
    queryFn: async () => {
      const { data } = await api.get(
        `/reservations/today/check-out?propertyId=${propertyId}&date=${date}`
      );
      return data.data;
    },
    enabled: !!propertyId,
  });
};
