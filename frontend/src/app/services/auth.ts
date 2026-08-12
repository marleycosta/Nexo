import { apiFetch, clearTokens, setTokens } from "./api";
import type { AuthTokens, User } from "../types";

export async function login(username: string, password: string) {
  const tokens = await apiFetch<AuthTokens>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false
  );
  setTokens(tokens.access, tokens.refresh);
  return tokens;
}

export async function register(username: string, email: string, password: string) {
  const user = await apiFetch<User>(
    "/auth/register/",
    {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    },
    false
  );
  return user;
}

export function getMe() {
  return apiFetch<User>("/auth/me/");
}

export function updateProfile(payload: { username: string; email: string }) {
  return apiFetch<User>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload: {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}) {
  return apiFetch<{ detail: string; access: string; refresh: string }>(
    "/auth/change-password/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function deleteAccount(password: string) {
  return apiFetch<null>("/auth/delete-account/", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  clearTokens();
}
