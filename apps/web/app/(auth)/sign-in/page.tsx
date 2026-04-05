"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { apiClient, APIError } from "@/lib/api-client";
import {
  clearAuthSession,
  getAuthToken,
  getDashboardPathForRole,
  setAuthSession,
  setStoredUser,
} from "@/lib/auth";
import type { TokenResponse, User } from "@/types/api";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const user = await apiClient.get<User>("/auth/me");
        setStoredUser(user);
        router.replace(getDashboardPathForRole(user.role));
      } catch {
        clearAuthSession();
        setIsCheckingSession(false);
      }
    };

    bootstrap();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await apiClient.post<TokenResponse>("/auth/login", {
        email,
        password,
      });

      const user = await apiClient.get<User>("/auth/me");
      setAuthSession(token, user);
      setStoredUser(user);
      router.replace(getDashboardPathForRole(user.role));
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message || "Unable to sign in.");
      } else {
        setError("Unable to sign in.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-[380px] items-center justify-center text-sm text-neutral-500">
        Verifying session...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Sign in
        </h1>
        <p className="text-neutral-500 mt-2 text-sm">
          Use your account credentials to open the correct dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
            placeholder="name@clinic.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
            </>
          )}
        </button>
      </form>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        After sign-in you will be redirected to the dashboard that matches your role.
      </div>
    </div>
  );
}
