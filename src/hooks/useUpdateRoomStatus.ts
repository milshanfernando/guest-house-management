import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

type UpdateRoomStatusPayload = {
  roomId: number;
  body: {
    name: string;
    type: string;
    roomStatus: "CLEAN" | "DIRTY" | "MAINTENANCE" | "AVAILABLE";
    size: string;
    propertyId: number;
  };
};

export const useUpdateRoomStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, body }: UpdateRoomStatusPayload) => {
      const { data } = await api.put(`/rooms/${roomId}`, body);
      return data;
    },
    onSuccess: () => {
      // Refresh reservations & rooms
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};
