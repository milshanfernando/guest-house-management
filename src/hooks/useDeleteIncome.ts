import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incomeId: number) => {
      await api.delete(`/incomes/${incomeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
}
