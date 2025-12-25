import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/auth.api";
import { auth } from "../utility/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      const { accessToken, user } = res.data.data;
      auth.setAuth(accessToken, user);
    },
  });
};
