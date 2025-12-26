import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export interface Guest {
  id: number;
  name: string;
  nic: string;
  passport: string;
  country: string;
  contactNo: string;
  email: string;
}

export const useGuestList = () => {
  return useQuery({
    queryKey: ["guests", "list"],
    queryFn: async () => {
      const res = await api.get("/guests");
      return res.data.data as Guest[];
    },
  });
};
