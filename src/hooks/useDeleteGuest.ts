import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useDeleteGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestId: number) => {
      await api.delete(`/guests/${guestId}`);
    },
    onSuccess: () => {
      toast.success("Guest deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: () => {
      toast.error("Failed to delete guest");
    },
  });
};
