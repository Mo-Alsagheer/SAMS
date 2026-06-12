const PREFIX = "app_cache_";

export const applicationSessionCache = {
  get(id) {
    try {
      const data = sessionStorage.getItem(PREFIX + id);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Cache get error:", e);
      return null;
    }
  },

  set(id, data) {
    try {
      sessionStorage.setItem(PREFIX + id, JSON.stringify(data));
    } catch (e) {
      console.error("Cache set error:", e);
    }
  },

  remove(id) {
    sessionStorage.removeItem(PREFIX + id);
  },

  clear() {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  },
};