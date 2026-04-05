"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient, APIError } from "@/lib/api-client";
import {
  clearAuthSession,
  getAuthToken,
  getDashboardPathForRole,
  getRoleFromPathname,
  setStoredUser,
} from "@/lib/auth";
import type { User } from "@/types/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    let cancelled = false;

    const validate = async () => {
      try {
        const user = await apiClient.get<User>("/auth/me");
        if (cancelled) return;

        setStoredUser(user);

        const expectedRole = getRoleFromPathname(pathname);
        if (expectedRole && user.role !== expectedRole) {
          router.replace(getDashboardPathForRole(user.role));
          return;
        }

        setReady(true);
      } catch (error) {
        if (cancelled) return;

        clearAuthSession();
        router.replace("/sign-in");

        if (error instanceof APIError) {
          return;
        }
      }
    };

    validate();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-500">
        Verifying your session...
      </div>
    );
  }

  return children;
}