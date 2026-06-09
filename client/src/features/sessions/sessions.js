import api from "@/features/api";

export async function getMemberDashboardData() {
  const res = await api.get("/sessions/member-experience");
  return res.data;
}

export async function getSessions() {
  const res = await api.get("/sessions/my-meetings");
  return res.data;
}

export async function getSession(id) {
  const res = await api.get(`/sessions/${id}`);
  return res.data;
}

export async function createSession(sessionData) {
  const res = await api.post("/sessions", sessionData);
  return res.data;
}

export async function updateSession(id, sessionData) {
  const res = await api.patch(`/sessions/${id}`, sessionData);
  return res.data;
}

export async function deleteSession(id) {
  const res = await api.delete(`/sessions/${id}`);
  return res.data;
}
