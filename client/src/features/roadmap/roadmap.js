import api from "@/features/api";




export async function getSessionsByRoadmap(roadmapId) {
  const res = await api.get(`/sessions/roadmap/${roadmapId}`);
  return res.data; 
}