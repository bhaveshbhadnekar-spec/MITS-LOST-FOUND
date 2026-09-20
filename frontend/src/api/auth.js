import api from "./client";

export async function registerUser({ name, email, password, department }) {
  const res = await api.post("/auth/register", { name, email, password, department });
  return res.data;
}

export async function loginUser({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function logoutUser() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data;
}
export async function googleLogin(idToken) {
  const res = await api.post("/auth/google", { idToken });
  return res.data;
}
export async function forgotPassword(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPassword(token, password) {
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  return res.data;
}