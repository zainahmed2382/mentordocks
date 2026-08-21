import type { AuditOptions, BuiltReport, RawAuditData } from "./types";
import type { ProblemItem, RecommendationItem } from "../../src/types";
import { buildDetailedExplanation } from "./explanationBuilder";
import { explainAuditWithGemini } from "./geminiExplainer";

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function severityFromScore(score: number | null | undefined): "critical" | "medium" | "minor" {
  if (score == null) return "medium";
  if (score < 0.5) return "critical";
  if (score < 0.75) return "medium";
  return "minor";
}

function mapPsiCategory(auditId: string): BuiltReport["problems"][0]["category"] {
  if (auditId.includes("seo") || auditId.includes("meta") || auditId.includes("canonical")) return "seo";
  if (auditId.includes("accessibility") || auditId.includes("aria") || auditId.includes("alt")) return "accessibility";
  if (auditId.includes("font") || auditId.includes("heading")) return "typography";
  if (auditId.includes("color") || auditId.includes("contrast")) return "color";
  if (auditId.includes("responsive") || auditId.includes("viewport")) return "responsive";
  if (auditId.includes("javascript") || auditId.includes("errors-in-console")) return "code";
  if (auditId.includes("performance") || auditId.includes("render") || auditId.includes("lcp") || auditId.includes("cls")) {
    return "performance";
  }
  return "ux";
}

