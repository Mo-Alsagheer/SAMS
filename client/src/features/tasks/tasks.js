import api from "@/features/api";

export async function getTasks(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/tasks`);
  return res.data;
}
