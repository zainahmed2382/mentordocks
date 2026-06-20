/// <reference types="vite/client" />
/**
 * Resolves the API URL dynamically.
 * If VITE_API_URL is defined, it prefixes the request path.
 * Otherwise, it uses a relative path (which relies on local proxy or vercel.json rewrites).
 */
export function getApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  // Ensure we don't duplicate slashes
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
