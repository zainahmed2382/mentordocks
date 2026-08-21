import type { CoreWebVitals, LighthouseCategoryScores, PageSpeedResult, PsiAuditItem, ScanStrategy } from "./types";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function scoreFromCategory(cat: { score?: number | null } | undefined): number {
  if (cat?.score == null) return 0;
  return Math.round(cat.score * 100);
}

function extractNumeric(audit: any): number | undefined {
  if (typeof audit?.numericValue === "number") return audit.numericValue;
  return undefined;
}

function mapAudits(lighthouseResult: any): {
  audits: PsiAuditItem[];
  opportunities: PsiAuditItem[];
  diagnostics: PsiAuditItem[];
  passedAudits: PsiAuditItem[];
  passedCount: number;
} {
  const auditsDict = lighthouseResult?.audits || {};
  const allAudits: PsiAuditItem[] = [];
  const opportunities: PsiAuditItem[] = [];
  const diagnostics: PsiAuditItem[] = [];
  const passedAudits: PsiAuditItem[] = [];

  for (const [id, audit] of Object.entries(auditsDict) as [string, any][]) {
    if (!audit?.title) continue;
    const score = typeof audit.score === "number" ? audit.score : null;

    const item: PsiAuditItem = {
      id,
      title: audit.title,
      description: audit.description || "",
      score,
      displayValue: audit.displayValue,
      numericValue: extractNumeric(audit),
      category: audit.details?.type,
    };

    if (score !== null && score >= 0.9) {
      passedAudits.push(item);
      continue;
    }

    if (audit.scoreDisplayMode === "notApplicable" || audit.scoreDisplayMode === "manual") continue;

    allAudits.push(item);

    if (audit.details?.type === "opportunity" || (audit.numericValue && audit.numericValue > 0 && score !== null && score < 0.9)) {
      opportunities.push(item);
    } else if (audit.details?.type === "table" || audit.scoreDisplayMode === "informative" || (score !== null && score < 0.9)) {
      diagnostics.push(item);
    }
  }

  allAudits.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
  opportunities.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
  diagnostics.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));

  return {
    audits: allAudits.slice(0, 25),
    opportunities: opportunities.slice(0, 15),
    diagnostics: diagnostics.slice(0, 15),
    passedAudits: passedAudits.slice(0, 20),
    passedCount: passedAudits.length,
  };
}

function extractCoreWebVitals(lighthouseResult: any): CoreWebVitals {
  const audits = lighthouseResult?.audits || {};
  return {
    lcpMs: extractNumeric(audits["largest-contentful-paint"]) ?? null,
    cls: extractNumeric(audits["cumulative-layout-shift"]) ?? null,
    inpMs: extractNumeric(audits["interaction-to-next-paint"]) ?? extractNumeric(audits["experimental-interaction-to-next-paint"]) ?? null,
    fcpMs: extractNumeric(audits["first-contentful-paint"]) ?? null,
    tbtMs: extractNumeric(audits["total-blocking-time"]) ?? null,
    ttfbMs: extractNumeric(audits["server-response-time"]) ?? extractNumeric(audits["time-to-first-byte"]) ?? null,
    speedIndex: extractNumeric(audits["speed-index"]) ?? null,
  };
}

function extractCategories(lighthouseResult: any): LighthouseCategoryScores {
  const cats = lighthouseResult?.categories || {};
  return {
    performance: scoreFromCategory(cats.performance),
    accessibility: scoreFromCategory(cats.accessibility),
    seo: scoreFromCategory(cats.seo),
    bestPractices: scoreFromCategory(cats["best-practices"]),
  };
}

interface PsiCacheEntry {
  timestamp: number;
  data: PageSpeedResult;
}

