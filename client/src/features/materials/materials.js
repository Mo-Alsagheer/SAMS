import api from "@/features/api";

export async function getMaterials(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/materials`);
  return res.data;
}
export async function uploadSessionMaterial(sessionId, formData) {
  const res = await api.post(`/director/sessions/${sessionId}/materials`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
export async function deleteMaterial(materialId) {
  const res = await api.delete(`/director/materials/${materialId}`);
  return res.data;
}
