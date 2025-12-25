// src/hooks/useGuests.ts
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Guest } from "../types/guest";

// interface UseGuestsParams {
//   search?: string;
// }

export const useGuests = (search: string) => {
  return useQuery<Guest[]>({
    queryKey: ["guests", search],
    queryFn: async () => {
      const res = await api.get("/guests/search", {
        params: { name: search },
      });
      return res.data.data;
    },
    enabled: !!search && search.trim().length > 0,
  });
};
