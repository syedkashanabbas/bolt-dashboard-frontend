export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // for refresh token cookie if needed
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return res.json();
}
