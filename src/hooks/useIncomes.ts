import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Income } from "../types/income";

interface Params {
  propertyId?: number;
  fromDate?: string;
  toDate?: string;
}

export const useIncomes = (params: Params) => {
  return useQuery<Income[]>({
    queryKey: ["incomes", params],
    queryFn: async () => {
      const res = await api.get("/incomes", { params });

      /**
       * 🔴 BACKEND FIX
       * Converts:
       * { "0": {...}, "1": {...} }
       * → [{...}, {...}]
       */
      return Object.values(res.data.data);
    },
  });
};
