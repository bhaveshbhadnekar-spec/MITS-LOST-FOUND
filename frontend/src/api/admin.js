import api from "./client";

export async function getUsers() {
  const res = await api.get("/admin/users");
  return res.data;
}

export async function suspendUser(id, reason) {
  const res = await api.patch(`/admin/users/${id}/suspend`, { reason });
  return res.data;
}

export async function reinstateUser(id) {
  const res = await api.patch(`/admin/users/${id}/reinstate`);
  return res.data;
}

export async function getAdminAnalytics() {
  const res = await api.get("/admin/analytics");
  return res.data;
}

export async function deleteSpamLostItem(id) {
  const res = await api.delete(`/admin/lost-items/${id}`);
  return res.data;
}

export async function deleteSpamFoundItem(id) {
  const res = await api.delete(`/admin/found-items/${id}`);
  return res.data;
}