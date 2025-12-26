import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export interface Expense {
  id: string;
  amount: number;
  type: string;
  note: string;
  date: string;
}

interface UseExpensesParams {
  type?: string;
}

export function useExpenses(params?: UseExpensesParams) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: async (): Promise<Expense[]> => {
      const response = await api.get("/expenses", { params });
      return response.data.data;
    },
  });
}
