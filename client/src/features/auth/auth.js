import api from "@/features/api";

export async function login(data) {
  const response = await api.post("/auth/login", data);
  return response.data;
}