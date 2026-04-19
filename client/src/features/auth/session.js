const AUTH_KEYS = {
  token: "authToken",
  user: "authUser",
};

// Standardizing to localStorage for persistence
const storage = typeof window !== "undefined" ? window.localStorage : null;

export function getAuthToken() {
  return storage?.getItem(AUTH_KEYS.token) || null;
}

export function getAuthUser() {
  const user = storage?.getItem(AUTH_KEYS.user);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function setAuthSession({ token, user }) {
  if (!storage) return;
  storage.setItem(AUTH_KEYS.token, token);
  storage.setItem(AUTH_KEYS.user, JSON.stringify(user));
}

export function clearAuthSession() {
  if (!storage) return;
  storage.removeItem(AUTH_KEYS.token);
  storage.removeItem(AUTH_KEYS.user);
}

export function isAuthenticated() {
  return !!(getAuthToken() && getAuthUser());
}

export function normalizeRole(role) {
  return String(role || "").toUpperCase();
}

export function getHomeRouteForRole(role) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "DIRECTOR": return "/director";
    case "EXECUTIVE": return "/executive";
    case "MEMBER": return "/member";
    default: return "/";
  }
}