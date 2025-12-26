import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Reservation } from "../types/reservation";

export const useReservations = () => {
  return useQuery<Reservation[]>({
    queryKey: ["reservations"],
    queryFn: async () => {
      const res = await api.get("/reservations");
      return res.data.data;
    },
    // enabled: !!propertyId && !!date,
  });
};
