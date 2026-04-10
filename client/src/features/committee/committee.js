import api from "../api";

export async function getCommittee(id) {
  const res = await api.get(`/committees/${id}`);
  return res.data;
}
export async function getCommittees() {
  const res = await api.get(`/committees`);
  return res.data;
}

export async function deleteCommittee(id) {
  const res = await api.delete(`/committees/${id}`);
  return res.data;
}
export async function updateCommitteeDescription(id, description) {
  const res = await api.patch(`/committees/${id}/description`, {
    description,
  });

  return res.data;
}

export async function updateCommittee(id, data) {
  const res = await api.patch(`/committees/${id}`, data);
  return res.data;
}

export async function addCommittee(data) {
  const res = await api.post(`/committees`, data);
  return res.data;
}
