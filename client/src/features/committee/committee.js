import api from "../api";

export async function getCommittee(id) {
  const res = await api.get(`/committees/${id}`);
  return res.data;
}
export async function getCommittees() {
  const res = await api.get(`/committees`);
  return res.data;
}

export async function deleteCommittee(id) {
  const res = await api.delete(`/committees/${id}`);
  return res.data;
}

export async function directorUpdateCommittee(id, data) {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.description)
    formData.append("description", data.description);

  if (data.type) formData.append("type", data.type);

  if (data.image) formData.append("image", data.image);

  const res = await api.patch(
    `/committees/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}

export async function updateCommittee(id, data) {
  const res = await api.patch(`/committees/${id}`, data);
  return res.data;
}

export async function addCommittee(data) {
  const res = await api.post(`/committees`, data);
  return res.data;
}


export async function getCommitteeDirectors(committeeId) {
  const res = await api.get(
    `/executive/committees/${committeeId}/directors`
  );
  return res.data;
}

export async function getCommitteeMembers(committeeId) {
  const res = await api.get(
    `/executive/committees/${committeeId}/members`
  );
  return res.data;
}
