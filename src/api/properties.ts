import api from "./axios";

export interface Property {
  id: number;
  name: string;
  address?: string;
}

export const getProperties = async (): Promise<Property[]> => {
  const { data } = await api.get("/properties");
  return data;
};
