import api from "@/features/api";

export async function listMemberApplications({ committeeId, status } = {}) {
  const params = {};

  if (committeeId) params.committeeId = committeeId;
  if (status) params.status = status;

  const { data } = await api.get(`/director/applications`, {
    params,
  });

  return data;
}

export async function acceptMemberPhase1(applicationId) {
  const { data } = await api.post(
    `/director/applications/${applicationId}/phase1/accept`,
  );

  return data;
}

export async function rejectMemberPhase1(applicationId) {
  const { data } = await api.post(
    `/director/applications/${applicationId}/phase1/reject`,
  );

  return data;
}

export async function acceptMemberPhase2(applicationId) {
  const { data } = await api.post(
    `/director/applications/${applicationId}/phase2/accept`,
  );

  return data;
}

export async function rejectMemberPhase2(applicationId) {
  const { data } = await api.post(
    `/director/applications/${applicationId}/phase2/reject`,
  );

  return data;
}

export async function scheduleMemberInterview(applicationId, { date, link }) {
  const { data } = await api.post(
    `/director/applications/${applicationId}/interview/schedule`,
    { date, link },
  );

  return data;
}