const psiCache = new Map<string, PsiCacheEntry>();
const inFlightPsiMap = new Map<string, Promise<PageSpeedResult>>();
const PSI_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export async function runPageSpeedInsights(url: string, strategy: ScanStrategy = "mobile"): Promise<PageSpeedResult> {
  // Use environment variables only. Do NOT hardcode or generate fake fallback API keys.
  const apiKey = (process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY || "").trim();

  // Ensure URL is properly formatted
  let targetUrl = url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      targetUrl = `https://${url}`;
    }
  } catch {
    targetUrl = `https://${url}`;
  }

  const cacheKey = `${targetUrl.toLowerCase()}::${strategy}`;
  const now = Date.now();

  const cached = psiCache.get(cacheKey);
  if (cached && now - cached.timestamp < PSI_CACHE_TTL_MS && !cached.data.error) {
    console.log(`[PageSpeed] Cache hit for ${targetUrl} (${strategy})`);
    return cached.data;
  }

  if (inFlightPsiMap.has(cacheKey)) {
    console.log(`[PageSpeed] Reusing in-flight request for ${targetUrl} (${strategy})`);
    return inFlightPsiMap.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<PageSpeedResult> => {
    const params = new URLSearchParams({
      url: targetUrl,
      strategy,
    });
    params.append("category", "PERFORMANCE");
    params.append("category", "ACCESSIBILITY");
    params.append("category", "SEO");
    params.append("category", "BEST_PRACTICES");

    if (apiKey) {
      params.set("key", apiKey);
    }

    console.log(`[PageSpeed] Initiating PageSpeed Insights API call for "${targetUrl}" (strategy: ${strategy}, apiKeyProvided: ${Boolean(apiKey)})`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `PageSpeed Insights API returned status ${response.status}`;
        try {
          const errObj = JSON.parse(errorText);
          if (errObj.error?.message) {
            errorMessage = errObj.error.message;
          }
        } catch {
          // ignore JSON parse error
        }

        if (response.status === 400) {
          errorMessage = `Invalid URL or target website unreachable by PageSpeed Insights (${targetUrl}).`;
        } else if (response.status === 429) {
          errorMessage = "PageSpeed Insights rate limit reached (429 Quota Exceeded). Please configure a valid PAGESPEED_API_KEY.";
        } else if (response.status === 403) {
          errorMessage = "PageSpeed Insights API key is invalid or unauthorized.";
        }

        if (response.status === 429) {
          console.log(`[PageSpeed] Public quota rate limit reached (429) for ${targetUrl}. Falling back to internal HTML/crawler audit engine.`);
        } else {
          console.log(`[PageSpeed] API Request status ${response.status} for ${targetUrl}. Details: ${errorMessage}`);
        }

        return {
          strategy,
          categories: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
          coreWebVitals: { lcpMs: null, cls: null, inpMs: null, fcpMs: null, tbtMs: null, ttfbMs: null, speedIndex: null },
          audits: [],
          opportunities: [],
          diagnostics: [],
          passedAudits: [],
          passedCount: 0,
          fetchTime: new Date().toISOString(),
          lighthouseVersion: "",
          error: `PageSpeed Insights is currently unavailable (${errorMessage})`,
        };
      }

      const data = await response.json();
      const lighthouseResult = data.lighthouseResult;

      if (!lighthouseResult) {
        console.error(`[PageSpeed] API returned 200 OK but missing lighthouseResult for ${targetUrl}`);
        return {
          strategy,
          categories: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
          coreWebVitals: { lcpMs: null, cls: null, inpMs: null, fcpMs: null, tbtMs: null, ttfbMs: null, speedIndex: null },
          audits: [],
          opportunities: [],
          diagnostics: [],
          passedAudits: [],
          passedCount: 0,
          fetchTime: new Date().toISOString(),
          lighthouseVersion: "",
          error: "PageSpeed Insights is currently unavailable (Missing Lighthouse results)",
        };
      }

      const categories = extractCategories(lighthouseResult);
      const coreWebVitals = extractCoreWebVitals(lighthouseResult);
      const { audits, opportunities, diagnostics, passedAudits, passedCount } = mapAudits(lighthouseResult);

      console.log(`[PageSpeed] SUCCESS: Fetched Lighthouse v${lighthouseResult?.lighthouseVersion || "unknown"} for ${targetUrl}. Performance: ${categories.performance}, Accessibility: ${categories.accessibility}, SEO: ${categories.seo}, Best Practices: ${categories.bestPractices}`);

      return {
        strategy,
        categories,
        coreWebVitals,
        audits,
        opportunities,
        diagnostics,
        passedAudits,
        passedCount,
        fetchTime: data.analysisUTCTimestamp || new Date().toISOString(),
        lighthouseVersion: lighthouseResult?.lighthouseVersion || "",
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === "AbortError";
      const errorMessage = isTimeout
        ? "PageSpeed API request timed out after 30s"
        : `PageSpeed API network error: ${err?.message || "Unknown error"}`;

      console.warn(`[PageSpeed] Exception during PageSpeed Insights request for ${targetUrl}:`, errorMessage);

      return {
        strategy,
        categories: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
        coreWebVitals: { lcpMs: null, cls: null, inpMs: null, fcpMs: null, tbtMs: null, ttfbMs: null, speedIndex: null },
        audits: [],
        opportunities: [],
        diagnostics: [],
        passedAudits: [],
        passedCount: 0,
        fetchTime: new Date().toISOString(),
        lighthouseVersion: "",
        error: `PageSpeed Insights is currently unavailable (${errorMessage})`,
      };
    }
  })();

  inFlightPsiMap.set(cacheKey, fetchPromise);

  try {
    const res = await fetchPromise;
    if (!res.error) {
      psiCache.set(cacheKey, { timestamp: Date.now(), data: res });
    }
    return res;
  } finally {
    inFlightPsiMap.delete(cacheKey);
  }
}


