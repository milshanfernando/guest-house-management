import api from "./axios";

export const getRoomsByProperty = async (propertyId: number) => {
  const { data } = await api.get(`/rooms`, {
    params: { propertyId },
  });
  return data;
};
