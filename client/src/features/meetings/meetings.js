import api from "@/features/api";

export async function createMeeting(sessionId) {
  const res = await api.post(`/director/sessions/${sessionId}/meeting/create`);
  return res.data;
}

export async function joinMeeting(sessionId) {
  // Some backends expose this as GET; try GET to match server expectations.
  const res = await api.get(`/sessions/${sessionId}/meeting/join`);
  return res.data;
}
