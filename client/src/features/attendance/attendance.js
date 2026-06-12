import api from "@/features/api";


export async function getSessionAttendance(sessionId) {
  const res = await api.get(`/director/sessions/${sessionId}/attendance`);
  return res.data;
}

export async function markSessionAttendance(sessionId, attendanceData) {
  const res = await api.patch(`/director/sessions/${sessionId}/attendance`, attendanceData);
  return res.data;
}