import api from "@/features/api";

export async function getRecruitments() {
  const res = await api.get("/executive/recruitment");
  return res.data;
}

export async function openExecutiveRecruitment(data) {
  const res = await api.post("/executive/recruitment/global/open", data);
  return res.data;
}

export async function openCommitteeRecruitment(committeeId, data) {
  const res = await api.post(
    `/executive/recruitment/${committeeId}/open`,
    data,
  );
  return res.data;
}

export async function closeRecruitmentApi(id) {
  const res = await api.post(`/executive/recruitment/${id}/close`);
  return res.data;
}

export async function getCommitteeRecruitmentStatus(committeeId, role = "") {
  const res = await api.get(`/executive/recruitment/${committeeId}/status`, {
    params: { role },
  });
  return res.data;
}

export async function getGlobalRecruitment() {
  const res = await api.get("/executive/recruitment/global");
  return res.data;
}

export async function getRecruitmentById(id) {
  const res = await api.get(`/executive/recruitment/${id}`);
  return res.data;
}