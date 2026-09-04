import api from "./client";

export async function getConversations() {
  const res = await api.get("/chats");
  return res.data;
}

export async function getMessages(claimId) {
  const res = await api.get(`/chats/${claimId}`);
  return res.data;
}

export async function sendMessage(claimId, text) {
  const res = await api.post(`/chats/${claimId}`, { text });
  return res.data;
}