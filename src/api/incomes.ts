import api from "./axios";

export interface Income {
  propertyId: number;
  platform: string;
  amount: number;
  date: string;
  note?: string;
}

export interface GetIncomesParams {
  propertyId?: number;
  fromDate?: string;
  toDate?: string;
}

export const getIncomes = async (params: GetIncomesParams) => {
  const { data } = await api.get("/incomes", { params });
  return data.data.data;
};

export const createIncome = async (payload: {
  propertyId: number;
  platform: string;
  amount: number;
  date: string;
  notes?: string;
}) => {
  const { data } = await api.post("/incomes", payload);
  return data;
};
