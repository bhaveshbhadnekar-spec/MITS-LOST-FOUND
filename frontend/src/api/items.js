import api from "./client";

export async function getLostItems(params = {}) {
  const res = await api.get("/lost-items", { params });
  return res.data;
}

export async function getFoundItems(params = {}) {
  const res = await api.get("/found-items", { params });
  return res.data;
}

export async function getMyLostItems() {
  const res = await api.get("/lost-items/mine");
  return res.data;
}

export async function getMyFoundItems() {
  const res = await api.get("/found-items/mine");
  return res.data;
}

export async function createLostItem(form, imageFile) {
  const fd = new FormData();
  fd.append("itemName", form.name);
  fd.append("category", form.category);
  fd.append("description", form.desc);
  fd.append("dateLost", form.date);
  fd.append("location", form.location);
  fd.append("contact", form.contact);
  if (imageFile) fd.append("image", imageFile);

  const res = await api.post("/lost-items", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function createFoundItem(form, imageFile) {
  const fd = new FormData();
  fd.append("itemName", form.name);
  fd.append("category", form.category);
  fd.append("description", form.desc);
  fd.append("dateFound", form.date);
  fd.append("location", form.location);
  fd.append("notes", form.notes || "");
  if (imageFile) fd.append("image", imageFile);

  const res = await api.post("/found-items", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}