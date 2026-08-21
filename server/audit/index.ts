import { buildAuditReport, enrichReportWithGemini } from "./buildReport";
import { crawlWebsite } from "./httpCrawl";
import { normalizeUrl } from "./normalizeUrl";
import { runPageSpeedInsights } from "./pageSpeedInsights";
import { AuditReachabilityError, verifyDomainExists } from "./reachability";
import type { AuditOptions, BrowserAuditResult, PageSpeedResult, RawAuditData } from "./types";

export type { AuditOptions } from "./types";
export { AuditReachabilityError } from "./reachability";

interface AuditCacheEntry {
  timestamp: number;
  result: any;
}

const auditCache = new Map<string, AuditCacheEntry>();
const inFlightAuditMap = new Map<string, Promise<any>>();
const AUDIT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function runWebsiteAudit(inputUrl: string, options: AuditOptions = {}) {
  // Step 1: Input URL and Domain Structure Validation
  const normalized = normalizeUrl(inputUrl);
  if (normalized.ok === false) {
    throw new AuditReachabilityError(normalized.errorType, normalized.title, normalized.error);
  }

  // Step 2: DNS & Domain Existence Verification
  const domainCheck = await verifyDomainExists(normalized.hostname);
  if (!domainCheck.exists) {
    throw new AuditReachabilityError(
      domainCheck.errorType || "NOT_FOUND",
      domainCheck.title || "Website Not Found",
      domainCheck.message || "We couldn't reach this website. Please check the URL and make sure the website exists and is publicly accessible."
    );
  }

  const url = normalized.url;
  const strategy = options.strategy || "mobile";
  const deep = options.deep ?? false;
  const cacheKey = `${url.toLowerCase()}::${strategy}::${deep}`;
  const now = Date.now();

  const cached = auditCache.get(cacheKey);
  if (cached && now - cached.timestamp < AUDIT_CACHE_TTL_MS && !cached.result.auditMeta?.pageSpeedError) {
    console.log(`[Audit] Cache hit for audit ${url} (${strategy})`);
    return {
      ...cached.result,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
  }

  if (inFlightAuditMap.has(cacheKey)) {
    console.log(`[Audit] Joining in-flight scan for ${url} (${strategy})`);
    return inFlightAuditMap.get(cacheKey)!;
  }

  const auditPromise = (async () => {
    console.log(`[Audit] Starting crawl & scan for ${url} (deep=${deep}, strategy=${strategy})`);

    // Step 3: Crawl website and strictly verify reachability & HTML availability
    const crawl = await crawlWebsite(url, options);

    if (!crawl.isAccessible || !crawl.html) {
      const errorType = crawl.errorType || (crawl.statusCode === 404 ? "NOT_FOUND" : "UNREACHABLE");
      const errorTitle =
        crawl.errorTitle ||
        (errorType === "NOT_FOUND" ? "Website Not Found" : "Website Temporarily Unreachable");
      const errorMessage =
        crawl.error ||
        (errorType === "NOT_FOUND"
          ? "We couldn't reach this website. Please check the URL and make sure the website exists and is publicly accessible."
          : "We couldn't scan this website right now. Please try again in a moment.");

      throw new AuditReachabilityError(errorType, errorTitle, errorMessage);
    }

    // Step 4: Now that website is proven accessible, run PageSpeed Insights and Browser Audit in parallel
    let pageSpeedPromise: Promise<PageSpeedResult | null> = Promise.resolve(null);
    if (options.checks?.performanceWebVitals !== false) {
      pageSpeedPromise = runPageSpeedInsights(url, strategy);
    }

    let browserPromise: Promise<BrowserAuditResult | null> = Promise.resolve(null);
    if (deep && !process.env.VERCEL) {
      browserPromise = import("./browserAudit")
        .then(({ runBrowserAudit }) => runBrowserAudit(url, { ...options, strategy }))
        .catch((err) => {
          console.warn("[Audit] Browser audit skipped:", err?.message);
          return null;
        });
    }

    const [pageSpeed, browser] = await Promise.all([pageSpeedPromise, browserPromise]);

    const raw: RawAuditData = {
      crawl,
      pageSpeed,
      browser,
    };

    // Step 5: Build audit report and enrich with Gemini insights
    const initialReport = buildAuditReport(raw, options);
    const report = await enrichReportWithGemini(initialReport, url);

    const result = {
      ...report,
      url,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "completed" as const,
      auditMeta: {
        engine: deep && !process.env.VERCEL ? "lighthouse+puppeteer+psi+http" : "pagespeed+http",
        finalUrl: crawl.finalUrl,
        statusCode: crawl.statusCode,
        responseTimeMs: crawl.responseTimeMs,
        lighthouseVersion: raw.pageSpeed?.lighthouseVersion || null,
        pageSpeedError: raw.pageSpeed?.error || null,
        browserAuditError: raw.browser?.error || null,
      },
    };

    if (!result.auditMeta.pageSpeedError) {
      auditCache.set(cacheKey, { timestamp: Date.now(), result });
    }

    return result;
  })();

  inFlightAuditMap.set(cacheKey, auditPromise);

  try {
    const res = await auditPromise;
    return res;
  } finally {
    inFlightAuditMap.delete(cacheKey);
  }
}