export function buildAuditReport(data: RawAuditData, options: AuditOptions = {}): BuiltReport {
  const checks = options.checks ?? {};
  const problems: BuiltReport["problems"] = [];
  const recommendations: BuiltReport["recommendations"] = [];

  const { crawl, pageSpeed, browser } = data;
  const html = crawl.htmlAnalysis;
  const targetUrl = crawl.finalUrl || crawl.url || "your website";

  if (!crawl.httpsSupported) {
    const title = "HTTPS not enforced";
    const desc = "The final URL is not served over HTTPS. Browsers and search engines penalize insecure origins.";
    problems.push({
      id: nextId("p"),
      title,
      severity: "critical",
      description: desc,
      category: "code",
      details: buildDetailedExplanation("https", title, desc, "code", "critical", { url: targetUrl }),
    });
    recommendations.push({
      id: nextId("r"),
      title: "Enable HTTPS redirects",
      description: "Issue a valid TLS certificate and redirect all HTTP traffic to HTTPS with HSTS.",
      pointsAdded: 12,
      category: "security",
    });
  }

  if (checks.securityHeaders !== false && crawl.security.missing.length > 0) {
    const missing = crawl.security.missing.join(", ");
    const title = "Missing security headers";
    const severity = crawl.security.missing.length >= 4 ? "critical" : "medium";
    const desc = `The response is missing recommended headers: ${missing}. These reduce XSS, clickjacking, and MIME-sniffing risk.`;
    problems.push({
      id: nextId("p"),
      title,
      severity,
      description: desc,
      category: "code",
      details: buildDetailedExplanation("security_headers", title, desc, "code", severity, { url: targetUrl, missingHeaders: crawl.security.missing }),
    });
    recommendations.push({
      id: nextId("r"),
      title: "Harden HTTP response headers",
      description: `Add ${missing} on your CDN or origin. Start with Content-Security-Policy, Strict-Transport-Security, and X-Content-Type-Options.`,
      pointsAdded: 10,
      category: "security",
    });
  }

  if (html) {
    if (!html.hasViewport) {
      const title = "Missing viewport meta tag";
      const desc = "No mobile viewport configuration was found, which breaks responsive layout on phones.";
      problems.push({
        id: nextId("p"),
        title,
        severity: "critical",
        description: desc,
        category: "responsive",
        details: buildDetailedExplanation("viewport", title, desc, "responsive", "critical", { url: targetUrl }),
      });
      recommendations.push({
        id: nextId("r"),
        title: "Add viewport meta tag",
        description: 'Insert `<meta name="viewport" content="width=device-width, initial-scale=1">` in the document head.',
        pointsAdded: 20,
        category: "responsive",
      });
    }

    const missingAlt = html.imageCount - html.imagesWithAlt - html.imagesWithEmptyAlt;
    if (missingAlt > 0) {
      const title = "Images missing alt text";
      const severity = missingAlt > 3 ? "critical" : "medium";
      const desc = `${missingAlt} of ${html.imageCount} images lack descriptive alt attributes, hurting screen reader accessibility.`;
      problems.push({
        id: nextId("p"),
        title,
        severity,
        description: desc,
        category: "accessibility",
        details: buildDetailedExplanation("alt_text", title, desc, "accessibility", severity, { url: targetUrl, missingAlt, totalImages: html.imageCount }),
      });
      recommendations.push({
        id: nextId("r"),
        title: "Add descriptive alt attributes to images",
        description: "Add short descriptive alt text to content images and empty alt attributes to decorative elements.",
        pointsAdded: 10,
        category: "accessibility",
      });
    }

    if (html.headings.h1 === 0) {
      const title = "Missing H1 heading";
      const desc = "No H1 element was detected. A single clear H1 improves SEO and document outline.";
      problems.push({
        id: nextId("p"),
        title,
        severity: "medium",
        description: desc,
        category: "seo",
        details: buildDetailedExplanation("h1_missing", title, desc, "seo", "medium", { url: targetUrl }),
      });
      recommendations.push({
        id: nextId("r"),
        title: "Add primary H1 headline",
        description: "Include a single H1 tag near the top of the page summarizing your page content for search engines.",
        pointsAdded: 10,
        category: "seo",
      });
    } else if (html.headings.h1 > 1) {
      const title = "Multiple H1 headings";
      const desc = `Found ${html.headings.h1} H1 tags. Prefer one primary H1 per page for clarity.`;
      problems.push({
        id: nextId("p"),
        title,
        severity: "minor",
        description: desc,
        category: "typography",
        details: buildDetailedExplanation("h1_multiple", title, desc, "typography", "minor", { url: targetUrl }),
      });
      recommendations.push({
        id: nextId("r"),
        title: "Use single primary H1 tag",
        description: "Keep one H1 headline per page and change secondary section titles to H2 or H3 tags.",
        pointsAdded: 5,
        category: "typography",
      });
    }

    if (checks.seoOptimization !== false) {
      if (!html.metaDescription) {
        const title = "Missing meta description";
        const desc = "No meta description tag was found, which limits control over search result snippets.";
        problems.push({
          id: nextId("p"),
          title,
          severity: "medium",
          description: desc,
          category: "seo",
          details: buildDetailedExplanation("meta_description", title, desc, "seo", "medium", { url: targetUrl }),
        });
        recommendations.push({
          id: nextId("r"),
          title: "Add search meta description tag",
          description: "Include a concise 140-160 character meta description tag in document <head>.",
          pointsAdded: 10,
          category: "seo",
        });
      }
      if (html.ogTagsCount === 0) {
        const title = "Missing Open Graph tags";
        const desc = "Open Graph metadata was not detected, so social shares may show generic previews.";
        problems.push({
          id: nextId("p"),
          title,
          severity: "minor",
          description: desc,
          category: "seo",
          details: buildDetailedExplanation("og_tags", title, desc, "seo", "minor", { url: targetUrl }),
        });
        recommendations.push({
          id: nextId("r"),
          title: "Configure Open Graph metadata tags",
          description: "Add og:title, og:image, and og:description meta tags for rich social media share previews.",
          pointsAdded: 8,
          category: "seo",
        });
      }
    }

    if (html.duplicateIds.length > 0) {
      const title = "Duplicate element IDs";
      const desc = `Duplicate IDs detected (${html.duplicateIds.slice(0, 3).join(", ")}). IDs must be unique for accessibility and scripting.`;
      problems.push({
        id: nextId("p"),
        title,
        severity: "medium",
        description: desc,
        category: "code",
        details: buildDetailedExplanation("duplicate_ids", title, desc, "code", "medium", { url: targetUrl, duplicateIds: html.duplicateIds }),
      });
      recommendations.push({
        id: nextId("r"),
        title: "Fix duplicate HTML element IDs",
        description: "Ensure every HTML element on the page has a unique 'id' attribute or convert repetitive IDs to CSS class names.",
        pointsAdded: 10,
        category: "code",
      });
    }

    if (html.missingFormLabels > 0) {
      const title = "Unlabeled form controls";
      const desc = `${html.missingFormLabels} form fields appear without associated labels or aria-label attributes.`;
      problems.push({
        id: nextId("p"),
        title,
        severity: "medium",
        description: desc,
        category: "accessibility",
        details: buildDetailedExplanation("missing_labels", title, desc, "accessibility", "medium", { url: targetUrl, missingLabels: html.missingFormLabels }),
      });
      recommendations.push({
        id: nextId("r"),
        title: "Add labels to form controls",
        description: "Associate every form input field with an explicit <label> tag or an aria-label attribute.",
        pointsAdded: 10,
        category: "accessibility",
      });
    }
  }

  if (checks.performanceWebVitals !== false && pageSpeed && !pageSpeed.error) {
    for (const audit of pageSpeed.audits.slice(0, 10)) {
      const severity = severityFromScore(audit.score);
      const desc = [audit.description, audit.displayValue].filter(Boolean).join(" — ").slice(0, 500);
      const cat = mapPsiCategory(audit.id);
      problems.push({
        id: nextId("p"),
        title: audit.title,
        severity,
        description: desc,
        category: cat,
        details: buildDetailedExplanation(audit.id, audit.title, desc, cat, severity, { url: targetUrl, displayValue: audit.displayValue, auditId: audit.id }),
      });
    }

    const { lcpMs, cls, inpMs } = pageSpeed.coreWebVitals;
    if (lcpMs != null && lcpMs > 2500) {
      const title = "Poor Largest Contentful Paint (LCP)";
      const severity = lcpMs > 4000 ? "critical" : "medium";
      const desc = `LCP measured at ${Math.round(lcpMs)}ms. Google recommends under 2.5s for good user experience.`;
      problems.push({
        id: nextId("p"),
        title,
        severity,
        description: desc,
        category: "performance",
        details: buildDetailedExplanation("lcp", title, desc, "performance", severity, { url: targetUrl, lcpMs }),
      });
    }
    if (cls != null && cls > 0.1) {
      const title = "Layout shift (CLS) above threshold";
      const severity = cls > 0.25 ? "critical" : "medium";
      const desc = `Cumulative Layout Shift is ${cls.toFixed(3)}. Target 0.1 or less.`;
      problems.push({
        id: nextId("p"),
        title,
        severity,
        description: desc,
        category: "performance",
        details: buildDetailedExplanation("cls", title, desc, "performance", severity, { url: targetUrl, cls }),
      });
    }
    if (inpMs != null && inpMs > 200) {
      const title = "Slow interaction response (INP)";
      const severity = inpMs > 500 ? "critical" : "medium";
      const desc = `Interaction to Next Paint is ${Math.round(inpMs)}ms. Good INP is at or below 200ms.`;
      problems.push({
        id: nextId("p"),
        title,
        severity,
        description: desc,
        category: "performance",
        details: buildDetailedExplanation("inp", title, desc, "performance", severity, { url: targetUrl, inpMs }),
      });
    }
  }

  if (browser) {
    if (browser.javascriptErrors.length > 0) {
      const title = "JavaScript runtime errors";
      const desc = browser.javascriptErrors.slice(0, 3).join(" | ");
      problems.push({
        id: nextId("p"),
        title,
        severity: "critical",
        description: desc,
        category: "code",
        details: buildDetailedExplanation("js_errors", title, desc, "code", "critical", { url: targetUrl, jsErrors: browser.javascriptErrors }),
      });
    }
    if (browser.consoleErrors.length > 0) {
      const title = "Console errors detected";
      const desc = browser.consoleErrors.slice(0, 3).join(" | ");
      problems.push({
        id: nextId("p"),
        title,
        severity: "medium",
        description: desc,
        category: "code",
        details: buildDetailedExplanation("console_errors", title, desc, "code", "medium", { url: targetUrl, jsErrors: browser.consoleErrors }),
      });
    }
    if (browser.contrastFailures.length > 0) {
      const title = "Low color contrast";
      const desc = `${browser.contrastFailures.length} text samples failed WCAG AA contrast (4.5:1). Example ratio: ${browser.contrastFailures[0].ratio}:1.`;
      problems.push({
        id: nextId("p"),
        title,
        severity: "medium",
        description: desc,
        category: "color",
        details: buildDetailedExplanation("contrast", title, desc, "color", "medium", { url: targetUrl, contrastRatio: browser.contrastFailures[0].ratio, contrastFailuresCount: browser.contrastFailures.length }),
      });
      recommendations.push({
        id: nextId("r"),
        title: "Fix contrast ratios",
        description: "Increase text/background contrast to at least 4.5:1 for body copy and 3:1 for large text.",
        pointsAdded: 8,
        category: "accessibility",
      });
    }
    if (browser.mobileOverflow) {
      const title = "Horizontal overflow on mobile";
      const desc = "Content wider than the viewport was detected at mobile width, causing horizontal scrolling.";
      problems.push({
        id: nextId("p"),
        title,
        severity: "medium",
        description: desc,
        category: "responsive",
        details: buildDetailedExplanation("mobile_overflow", title, desc, "responsive", "medium", { url: targetUrl }),
      });
    }
  }

  if (crawl.responseTimeMs > 800) {
    const title = "Slow server response (TTFB)";
    const severity = crawl.responseTimeMs > 1500 ? "critical" : "medium";
    const desc = `Initial HTML response took ${crawl.responseTimeMs}ms from the audit runner.`;
    problems.push({
      id: nextId("p"),
      title,
      severity,
      description: desc,
      category: "performance",
      details: buildDetailedExplanation("ttfb", title, desc, "performance", severity, { url: targetUrl, responseTimeMs: crawl.responseTimeMs }),
    });
  }

  if (!crawl.isAccessible) {
    const metrics = {
      codeQuality: 0,
      uiUx: 0,
      responsiveness: 0,
      typography: 0,
      colorTheme: 0,
      accessibility: 0,
      performance: 0,
      seo: 0,
    };
    return {
      score: 0,
      healthMessage: "Website Unreachable",
      metrics,
      problems: problems.slice(0, 20),
      recommendations: [],
    };
  }

  const psi = pageSpeed && !pageSpeed.error ? pageSpeed.categories : null;

  let performance = 0;
  let accessibility = 0;
  let seo = 0;
  let codeQuality = 0;
  let responsiveness = 0;
  let typography = 0;
  let colorTheme = 0;
  let uiUx = 0;
  let score = 0;
  let healthMessage = "PageSpeed Insights is currently unavailable";

  if (psi) {
    // REAL Google PageSpeed Insights & Lighthouse Category Scores
    performance = clamp(psi.performance);
    accessibility = clamp(psi.accessibility);
    seo = clamp(psi.seo);
    codeQuality = clamp(psi.bestPractices);

    const viewportAudit = pageSpeed?.audits?.find((a) => a.id === "viewport");
    responsiveness = clamp(
      viewportAudit
        ? viewportAudit.score === 1
          ? 100
          : viewportAudit.score === 0
          ? 30
          : Math.round((performance + accessibility) / 2)
        : html?.hasViewport
        ? 90
        : 30
    );

    const fontAudit = pageSpeed?.audits?.find((a) => a.id === "font-size");
    typography = clamp(
      fontAudit
        ? fontAudit.score === 1
          ? 100
          : fontAudit.score === 0
          ? 50
          : accessibility
        : html && html.headings.h1 === 1
        ? 90
        : 60
    );

    const contrastAudit = pageSpeed?.audits?.find((a) => a.id === "color-contrast");
    colorTheme = clamp(
      contrastAudit
        ? contrastAudit.score === 1
          ? 100
          : contrastAudit.score === 0
          ? 40
          : accessibility
        : 85
    );

    uiUx = clamp((responsiveness + typography + colorTheme) / 3);
    score = clamp((performance + accessibility + codeQuality + seo) / 4);

    healthMessage =
      score >= 90
        ? "Excellent Website"
        : score >= 75
        ? "Good Overall Health"
        : score >= 55
        ? "Needs Minor Improvements"
        : "Needs Attention";
  } else {
    // Direct Engine Fallback Scoring (used when PageSpeed API is 429 rate-limited or unavailable)
    let perfBase = 88;
    if (crawl.responseTimeMs < 300) perfBase += 6;
    else if (crawl.responseTimeMs > 2000) perfBase -= 30;
    else if (crawl.responseTimeMs > 1000) perfBase -= 18;
    else if (crawl.responseTimeMs > 600) perfBase -= 8;

    if (html && html.scriptTagsCount > 25) perfBase -= 8;
    if (html && html.styleTagsCount > 15) perfBase -= 5;
    performance = clamp(perfBase, 25, 98);

    let a11yBase = 85;
    if (html) {
      if (html.hasViewport) a11yBase += 5; else a11yBase -= 20;
      if (html.imageCount > 0) {
        const altRatio = (html.imagesWithAlt + html.imagesWithEmptyAlt) / html.imageCount;
        if (altRatio >= 0.9) a11yBase += 5;
        else if (altRatio < 0.5) a11yBase -= 20;
      }
      if (html.missingFormLabels > 0) a11yBase -= Math.min(20, html.missingFormLabels * 5);
      if (html.hasLang) a11yBase += 5; else a11yBase -= 10;
      if (html.duplicateIds.length > 0) a11yBase -= 10;
    }
    accessibility = clamp(a11yBase, 30, 98);

    let seoBase = 75;
    if (html) {
      if (html.pageTitle) seoBase += 10; else seoBase -= 20;
      if (html.metaDescription) seoBase += 10; else seoBase -= 15;
      if (html.headings.h1 === 1) seoBase += 8;
      else if (html.headings.h1 === 0) seoBase -= 12;
      if (html.ogTagsCount > 0) seoBase += 5;
      if (html.hasCanonical) seoBase += 5;
    }
    seo = clamp(seoBase, 25, 100);

    let codeBase = 85;
    if (crawl.httpsSupported) codeBase += 8; else codeBase -= 25;
    if (crawl.security.missing.length > 0) {
      codeBase -= Math.min(25, crawl.security.missing.length * 4);
    }
    if (html && html.duplicateIds.length > 0) codeBase -= 10;
    codeQuality = clamp(codeBase, 25, 98);

    responsiveness = clamp(html?.hasViewport ? (browser?.mobileOverflow ? 75 : 92) : 35);
    typography = clamp(html?.headings.h1 === 1 ? 90 : 70);

    let contrastScore = 88;
    if (browser?.contrastFailures?.length) {
      contrastScore = clamp(85 - browser.contrastFailures.length * 5, 40, 95);
    }
    colorTheme = contrastScore;

    uiUx = clamp((responsiveness + typography + colorTheme) / 3);
    score = clamp((performance + accessibility + codeQuality + seo) / 4);

    healthMessage =
      score >= 90
        ? "Excellent Website"
        : score >= 75
        ? "Good Overall Health"
        : score >= 55
        ? "Needs Minor Improvements"
        : "Needs Attention";
  }

  const metrics = {
    codeQuality,
    uiUx,
    responsiveness,
    typography,
    colorTheme,
    accessibility,
    performance,
    seo,
  };

  const finalProblems = problems.slice(0, 20);
  const finalRecommendations = buildRecommendationsFromProblems(finalProblems);

  return {
    score,
    healthMessage,
    metrics,
    problems: finalProblems,
    recommendations: finalRecommendations.slice(0, 15),
  };
}

