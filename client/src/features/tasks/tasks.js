import api from "@/features/api";

export async function getSessionTasks(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/tasks`);
  return res.data;
}

export async function createTaskSubmission(taskId, submissionData) {
  const formData = new FormData();

  if (submissionData.file) {
    formData.append("file", submissionData.file);
  }

  if (submissionData.content) {
    formData.append("content", submissionData.content);
  }

  const res = await api.post(`/tasks/${taskId}/submissions`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
export async function createTask(sessionId, taskData) {
  // ⚠️ بنباصي الـ taskData (اللي هي الـ FormData الحقيقية) مباشرة كـ Body
  // Axios تلقائياً هيفهم إنها FormData وهيظبط الـ Headers لـ multipart/form-data من نفسه
  const res = await api.post(`/director/sessions/${sessionId}/tasks`, taskData);
  
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

  const res = await api.post(
    `/director/sessions/${sessionId}/materials`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

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


export async function deleteTask(taskId) {
  const res = await api.delete(`/director/tasks/${taskId}`);
  return res.data;
}