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
