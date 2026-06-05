import api from "@/features/api";

export async function getMaterials(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/materials`);
  return res.data;
}
