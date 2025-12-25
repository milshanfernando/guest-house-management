import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncome, type Income } from "../api/incomes";

export const useCreateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Income) => createIncome(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
};
