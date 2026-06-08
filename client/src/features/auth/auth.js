import api from "@/features/api";

export async function login(data) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post("/auth/forget-password", { email });
  return response.data;
}

export async function resetPassword({ email, password }) {
  const response = await api.post("/auth/reset-password", { email, password });
  return response.data;
}

// export async function logout() {
//   // Optional server-side logout endpoint; if none, clear client session instead
//   try {
//     const response = await api.post("/auth/logout");
//     return response.data;
//   } catch (err) {
//     // propagate error
//     throw err;
//   }
// }
