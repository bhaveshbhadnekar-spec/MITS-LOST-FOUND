import api from "./client";

// itemId: FoundItem _id being claimed. proofFile: optional image proving ownership.
export async function createClaim({ itemId, ownershipDescription, identificationDetails }, proofFile) {
  const fd = new FormData();
  fd.append("itemId", itemId);
  fd.append("ownershipDescription", ownershipDescription);
  fd.append("identificationDetails", identificationDetails);
  if (proofFile) fd.append("proof", proofFile);

  const res = await api.post("/claims", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getMyClaims() {
  const res = await api.get("/claims/mine");
  return res.data; // { success, claims }
}

// Claims other people submitted on items *you* reported as found
export async function getReceivedClaims() {
  const res = await api.get("/claims/received");
  return res.data;
}

// admin/security only
export async function getAllClaims(status) {
  const res = await api.get("/claims", { params: status ? { status } : {} });
  return res.data;
}

export async function decideClaim(id, decision, adminNote) {
  const res = await api.patch(`/claims/${id}/decision`, { decision, adminNote });
  return res.data;
}