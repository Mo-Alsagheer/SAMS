import api from "@/features/api";

export async function submitApplication(data) {
  const res = await api.post(`/applications/submit`, data);
  return res.data;
}

export async function getApplication(id) {
  const res = await api.get(`/applications/${id}`);
  return res.data;
}

const createApplicationActions = (role) => ({
  list: async ({ committeeId, status } = {}) => {
    const params = {};

    if (committeeId) params.committeeId = committeeId;
    if (status) params.status = status;

    const { data } = await api.get(`/${role}/applications`, { params });
    return data;
  },

  acceptPhase1: async (applicationId) => {
    const { data } = await api.post(
      `/${role}/applications/${applicationId}/phase1/accept`
    );
    return data;
  },

  rejectPhase1: async (applicationId) => {
    const { data } = await api.post(
      `/${role}/applications/${applicationId}/phase1/reject`
    );
    return data;
  },

  acceptPhase2: async (applicationId) => {
    const { data } = await api.post(
      `/${role}/applications/${applicationId}/phase2/accept`
    );
    return data;
  },

  rejectPhase2: async (applicationId) => {
    const { data } = await api.post(
      `/${role}/applications/${applicationId}/phase2/reject`
    );
    return data;
  },

  scheduleInterview: async (applicationId, { date, link }) => {
    const { data } = await api.post(
      `/${role}/applications/${applicationId}/interview/schedule`,
      { date, link }
    );
    return data;
  },
});

export const manageDirectorsApllications = createApplicationActions("executive");
export const manageMembersApllications = createApplicationActions("director");


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
