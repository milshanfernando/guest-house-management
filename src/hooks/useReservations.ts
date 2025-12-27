import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Reservation } from "../types/reservation";

export const useReservations = (
  fromDate: string,
  toDate: string,
  propertyId?: number
) => {
  return useQuery<Reservation[]>({
    queryKey: ["reservations", fromDate, toDate, propertyId],
    queryFn: async () => {
      const res = await api.get("/reservations/range", {
        params: propertyId
          ? { fromDate, toDate, propertyId }
          : { fromDate, toDate },
      });
      return res.data.data;
    },
    enabled: !!fromDate && !!toDate,
    // enabled: !!propertyId && !!date,
  });
};
