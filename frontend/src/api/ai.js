import api from "./client";

export async function analyzeItemImage(imageFile) {
  const fd = new FormData();
  fd.append("image", imageFile);

  const res = await api.post("/ai/analyze-image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
