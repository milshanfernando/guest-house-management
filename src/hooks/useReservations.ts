import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Reservation } from "../types/reservation";

export const useReservations = (propertyId?: number, date?: string) => {
  return useQuery<Reservation[]>({
    queryKey: ["reservations", propertyId, date],
    queryFn: async () => {
      const res = await api.get("/reservations/today/check-in", {
        params: { propertyId, date },
      });
      return res.data.data;
    },
    enabled: !!propertyId && !!date,
  });
};
