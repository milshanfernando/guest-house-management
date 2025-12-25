import api from "./axios";

export const getReservationsByPropertyAndDate = async (
  propertyId: number,
  date: string
) => {
  const { data } = await api.get(`/reservations`, {
    params: { propertyId, date },
  });
  return data;
};
