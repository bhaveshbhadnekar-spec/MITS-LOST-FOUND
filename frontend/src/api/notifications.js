import api from "./client";

export async function getMyNotifications() {
  const res = await api.get("/notifications");
  return res.data; // { success, notifications }
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch("/notifications/read-all");
  return res.data;
}
