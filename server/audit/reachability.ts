import dns from "node:dns";
import { promisify } from "node:util";

const lookupAsync = promisify(dns.lookup);
const resolve4Async = promisify(dns.resolve4);
const resolve6Async = promisify(dns.resolve6);

export type ReachabilityErrorType = "INVALID_URL" | "NOT_FOUND" | "UNREACHABLE";

export class AuditReachabilityError extends Error {
  public readonly errorType: ReachabilityErrorType;
  public readonly title: string;

  constructor(errorType: ReachabilityErrorType, title: string, message: string) {
    super(message);
    this.name = "AuditReachabilityError";
    this.errorType = errorType;
    this.title = title;
  }
}

export interface ReachabilityResult {
  reachable: boolean;
  finalUrl?: string;
  errorType?: ReachabilityErrorType;
  title?: string;
  error?: string;
  statusCode?: number;
}

// IP / Private Range validation to prevent localhost / private network audits
function isPrivateOrReservedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".localhost")
  ) {
    return true;
  }

  // Check IPv4 private ranges
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }

  return false;
}

/**
 * Validates domain existence via DNS resolution before performing HTTP crawls.
 */
export async function verifyDomainExists(hostname: string): Promise<{ exists: boolean; errorType?: ReachabilityErrorType; title?: string; message?: string }> {
  if (isPrivateOrReservedHost(hostname)) {
    return {
      exists: false,
      errorType: "INVALID_URL",
      title: "Invalid Website Address",
      message: "Please enter a valid, publicly accessible website domain (e.g., example.com).",
    };
  }

  try {
    // Attempt standard OS DNS lookup with a 5-second timeout
    const lookupPromise = lookupAsync(hostname);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const timeoutErr = new Error("DNS lookup timed out");
        timeoutErr.name = "TimeoutError";
        reject(timeoutErr);
      }, 5000);
    });

    await Promise.race([lookupPromise, timeoutPromise]);
    return { exists: true };
  } catch (err: any) {
    const code = err?.code || "";
    const msg = String(err?.message || "").toLowerCase();

    // Check for explicit DNS non-existent domain codes
    if (
      code === "ENOTFOUND" ||
      code === "ENODATA" ||
      code === "EAI_NONAME" ||
      code === "SERVFAIL" ||
      code === "NXDOMAIN" ||
      msg.includes("enotfound") ||
      msg.includes("getaddrinfo")
    ) {
      return {
        exists: false,
        errorType: "NOT_FOUND",
        title: "Website Not Found",
        message: "We couldn't reach this website. Please check the URL and make sure the website exists and is publicly accessible.",
      };
    }

    if (code === "EAI_AGAIN" || code === "ETIMEDOUT" || err?.name === "TimeoutError" || msg.includes("timed out")) {
      // Secondary fallback check via direct resolver before failing
      try {
        await Promise.any([resolve4Async(hostname), resolve6Async(hostname)]);
        return { exists: true };
      } catch (secErr: any) {
        const secCode = secErr?.code || "";
        if (secCode === "ENOTFOUND" || secCode === "ENODATA" || secCode === "NOTFOUND") {
          return {
            exists: false,
            errorType: "NOT_FOUND",
            title: "Website Not Found",
            message: "We couldn't reach this website. Please check the URL and make sure the website exists and is publicly accessible.",
          };
        }
        return {
          exists: false,
          errorType: "UNREACHABLE",
          title: "Website Temporarily Unreachable",
          message: "We couldn't scan this website right now. Please try again in a moment.",
        };
      }
    }

    // Default DNS failure to NOT_FOUND if domain cannot be resolved
    return {
      exists: false,
      errorType: "NOT_FOUND",
      title: "Website Not Found",
      message: "We couldn't reach this website. Please check the URL and make sure the website exists and is publicly accessible.",
    };
  }
}
