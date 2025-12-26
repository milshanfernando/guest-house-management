/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCreateExpense.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/expenses", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
