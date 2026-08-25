import api from "./client";

export async function createReview({ claimId, rating, comment }) {
  const res = await api.post("/reviews", { claimId, rating, comment });
  return res.data;
}

export async function getFinderReviews(userId) {
  const res = await api.get(`/reviews/finder/${userId}`);
  return res.data; // { success, count, avgRating, reviews }
}