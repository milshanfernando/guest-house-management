import api from "./axios";

export interface LoginPayload {
  username: string;
  password: string;
}

export const loginApi = (data: LoginPayload) => api.post("/auth/login", data);
