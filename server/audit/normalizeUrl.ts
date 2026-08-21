import { ReachabilityErrorType } from "./reachability";

export interface NormalizedUrlResult {
  ok: true;
  url: string;
  hostname: string;
}

export interface NormalizedUrlError {
  ok: false;
  errorType: ReachabilityErrorType;
  title: string;
  error: string;
}

export function normalizeUrl(input: string): NormalizedUrlResult | NormalizedUrlError {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return {
      ok: false,
      errorType: "INVALID_URL",
      title: "Invalid Website Address",
      error: "Please enter a website URL first.",
    };
  }

  // Reject URLs containing spaces or illegal characters
  if (/\s/.test(trimmed)) {
    return {
      ok: false,
      errorType: "INVALID_URL",
      title: "Invalid Website Address",
      error: "Please enter a valid website domain or URL without spaces.",
    };
  }

  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);
    const hostname = parsed.hostname.toLowerCase();

    // Check that hostname is structured properly with at least one period
    if (!hostname || !hostname.includes(".") || hostname.startsWith(".") || hostname.endsWith(".")) {
      return {
        ok: false,
        errorType: "INVALID_URL",
        title: "Invalid Website Address",
        error: "Please enter a valid website domain (e.g., example.com).",
      };
    }

    // Check domain segments (labels)
    const labels = hostname.split(".");
    if (labels.some((label) => !label || label.startsWith("-") || label.endsWith("-"))) {
      return {
        ok: false,
        errorType: "INVALID_URL",
        title: "Invalid Website Address",
        error: "Please enter a valid website domain (e.g., example.com).",
      };
    }

    // Validate TLD (must be letters, at least 2 characters long or internationalized punycode)
    const tld = labels[labels.length - 1];
    if (!/^[a-z]{2,}$/i.test(tld) && !tld.startsWith("xn--")) {
      return {
        ok: false,
        errorType: "INVALID_URL",
        title: "Invalid Website Address",
        error: "Please enter a valid domain with an existing extension (e.g., example.com).",
      };
    }

    // Disallow pure IP or local addresses in public scanner
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname === "localhost") {
      return {
        ok: false,
        errorType: "INVALID_URL",
        title: "Invalid Website Address",
        error: "Please enter a public website domain (e.g., example.com).",
      };
    }

    return {
      ok: true,
      url: parsed.toString(),
      hostname,
    };
  } catch {
    return {
      ok: false,
      errorType: "INVALID_URL",
      title: "Invalid Website Address",
      error: "Please enter a valid website domain or URL (e.g., example.com).",
    };
  }
}

