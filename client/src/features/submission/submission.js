import api from "@/features/api";

export async function getSessionTasks(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/tasks`);
  return res.data; 
}


export async function getTaskSubmissions(taskId) {
  const res = await api.get(`/director/tasks/${taskId}/submissions`);
  return res.data; 
}

export async function updateSubmissionScore(submissionId, score) {
  const res = await api.patch(`/director/submissions/${submissionId}/score`, {
    score: Number(score)
  });
  return res.data;
}