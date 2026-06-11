import api from "@/features/api";

export async function createMeeting(sessionId) {
  const res = await api.post(`/director/sessions/${sessionId}/meeting/create`);
  return res.data;
}

export async function joinMeeting(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/meeting/join`);
  return res.data;
}

export async function createSessionMeeting(sessionId, meetingData) {
  const res = await api.post(`/director/sessions/${sessionId}/meeting/create`, meetingData);
  return res.data;
}

export async function getMyMeetings() {
  const res = await api.get("/sessions/my-meetings");
  return res.data;
}