// src/hooks/useProperties.ts
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Property } from "../types/types";

export const useProperties = () => {
  return useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      const res = await api.get("/properties");
      return res.data.data;
    },
  });
};
