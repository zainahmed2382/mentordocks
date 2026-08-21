import { analyzeHtml } from "./htmlAnalyzer";
import type { AuditOptions, HttpCrawlResult, SecurityHeaderFindings } from "./types";
import type { ReachabilityErrorType } from "./reachability";

const SECURITY_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

function evaluateSecurityHeaders(headers: Record<string, string>): SecurityHeaderFindings {
  const present: Record<string, string | null> = {};
  const missing: string[] = [];

  for (const name of SECURITY_HEADERS) {
    const value = headers[name] ?? headers[name.toLowerCase()];
    if (value) present[name] = value;
    else {
      present[name] = null;
      missing.push(name);
    }
  }

  const score = Math.round(((SECURITY_HEADERS.length - missing.length) / SECURITY_HEADERS.length) * 100);
  return { present, missing, score };
}

function normalizeHeaderRecord(raw: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  raw.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

export async function crawlWebsite(url: string, options: AuditOptions = {}): Promise<HttpCrawlResult> {
  const checks = options.checks ?? {};
  const runSecurity = checks.securityHeaders !== false;

  const start = Date.now();
  let finalUrl = url;
  let statusCode = 0;
  let html = "";
  let headers: Record<string, string> = {};
  let error: string | undefined;
  let errorType: ReachabilityErrorType | undefined;
  let errorTitle: string | undefined;

  const tryFetch = async (targetUrl: string): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const resp = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MentorDocksAudit/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return resp;
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      throw fetchErr;
    }
  };

  try {
    let response: Response;
    try {
      response = await tryFetch(url);
    } catch (initialErr: any) {
      // If https failed with network/TLS error, try http fallback
      if (url.startsWith("https://")) {
        const httpUrl = `http://${url.slice(8)}`;
        try {
          response = await tryFetch(httpUrl);
        } catch {
          throw initialErr; // rethrow initial error if fallback also fails
        }
      } else {
        throw initialErr;
      }
    }

    statusCode = response.status;
    finalUrl = response.url || url;
    headers = normalizeHeaderRecord(response.headers);

    if (response.ok) {
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      if (
        contentType.includes("text/html") ||
        contentType.includes("application/xhtml") ||
        contentType === "" ||
        contentType.includes("text/plain")
      ) {
        html = await response.text();
      } else {
        errorType = "UNREACHABLE";
        errorTitle = "Website Temporarily Unreachable";
        error = "We couldn't scan this website right now. The address responded with non-HTML content.";
      }
    } else if (response.status === 404 || response.status === 410) {
      errorType = "NOT_FOUND";
      errorTitle = "Website Not Found";
      error = "We couldn't reach this website. Please check the URL and make sure the website exists and is publicly accessible.";
    } else if (response.status === 401 || response.status === 403) {
      errorType = "UNREACHABLE";
      errorTitle = "Website Temporarily Unreachable";
      error = "We couldn't scan this website right now. Access is restricted or protected.";
    } else if (response.status >= 500) {
      errorType = "UNREACHABLE";
      errorTitle = "Website Temporarily Unreachable";
      error = "We couldn't scan this website right now. The website's server returned an error.";
    } else {
      errorType = "UNREACHABLE";
      errorTitle = "Website Temporarily Unreachable";
      error = `We couldn't scan this website right now (HTTP ${response.status}).`;
    }
  } catch (err: any) {
    const errCode = err?.code || err?.cause?.code || "";
    const msg = String(err?.message || "").toLowerCase();

    if (
      errCode === "ENOTFOUND" ||
      errCode === "EAI_NONAME" ||
      errCode === "NXDOMAIN" ||
      msg.includes("enotfound") ||
      msg.includes("getaddrinfo")
    ) {
      errorType = "NOT_FOUND";
      errorTitle = "Website Not Found";
      error = "We couldn't reach this website. Please check the URL and make sure the website exists and is publicly accessible.";
    } else {
      errorType = "UNREACHABLE";
      errorTitle = "Website Temporarily Unreachable";
      error = "We couldn't scan this website right now. Please try again in a moment.";
    }
  }

  const responseTimeMs = Date.now() - start;
  const isAccessible = statusCode >= 200 && statusCode < 400 && html.length > 0;
  const security = runSecurity && isAccessible ? evaluateSecurityHeaders(headers) : { present: {}, missing: [], score: 100 };

  return {
    url,
    finalUrl,
    httpsSupported: finalUrl.toLowerCase().startsWith("https://"),
    isAccessible,
    statusCode,
    responseTimeMs,
    html,
    headers,
    security,
    htmlAnalysis: isAccessible ? analyzeHtml(html) : null,
    error,
    errorType,
    errorTitle,
  };
}
