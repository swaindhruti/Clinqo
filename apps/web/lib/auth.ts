import type { AuthRole, TokenResponse, User } from "@/types/api";

const AUTH_TOKEN_KEY = "clinqo_access_token";
const AUTH_USER_KEY = "clinqo_user";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function setAuthSession(token: TokenResponse, user?: User) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token.access_token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user ?? null));
}

export function getAuthToken() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getDashboardPathForRole(role: AuthRole) {
  return `/${role}`;
}

export function getRoleFromPathname(pathname: string): AuthRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/doctor")) return "doctor";
  if (pathname.startsWith("/clinic")) return "clinic";
  return null;
}