import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Reservation } from "../types/reservation";

export const useInHouseReservations = (propertyId?: number, date?: string) => {
  return useQuery<Reservation[]>({
    queryKey: ["inhousereservations", propertyId, date],
    queryFn: async () => {
      const res = await api.get("/reservations/today/in-house", {
        params: { propertyId, date },
      });
      return res.data.data;
    },
    enabled: !!propertyId && !!date,
  });
};
