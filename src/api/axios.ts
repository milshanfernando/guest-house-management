import axios from "axios";
import { auth } from "../utility/auth";

const api = axios.create({
  baseURL:
    "https://hotel-reservation-v3-test-832288845121.asia-southeast1.run.app",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      auth.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
