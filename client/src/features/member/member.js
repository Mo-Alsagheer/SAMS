import api from "@/features/api";

export async function getMemberDashBordData() {
  const res = await api.get("/member-dashboard");
  return res.data;
}

export async function getCommitteeMembers() {
  const res = await api.get("/users/committee-members");
  return res.data;
}


export async function updateMemberStatus(id, status) {
  const res = await api.patch(`/users/${id}/status`, { status });
  return res.data;
}

export async function getCommitteeStatistics() {
  const res = await api.get("/users/committee-members/statistics");
  return res.data;
}