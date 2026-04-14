const AUTH_KEYS = {
  token: "authToken",
  user: "authUser",
};

const LEGACY_KEYS = {
  token: "token",
  user: "user",
};

function readStorageValue(keys) {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.sessionStorage.getItem(keys.token) ||
    window.localStorage.getItem(keys.token) ||
    window.sessionStorage.getItem(keys.user) ||
    window.localStorage.getItem(keys.user)
  );
}

function parseUserValue(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.sessionStorage.getItem(AUTH_KEYS.token) ||
    window.localStorage.getItem(AUTH_KEYS.token) ||
    window.localStorage.getItem(LEGACY_KEYS.token)
  );
}

export function getAuthUser() {
  return parseUserValue(
    readStorageValue({
      token: AUTH_KEYS.user,
      user: LEGACY_KEYS.user,
    }),
  );
}

export function setAuthSession({ token, user }) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(AUTH_KEYS.token, token);
  window.sessionStorage.setItem(AUTH_KEYS.user, JSON.stringify(user));
  window.localStorage.removeItem(LEGACY_KEYS.token);
  window.localStorage.removeItem(LEGACY_KEYS.user);
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  [window.sessionStorage, window.localStorage].forEach((storage) => {
    storage.removeItem(AUTH_KEYS.token);
    storage.removeItem(AUTH_KEYS.user);
    storage.removeItem(LEGACY_KEYS.token);
    storage.removeItem(LEGACY_KEYS.user);
  });
}

export function isAuthenticated() {
  return Boolean(getAuthToken() && getAuthUser());
}

export function normalizeRole(role) {
  return String(role || "").toUpperCase();
}

export function getHomeRouteForRole(role) {
  switch (normalizeRole(role)) {
    case "DIRECTOR":
      return "/director";
    case "EXECUTIVE":
      return "/executive";
    case "USER":
      return "/home";
    default:
      return "/login";
  }
}