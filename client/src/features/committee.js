import api from "./api";

export async function getCommittee(id) {
  const res = await api.get(`/committees/${id}`);
  return res.data;
}

export async function updateCommitteeDescription(id, description) {
  const res = await api.patch(`/committees/${id}/description`, {
    description,
  });

  return res.data;
}