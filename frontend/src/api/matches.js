import api from "./client";

export async function getAllMatches() {
  const res = await api.get("/matches");
  return res.data; // { success, count, matches: [{ lostItem, foundItem, score }] }
}

export async function getMatchesForLostItem(id) {
  const res = await api.get(`/matches/lost/${id}`);
  return res.data;
}

export async function getMatchesForFoundItem(id) {
  const res = await api.get(`/matches/found/${id}`);
  return res.data;
}