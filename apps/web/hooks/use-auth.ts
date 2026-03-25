"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";

export type User = {
  id: string;
  email: string;
  role: "admin" | "clinic" | "doctor" | "patient";
  is_active: boolean;
};

export type Clinic = {
  id: string;
  name: string;
  address?: string;
  user_id: string;
};

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("clinqo_auth_token");
    }
    return null;
  });

  useEffect(() => {
    // Synchronize token if changed in other tabs
    const handleStorage = () => {
      setToken(localStorage.getItem("clinqo_auth_token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["auth-me", token],
    queryFn: () => apiClient.get<User>("/auth/me"),
    enabled: !!token,
    retry: false,
  });

  const { data: clinic, isLoading: isClinicLoading } = useQuery({
    queryKey: ["auth-clinic", user?.id],
    queryFn: () => apiClient.get<Clinic>(`/clinics/user/${user?.id}`),
    enabled: !!user && user.role === "clinic",
  });

  const logout = () => {
    apiClient.logout();
  };

  return {
    user,
    clinic,
    isAuthenticated: !!token && !!user,
    isLoading: isUserLoading || isClinicLoading,
    error: userError,
    logout,
  };
}
