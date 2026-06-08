import api from "@/features/api";

export async function getSessionTasks(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/tasks`);
  return res.data;
}

export async function createTask(sessionId, taskData) {
  const res = await api.post(`/director/sessions/${sessionId}/tasks`, {
    title: taskData.title,
    description: taskData.description,
    dueDate: new Date(taskData.deadline).toISOString(),
  });
  return res.data;
}

export async function uploadSessionMaterial(sessionId, materialData) {
  const formData = new FormData();
  formData.append("title", materialData.title);
  
  if (materialData.file) {
    formData.append("file", materialData.file); 
  }
  
  if (materialData.fileUrl) {
    formData.append("fileUrl", materialData.fileUrl);
  }

  const res = await api.post(`/director/sessions/${sessionId}/materials`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return res.data;
}

export async function deleteSessionMaterial(materialId) {
  const res = await api.delete(`/director/materials/${materialId}`);
  return res.data;
}

export async function getSessionMaterials(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/materials`);
  return res.data;
}