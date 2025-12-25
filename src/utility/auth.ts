/* eslint-disable @typescript-eslint/no-explicit-any */
const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  setAuth: (token: string, user: any) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};
