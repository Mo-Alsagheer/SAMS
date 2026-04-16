import api from "../api";

export async function submitApplication(data) {
  const res = await api.post(`/applications/submit`, data);
  return res.data;
}

export async function getApplication(id) {
  const res = await api.get(`/applications/${id}`);
  return res.data;
}
