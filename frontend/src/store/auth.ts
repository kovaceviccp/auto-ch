import { create } from "zustand";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  company_name?: string;
  canton?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null,
  // start as loading if we have a token so protected pages wait before redirecting
  isLoading: typeof window !== "undefined" ? !!sessionStorage.getItem("access_token") : false,

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    sessionStorage.setItem("access_token", data.access_token);
    set({ user: data.user, token: data.access_token });
  },

  register: async (registerData) => {
    const { data } = await api.post("/auth/register", registerData);
    sessionStorage.setItem("access_token", data.access_token);
    set({ user: data.user, token: data.access_token });
  },

  logout: () => {
    sessionStorage.removeItem("access_token");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) { set({ isLoading: false }); return; }
    try {
      const { data } = await api.get("/users/me");
      set({ user: data, isLoading: false });
    } catch {
      sessionStorage.removeItem("access_token");
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
