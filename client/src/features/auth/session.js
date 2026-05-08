import { jwtDecode } from "jwt-decode";

const AUTH_KEYS = {
  token: "authToken",
};

function getStorage() {
  if (typeof window === "undefined") return null;

  return window.localStorage;
}

export function getAuthToken() {
  return getStorage()?.getItem(AUTH_KEYS.token) || null;
}

export function setAuthSession(token) {
  const storage = getStorage();

  if (!storage) return;

  storage.setItem(AUTH_KEYS.token, token);
}

export function clearAuthSession() {
  const storage = getStorage();

  if (!storage) return;

  storage.removeItem(AUTH_KEYS.token);
}

export function getCurrentUser() {
  const token = getAuthToken();

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isAuthenticated() {
  const token = getAuthToken();

  if (!token) return false;

  return !isTokenExpired(token);
}

export function normalizeRole(role) {
  return String(role || "").toUpperCase();
}

export function getHomeRouteForRole(role) {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "DIRECTOR":
      return "/director";

    case "EXECUTIVE":
      return "/executive";

    case "MEMBER":
      return "/member";

    default:
      return "/";
  }
}
