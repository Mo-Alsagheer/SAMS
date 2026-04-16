import api from "@/features/api";

export const getDirectorApplications = async (committeeId, status) => {
  const params = {};

  if (committeeId) params.committeeId = committeeId;
  if (status) params.status = status;

  const { data } = await api.get("/executive/applications", { params });

  return data;
};

export const acceptExecutiveApplicationPhase1 = async (applicationId) => {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase1/accept`,
  );
  return data;
};

export const rejectExecutiveApplicationPhase1 = async (applicationId) => {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase1/reject`,
  );
  return data;
};

export const acceptExecutiveApplicationPhase2 = async (applicationId) => {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase2/accept`,
  );
  return data;
};

export const rejectExecutiveApplicationPhase2 = async (applicationId) => {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/phase2/reject`,
  );
  return data;
};

export const scheduleExecutiveApplicationInterview = async (
  applicationId,
  { date, link },
) => {
  const { data } = await api.post(
    `/executive/applications/${applicationId}/interview/schedule`,
    {
      date,
      link,
    },
  );
  return data;
};
