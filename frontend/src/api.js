const rawApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const API_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : "http://localhost:5000/api";

export function getStoredAuth() {
  const token = localStorage.getItem("tp_token");
  const user = localStorage.getItem("tp_user");
  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
}

export function saveAuth({ token, user }) {
  localStorage.setItem("tp_token", token);
  localStorage.setItem("tp_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("tp_token");
  localStorage.removeItem("tp_user");
}

export async function apiRequest(path, options = {}) {
  const { token } = getStoredAuth();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed. Please try again.");
  }

  return data;
}
