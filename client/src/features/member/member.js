import api from "@/features/api";

export async function getUserProfile() {
  const res = await api.get("/users/profile");
  return res.data;
}

export async function getCommitteeScoreboard(committeeId) {
  const res = await api.get(`/committees/${committeeId}/scoreboard`);
  return res.data;
}