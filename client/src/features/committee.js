import { BASE_URL } from "./api";

export async function getCommittee(id, token) {
  const res = await fetch(`${BASE_URL}/committees/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function updateCommitteeDescription(id, description, token) {
  const res = await fetch(`${BASE_URL}/committees/${id}/description`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      description,
    }),
  });

  return res.json();
}
