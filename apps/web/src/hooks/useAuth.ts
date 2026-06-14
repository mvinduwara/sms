import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types";
import { toast } from "sonner";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { data } = await api.post<AuthResponse>("/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate("/");
    },
    onError: () => {
      toast.error("Invalid credentials. Please try again.");
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully.");
  };
}