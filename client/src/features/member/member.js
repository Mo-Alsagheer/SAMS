import api from "@/features/api";

export async function getUserProfile() {
  const res = await api.get("/users/profile");
  return res.data;
}