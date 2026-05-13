import api from "@/features/api";

export async function listDirectorApplications({ committeeId, status } = {}) {
  const params = {};

  if (committeeId) params.committeeId = committeeId;
  if (status) params.status = status;

  const { data } = await api.get(`/executive/applications`, {
    params,
  });

  return data;
}

export async function acceptDirectorPhase1(applicationId) {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase1/accept`,
  );

  return data;
}

export async function rejectDirectorPhase1(applicationId) {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase1/reject`,
  );

  return data;
}

export async function acceptDirectorPhase2(applicationId) {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase2/accept`,
  );

  return data;
}

export async function rejectDirectorPhase2(applicationId) {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase2/reject`,
  );

  return data;
}

export async function scheduleDirectorInterview(applicationId, { date, link }) {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/interview/schedule`,
    { date, link },
  );

  return data;
}