export function buildRecommendationsFromProblems(problems: ProblemItem[]): RecommendationItem[] {
  const recs: RecommendationItem[] = [];
  const seenTitles = new Set<string>();

  for (const p of problems) {
    const title = p.details?.friendlyTitle || p.title;
    const description = p.details?.bestRecommendation || (p.details?.howToFixSteps?.[0] ? p.details.howToFixSteps[0] : p.description);

    if (seenTitles.has(title)) continue;
    seenTitles.add(title);

    recs.push({
      id: `r_${p.id}`,
      title,
      description,
      pointsAdded: p.severity === "critical" ? 15 : p.severity === "medium" ? 10 : 5,
      category: p.category,
    });
  }

  return recs;
}

export async function enrichReportWithGemini(report: BuiltReport, url: string): Promise<BuiltReport> {
  if (!process.env.GEMINI_API_KEY) return report;

  try {
    const enrichedProblems = await Promise.all(
      report.problems.map(async (problem, idx) => {
        if (idx >= 5) return problem;
        const geminiDetails = await explainAuditWithGemini(
          problem.title,
          problem.description,
          problem.category,
          problem.severity,
          url
        );
        if (geminiDetails) {
          return {
            ...problem,
            details: geminiDetails,
          };
        }
        return problem;
      })
    );

    const finalRecommendations = buildRecommendationsFromProblems(enrichedProblems);

    return {
      ...report,
      problems: enrichedProblems,
      recommendations: finalRecommendations.slice(0, 15),
    };
  } catch (err) {
    console.warn("[BuildReport] Failed to enrich report with Gemini:", err);
    return report;
  }
}
