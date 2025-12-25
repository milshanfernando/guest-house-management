import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Room } from "../types/types";

export const useRooms = (propertyId?: number) => {
  return useQuery<Room[]>({
    queryKey: ["rooms", propertyId],
    queryFn: async () => {
      const res = await api.get("/rooms", { params: { propertyId } });
      return res.data.data;
    },
    enabled: !!propertyId,
  });
};
