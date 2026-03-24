const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://intelliforge-creditforge-api.fly.dev";

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => apiFetch("/health"),
  getBorrowers: () => apiFetch("/api/borrowers"),
  createBorrower: (data: unknown) =>
    apiFetch("/api/borrowers", { method: "POST", body: JSON.stringify(data) }),
  getBorrower: (id: number) => apiFetch(`/api/borrowers/${id}`),
  runAssessment: (borrowerId: number) =>
    apiFetch(`/api/assess/${borrowerId}`, { method: "POST" }),
  getAssessment: (id: number) => apiFetch(`/api/assessments/${id}`),
  getStats: () => apiFetch("/api/stats"),
};
