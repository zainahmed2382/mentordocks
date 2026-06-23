/// <reference types="vite/client" />
/**
 * Resolves the API URL dynamically.
 * If VITE_API_URL is defined, it prefixes the request path.
 * Otherwise, it uses a relative path (which relies on local proxy or vercel.json rewrites).
 */
export function getApiUrl(path: string): string {
  let baseUrl = "";
  try {
    baseUrl = localStorage.getItem("ms_custom_api_url") || "";
  } catch {}

  if (!baseUrl) {
    baseUrl = import.meta.env.VITE_API_URL || "";
  }

  // If no base URL is defined and we are running locally, default to backend server port 3000
  if (!baseUrl && typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    baseUrl = "http://localhost:3000";
  }

  // Ensure we don't duplicate slashes
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
