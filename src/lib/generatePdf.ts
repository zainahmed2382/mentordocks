import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { WebsiteScan, ProblemItem, ScoreMetrics } from "../types";

/**
 * Standardized SaaS report filename:
 * Mentor-Docks-[domain]-Audit-Report.pdf or Mentor-Docks-Website-Audit-Report.pdf
 */
export function generateReportFilename(rawUrl?: string): string {
  if (!rawUrl) return "Mentor-Docks-Website-Audit-Report.pdf";
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    const host = parsed.hostname.replace(/^www\./, "").replace(/[^a-zA-Z0-9.-]/g, "_");
    if (host && host.length > 1) {
      return `Mentor-Docks-${host}-Audit-Report.pdf`;
    }
  } catch {
    // fallback
  }
  return "Mentor-Docks-Website-Audit-Report.pdf";
}

// Mentor Docks Premium Client-Ready Report Palette (Clean High-Contrast SaaS Light Theme)
const PALETTE = {
  bg: "#FFFFFF",
  pageBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  cardBgMuted: "#F1F5F9",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  secondary: "#0EA5E9",
  success: "#059669",
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  textPrimary: "#0F172A",
  textSecondary: "#334155",
  textMuted: "#64748B",
  textSubtle: "#94A3B8",
};

function getScoreColor(score: number): string {
  if (score >= 85) return PALETTE.success;
  if (score >= 70) return PALETTE.primary;
  if (score >= 50) return PALETTE.warning;
  return PALETTE.danger;
}

function getScoreStatus(score: number): string {
  if (score >= 85) return "Optimal Standards";
  if (score >= 70) return "Good Overall Health";
  if (score >= 50) return "Needs Improvement";
  return "Critical Attention";
}

function getCategoryStatus(score: number): string {
  if (score >= 85) return "Optimal";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Work";
  return "Action Needed";
}

function getSeverityBadge(severity: "critical" | "medium" | "minor"): {
  label: string;
  bg: string;
  color: string;
  border: string;
} {
  switch (severity) {
    case "critical":
      return {
        label: "High Priority",
        bg: "#FEF2F2",
        color: "#DC2626",
        border: "#FECACA",
      };
    case "medium":
      return {
        label: "Medium Priority",
        bg: "#FFFBEB",
        color: "#D97706",
        border: "#FDE68A",
      };
    case "minor":
      return {
        label: "Low Priority",
        bg: "#EFF6FF",
        color: "#2563EB",
        border: "#BFDBFE",
      };
  }
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Translates technical audit items into clear, concise, non-technical plain English
 * suitable for clients and executive stakeholders.
 */
function translateToPlainEnglish(problem: ProblemItem): {
  simpleTitle: string;
  simpleExplanation: string;
  howToFix: string;
  categoryLabel: string;
} {
  const d = problem.details;
  const rawTitle = (d?.friendlyTitle || problem.title || "").toLowerCase();
  const rawDesc = (problem.description || "").toLowerCase();

  const categoryMap: Record<string, string> = {
    code: "Security & Code",
    ux: "UI / UX",
    responsive: "Responsiveness",
    color: "Color Theme",
    performance: "Performance",
    accessibility: "Accessibility",
    seo: "SEO",
    typography: "Typography",
  };

  const categoryLabel = categoryMap[problem.category] || "General Health";

  // 1. Meta description missing / short
  if (rawTitle.includes("meta description") || rawTitle.includes("seo description") || rawDesc.includes("meta description")) {
    return {
      simpleTitle: "Missing Search Engine Summary",
      simpleExplanation: "The page lacks a meta description tag that search engines display under your link in search results.",
      howToFix: "Add a concise 150-character meta description summarizing the page to improve search click-through rates.",
      categoryLabel: "SEO",
    };
  }

  // 2. Headings hierarchy / H1 issues
  if (rawTitle.includes("h1") || rawTitle.includes("heading")) {
    return {
      simpleTitle: "Heading Hierarchy Needs Refinement",
      simpleExplanation: "The page is missing a single primary H1 heading or contains competing multiple top-level titles.",
      howToFix: "Ensure each page has one primary H1 heading at the top, followed by structured H2/H3 subheadings.",
      categoryLabel: "Typography",
    };
  }

  // 3. Image Alt Text / Accessibility
  if (rawTitle.includes("alt") || rawTitle.includes("image") || rawDesc.includes("alt text")) {
    return {
      simpleTitle: "Images Missing Alt Text Descriptions",
      simpleExplanation: "Image assets lack descriptive alt attributes, making them inaccessible to screen readers and image search.",
      howToFix: "Add descriptive alt attributes to image tags to ensure accessibility compliance and image SEO indexation.",
      categoryLabel: "Accessibility",
    };
  }

  // 4. Color Contrast / Readability
  if (rawTitle.includes("contrast") || rawTitle.includes("color") || rawTitle.includes("readability")) {
    return {
      simpleTitle: "Low Text & Background Contrast",
      simpleExplanation: "Certain text colors do not meet WCAG AA contrast standards (minimum 4.5:1 ratio), reducing legibility.",
      howToFix: "Darken foreground text or adjust container backgrounds to provide crisp, readable contrast across all displays.",
      categoryLabel: "Color Theme",
    };
  }

  // 5. Mobile Viewport / Responsiveness
  if (rawTitle.includes("viewport") || rawTitle.includes("responsive") || rawTitle.includes("mobile")) {
    return {
      simpleTitle: "Mobile Viewport Optimization",
      simpleExplanation: "Layout containers or tap targets need adjustments for optimal smartphone and tablet viewing.",
      howToFix: "Declare standard responsive viewport meta tags and ensure interactive elements have at least 44px touch targets.",
      categoryLabel: "Responsiveness",
    };
  }

  // 6. Performance / Render Blocking / Speed
  if (rawTitle.includes("render-blocking") || rawTitle.includes("speed") || rawTitle.includes("load") || rawTitle.includes("fcp") || rawTitle.includes("ttfb") || rawTitle.includes("lcp")) {
    return {
      simpleTitle: "Page Speed & Asset Delivery",
      simpleExplanation: "Heavy assets or render-blocking scripts increase initial loading time and bounce rates.",
      howToFix: "Compress images into WebP/AVIF formats and defer non-critical JavaScript to speed up first contentful paint.",
      categoryLabel: "Performance",
    };
  }

  // 7. HTTPS / Security
  if (rawTitle.includes("https") || rawTitle.includes("security") || rawTitle.includes("ssl") || rawTitle.includes("headers")) {
    return {
      simpleTitle: "Connection Security & Encryption",
      simpleExplanation: "Security headers or full HTTPS redirection should be enforced to prevent browser warnings.",
      howToFix: "Enable an SSL/TLS certificate and configure HTTP security response headers (HSTS, X-Content-Type-Options).",
      categoryLabel: "Security & Code",
    };
  }

  // 8. Missing Labels / Forms
  if (rawTitle.includes("label") || rawTitle.includes("form") || rawDesc.includes("input")) {
    return {
      simpleTitle: "Form Inputs Missing Accessible Labels",
      simpleExplanation: "Form controls do not have explicitly associated label elements for assistive technologies.",
      howToFix: "Add <label for='...'> tags or aria-label attributes to all interactive form controls.",
      categoryLabel: "Accessibility",
    };
  }

  // 9. Duplicate IDs
  if (rawTitle.includes("duplicate id") || rawTitle.includes("id")) {
    return {
      simpleTitle: "Duplicate Element Identifiers",
      simpleExplanation: "Multiple HTML elements share the same ID attribute, which can disrupt scripts and accessibility trees.",
      howToFix: "Ensure all HTML id attributes are unique across the entire DOM tree.",
      categoryLabel: "Security & Code",
    };
  }

  // Fallback
  const fallbackExplanation = d?.simpleProblem || problem.description || "An optimization opportunity was detected during the automated audit.";
  const fallbackFix = d?.bestRecommendation || (d?.howToFixSteps && d.howToFixSteps[0]) || "Review the technical markup and apply standard web best practices.";

  return {
    simpleTitle: d?.friendlyTitle || problem.title,
    simpleExplanation: fallbackExplanation.length > 140 ? fallbackExplanation.slice(0, 137) + "..." : fallbackExplanation,
    howToFix: fallbackFix.length > 140 ? fallbackFix.slice(0, 137) + "..." : fallbackFix,
    categoryLabel,
  };
}

async function getLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch("/logo.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Derives authentic positive findings based on actual audit scores and passed checks.
 */
function getPositiveResults(scan: WebsiteScan, metrics: ScoreMetrics): Array<{ title: string; desc: string }> {
  const positives: Array<{ title: string; desc: string }> = [];
  const probTitles = (scan.problems || []).map((p) => (p.title + " " + p.id).toLowerCase());

  const hasProb = (term: string) => probTitles.some((t) => t.includes(term.toLowerCase()));

  // 1. HTTPS / Security
  if (!hasProb("https") && !hasProb("unreachable") && metrics.codeQuality >= 60) {
    positives.push({
      title: "Secure HTTPS Encryption",
      desc: "SSL/TLS encryption is active, ensuring protected communication.",
    });
  }

  // 2. Performance
  if (metrics.performance >= 75) {
    positives.push({
      title: "Optimized Page Speed",
      desc: `Strong performance score (${metrics.performance}/100) ensures fast visitor experience.`,
    });
  } else if (!hasProb("ttfb")) {
    positives.push({
      title: "Fast Initial Server Response",
      desc: "Initial server response time (TTFB) is well within target benchmarks.",
    });
  }

  // 3. SEO
  if (metrics.seo >= 75) {
    positives.push({
      title: "Search Engine Optimization",
      desc: `High SEO rating (${metrics.seo}/100) supports search engine discoverability.`,
    });
  } else if (!hasProb("h1_missing") && !hasProb("title")) {
    positives.push({
      title: "Structured Heading Outline",
      desc: "Primary heading outline is established for content structure.",
    });
  }

  // 4. Accessibility
  if (metrics.accessibility >= 75) {
    positives.push({
      title: "Strong Accessibility Standards",
      desc: `High accessibility rating (${metrics.accessibility}/100) supports inclusive navigation.`,
    });
  } else if (!hasProb("alt_text")) {
    positives.push({
      title: "Image Descriptions Present",
      desc: "Visual elements include proper descriptive tags for screen readers.",
    });
  }

  // 5. Responsiveness
  if (metrics.responsiveness >= 75 && !hasProb("mobile_overflow")) {
    positives.push({
      title: "Mobile Responsive Layout",
      desc: "Page elements scale smoothly without horizontal viewport overflow.",
    });
  }

  // 6. Color & Contrast
  if (metrics.colorTheme >= 80 && !hasProb("contrast")) {
    positives.push({
      title: "Accessible Color Contrast",
      desc: "Foreground text and background combinations meet WCAG contrast guidelines.",
    });
  }

  // Ensure at least 2-3 genuine results
  if (positives.length < 2 && scan.score >= 50) {
    positives.push({
      title: "Live Domain Connectivity",
      desc: "Website is publicly accessible and responding cleanly to web clients.",
    });
  }

  return positives.slice(0, 4);
}

/**
 * Downloads a premium, clean, professional ONE-PAGE website audit report.
 * Guaranteed to fit perfectly on exactly 1 page (A4 format).
 */
export async function downloadPdfReport(scan: WebsiteScan): Promise<void> {
  const metrics: ScoreMetrics = scan.metrics || {
    codeQuality: 0,
    uiUx: 0,
    responsiveness: 0,
    typography: 0,
    colorTheme: 0,
    accessibility: 0,
    performance: 0,
    seo: 0,
  };

  const overallScore = Math.max(0, Math.min(100, Math.round(scan.score || 0)));
  const overallColor = getScoreColor(overallScore);
  const overallStatus = getScoreStatus(overallScore);

  const formattedDate = scan.date || new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const reportId = `MD-${Math.abs((scan.url || "site").split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 17)).toString(16).toUpperCase().padStart(6, "0").slice(0, 8)}`;

  // Sort problems: Critical -> Medium -> Minor
  const rankedProblems = [...(scan.problems || [])].sort((a, b) => {
    const rank = { critical: 3, medium: 2, minor: 1 };
    return rank[b.severity] - rank[a.severity];
  });

  const criticalCount = rankedProblems.filter((p) => p.severity === "critical").length;
  const mediumCount = rankedProblems.filter((p) => p.severity === "medium").length;
  const minorCount = rankedProblems.filter((p) => p.severity === "minor").length;

  // Select top findings to fit cleanly (max 3)
  const topFindings = rankedProblems.slice(0, 3);
  const positiveResults = getPositiveResults(scan, metrics);

  const logoBase64 = await getLogoBase64();

  // Create isolated off-screen mounting container
  const mountHost = document.createElement("div");
  mountHost.id = "pdf-render-host";
  mountHost.style.position = "fixed";
  mountHost.style.left = "-9999px";
  mountHost.style.top = "0px";
  mountHost.style.width = "794px";
  mountHost.style.zIndex = "-99999";
  mountHost.style.opacity = "0";
  mountHost.style.pointerEvents = "none";
  mountHost.style.background = "#FFFFFF";
  document.body.appendChild(mountHost);

  // Logo SVG or Image HTML
  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="Mentor Docks" style="height:26px;width:26px;object-fit:contain;border-radius:6px;" />`
    : `<div style="width:26px;height:26px;border-radius:6px;background:linear-gradient(135deg, ${PALETTE.primary}, #818CF8);display:flex;align-items:center;justify-content:center;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
       </div>`;

  const pageContainer = document.createElement("div");
  pageContainer.style.width = "794px";
  pageContainer.style.height = "1123px";
  pageContainer.style.maxHeight = "1123px";
  pageContainer.style.background = "#FFFFFF";
  pageContainer.style.color = PALETTE.textPrimary;
  pageContainer.style.padding = "24px 28px";
  pageContainer.style.boxSizing = "border-box";
  pageContainer.style.position = "relative";
  pageContainer.style.overflow = "hidden";
  pageContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  pageContainer.style.display = "flex";
  pageContainer.style.flexDirection = "column";
  pageContainer.style.justifyContent = "space-between";

  // 4 Primary categories
  const primaryCategories = [
    { label: "Performance", score: metrics.performance, icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14V8"/><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m20.66 17.66-1.41-1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>` },
    { label: "SEO", score: metrics.seo, icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>` },
    { label: "Security", score: metrics.codeQuality, icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
    { label: "Accessibility", score: metrics.accessibility, icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="4" r="2"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/></svg>` },
  ];

  // 4 Secondary categories
  const secondaryCategories = [
    { label: "UI / UX", score: metrics.uiUx },
    { label: "Responsiveness", score: metrics.responsiveness },
    { label: "Typography", score: metrics.typography },
    { label: "Color Theme", score: metrics.colorTheme },
  ];

  pageContainer.innerHTML = `
    <!-- Top Decorative Accent -->
    <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, #4F46E5 0%, #06B6D4 50%, #10B981 100%);"></div>

    <!-- 1. HEADER SECTION -->
    <div style="display:flex; flex-direction:column; gap:8px; padding-bottom:10px; border-bottom:1px solid ${PALETTE.border}; flex-shrink:0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          ${logoHtml}
          <div>
            <div style="font-size:14px; font-weight:800; letter-spacing:-0.01em; color:${PALETTE.textPrimary}; line-height:1.1;">MENTOR DOCKS</div>
            <div style="font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${PALETTE.textMuted};">Website Intelligence & Audit Platform</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:${PALETTE.primaryLight}; color:${PALETTE.primary}; font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; padding:3px 9px; border-radius:99px; border:1px solid #C7D2FE;">
            Website Audit Report
          </div>
          <div style="text-align:right; font-size:8px; color:${PALETTE.textMuted}; font-family:monospace; line-height:1.3;">
            <div>ID: <strong style="color:${PALETTE.textSecondary};">${reportId}</strong></div>
            <div>${formattedDate}</div>
          </div>
        </div>
      </div>

      <!-- Target URL Pill Banner -->
      <div style="background:${PALETTE.cardBgMuted}; border:1px solid ${PALETTE.border}; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:6px; min-width:0; flex:1;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${PALETTE.primary}" stroke-width="2.5" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span style="font-size:8px; font-weight:700; color:${PALETTE.textMuted}; text-transform:uppercase; letter-spacing:0.04em; flex-shrink:0;">Target:</span>
          <span style="font-family:monospace, 'Courier New'; font-size:9.5px; font-weight:700; color:${PALETTE.textPrimary}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${escapeHtml(scan.url || "Audited Website")}
          </span>
        </div>
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0; font-size:8px; font-weight:700; color:${PALETTE.success};">
          <span style="width:6px; height:6px; border-radius:50%; background:${PALETTE.success}; display:inline-block;"></span>
          Audit Complete
        </div>
      </div>
    </div>

    <!-- MAIN BODY FLOW -->
    <div style="display:flex; flex-direction:column; gap:10px; flex:1; justify-content:flex-start; margin-top:10px;">

      <!-- 2. OVERALL SCORE & EXECUTIVE SUMMARY -->
      <div style="background:${PALETTE.cardBg}; border:1px solid ${PALETTE.border}; border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; gap:14px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <!-- Overall Score Display -->
        <div style="background:${PALETTE.pageBg}; border:1px solid ${PALETTE.border}; border-radius:8px; padding:8px 16px; text-align:center; min-width:130px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0;">
          <div style="font-size:7.5px; font-weight:800; text-transform:uppercase; color:${PALETTE.textMuted}; letter-spacing:0.06em; margin-bottom:1px;">
            Overall Website Score
          </div>
          <div style="display:flex; align-items:baseline; justify-content:center; gap:2px;">
            <span style="font-size:32px; font-weight:900; font-family:monospace; line-height:1; color:${overallColor};">
              ${overallScore}
            </span>
            <span style="font-size:12px; font-weight:700; font-family:monospace; color:${PALETTE.textSubtle};">
              / 100
            </span>
          </div>
          <div style="margin-top:4px; padding:2px 8px; border-radius:99px; font-size:7.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; background:${overallColor}18; color:${overallColor}; border:1px solid ${overallColor}35; white-space:nowrap;">
            ${overallStatus}
          </div>
        </div>

        <!-- Executive Summary Text & Diagnostic Quick Stats -->
        <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:space-between; height:100%; gap:6px;">
          <div>
            <div style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:${PALETTE.textMuted}; margin-bottom:2px;">
              Executive Summary
            </div>
            <div style="font-size:8.5px; color:${PALETTE.textSecondary}; line-height:1.4;">
              ${escapeHtml(
                scan.healthMessage ||
                (overallScore >= 85
                  ? "This website demonstrates excellent web health across speed, search optimization, security, and accessibility standards with minimal technical debt."
                  : overallScore >= 70
                  ? "This website shows a solid operational foundation with a few prioritized technical optimizations that will noticeably boost user experience and search rankings."
                  : "Targeted improvements are recommended across key categories to resolve performance bottlenecks, accessibility barriers, and search discoverability.")
              )}
            </div>
          </div>

          <!-- Mini Issue Counter Badges -->
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; margin-top:2px;">
            <div style="background:${criticalCount > 0 ? PALETTE.dangerBg : PALETTE.cardBgMuted}; border:1px solid ${criticalCount > 0 ? PALETTE.dangerBorder : PALETTE.border}; border-radius:5px; padding:4px 6px; text-align:center;">
              <div style="font-size:12px; font-weight:800; font-family:monospace; color:${criticalCount > 0 ? PALETTE.danger : PALETTE.textMuted}; line-height:1;">${criticalCount}</div>
              <div style="font-size:6.5px; font-weight:700; text-transform:uppercase; color:${criticalCount > 0 ? PALETTE.danger : PALETTE.textMuted}; margin-top:1px;">Critical</div>
            </div>
            <div style="background:${mediumCount > 0 ? PALETTE.warningBg : PALETTE.cardBgMuted}; border:1px solid ${mediumCount > 0 ? PALETTE.warningBorder : PALETTE.border}; border-radius:5px; padding:4px 6px; text-align:center;">
              <div style="font-size:12px; font-weight:800; font-family:monospace; color:${mediumCount > 0 ? PALETTE.warning : PALETTE.textMuted}; line-height:1;">${mediumCount}</div>
              <div style="font-size:6.5px; font-weight:700; text-transform:uppercase; color:${mediumCount > 0 ? PALETTE.warning : PALETTE.textMuted}; margin-top:1px;">Medium</div>
            </div>
            <div style="background:${PALETTE.cardBgMuted}; border:1px solid ${PALETTE.border}; border-radius:5px; padding:4px 6px; text-align:center;">
              <div style="font-size:12px; font-weight:800; font-family:monospace; color:${PALETTE.primary}; line-height:1;">${minorCount}</div>
              <div style="font-size:6.5px; font-weight:700; text-transform:uppercase; color:${PALETTE.textMuted}; margin-top:1px;">Minor</div>
            </div>
            <div style="background:${PALETTE.successBg}; border:1px solid ${PALETTE.successBorder}; border-radius:5px; padding:4px 6px; text-align:center;">
              <div style="font-size:12px; font-weight:800; font-family:monospace; color:${PALETTE.success}; line-height:1;">${positiveResults.length}</div>
              <div style="font-size:6.5px; font-weight:700; text-transform:uppercase; color:${PALETTE.success}; margin-top:1px;">Strengths</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. CATEGORY BENCHMARK SCORES -->
      <div style="background:${PALETTE.cardBg}; border:1px solid ${PALETTE.border}; border-radius:8px; padding:10px 12px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="font-size:8.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:${PALETTE.textMuted}; display:flex; align-items:center; gap:5px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${PALETTE.primary}" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            Audit Category Scores
          </div>
          <div style="font-size:7px; font-weight:700; color:${PALETTE.textSubtle}; text-transform:uppercase;">
            Evaluated Against Modern Standards
          </div>
        </div>

        <!-- 4 Primary Pillar Cards Row -->
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:8px;">
          ${primaryCategories
            .map((cat) => {
              const cColor = getScoreColor(cat.score);
              const cStatus = getCategoryStatus(cat.score);
              return `
              <div style="background:${PALETTE.pageBg}; border:1px solid ${PALETTE.border}; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size:8.5px; font-weight:800; color:${PALETTE.textPrimary};">${escapeHtml(cat.label)}</span>
                  <div style="color:${PALETTE.textMuted}; display:flex; align-items:center;">${cat.icon}</div>
                </div>
                <div style="display:flex; align-items:baseline; justify-content:space-between; margin-bottom:3px;">
                  <span style="font-size:16px; font-weight:900; font-family:monospace; color:${cColor}; line-height:1;">${cat.score}</span>
                  <span style="font-size:6.5px; font-weight:800; text-transform:uppercase; padding:1px 5px; border-radius:3px; background:${cColor}15; color:${cColor}; border:1px solid ${cColor}30;">
                    ${cStatus}
                  </span>
                </div>
                <div style="background:${PALETTE.border}; height:3.5px; border-radius:99px; overflow:hidden;">
                  <div style="height:100%; border-radius:99px; background:${cColor}; width:${Math.max(6, cat.score)}%;"></div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- Secondary Categories Sub-Row -->
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; background:${PALETTE.cardBgMuted}; border:1px solid ${PALETTE.border}; border-radius:6px; padding:5px 8px;">
          ${secondaryCategories
            .map((cat) => {
              const cColor = getScoreColor(cat.score);
              return `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0 4px;">
                <span style="font-size:7.5px; font-weight:700; color:${PALETTE.textMuted};">${escapeHtml(cat.label)}:</span>
                <span style="font-size:8.5px; font-weight:800; font-family:monospace; color:${cColor};">${cat.score}/100</span>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>

      <!-- 4. KEY FINDINGS (PRIORITIZED ISSUES) -->
      <div style="background:${PALETTE.cardBg}; border:1px solid ${PALETTE.border}; border-radius:8px; padding:10px 12px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="font-size:8.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:${PALETTE.textMuted}; display:flex; align-items:center; gap:5px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${PALETTE.warning}" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Key Findings
          </div>
          <div style="font-size:7px; font-weight:700; color:${PALETTE.textSubtle}; text-transform:uppercase;">
            ${rankedProblems.length} Total Issue(s) Detected
          </div>
        </div>

        ${topFindings.length > 0
          ? `
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${topFindings
              .map((prob, idx) => {
                const plain = translateToPlainEnglish(prob);
                const badge = getSeverityBadge(prob.severity);

                return `
                <div style="background:${PALETTE.pageBg}; border:1px solid ${PALETTE.border}; border-radius:6px; padding:7px 9px;">
                  <!-- Top issue row: Title & Badges -->
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
                    <div style="display:flex; align-items:center; gap:5px; min-width:0; flex:1;">
                      <span style="font-size:8px; font-weight:900; font-family:monospace; color:${PALETTE.textMuted};">#${idx + 1}</span>
                      <span style="font-size:9px; font-weight:800; color:${PALETTE.textPrimary}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${escapeHtml(plain.simpleTitle)}
                      </span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                      <span style="font-size:6.5px; font-weight:700; color:${PALETTE.textMuted}; background:#FFFFFF; padding:1px 5px; border-radius:3px; border:1px solid ${PALETTE.border};">
                        ${escapeHtml(plain.categoryLabel)}
                      </span>
                      <span style="font-size:6.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; padding:1px 5px; border-radius:3px; background:${badge.bg}; color:${badge.color}; border:1px solid ${badge.border};">
                        ${badge.label}
                      </span>
                    </div>
                  </div>

                  <!-- 2-Column Details: Explanation & Action -->
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
                    <div style="background:#FFFFFF; border:1px solid ${PALETTE.border}; border-radius:4px; padding:4px 6px;">
                      <span style="display:block; font-size:6.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.03em; color:${PALETTE.danger}; margin-bottom:1px;">
                        Issue:
                      </span>
                      <span style="font-size:7.5px; color:${PALETTE.textSecondary}; line-height:1.35; display:block;">
                        ${escapeHtml(plain.simpleExplanation)}
                      </span>
                    </div>
                    <div style="background:#FFFFFF; border:1px solid ${PALETTE.border}; border-radius:4px; padding:4px 6px;">
                      <span style="display:block; font-size:6.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.03em; color:${PALETTE.success}; margin-bottom:1px;">
                        Recommended Action:
                      </span>
                      <span style="font-size:7.5px; color:${PALETTE.textSecondary}; line-height:1.35; display:block;">
                        ${escapeHtml(plain.howToFix)}
                      </span>
                    </div>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        `
          : `
          <div style="background:${PALETTE.successBg}; border:1px solid ${PALETTE.successBorder}; border-radius:6px; padding:14px 16px; text-align:center;">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:3px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${PALETTE.success}" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span style="font-size:9.5px; font-weight:800; color:${PALETTE.success};">No Critical or High-Severity Issues Detected</span>
            </div>
            <div style="font-size:8px; color:${PALETTE.textSecondary}; line-height:1.35;">
              The audited website passed core technical standards for code quality, responsiveness, and search visibility cleanly.
            </div>
          </div>
        `}
      </div>

      <!-- 5. WHAT'S GOING WELL (POSITIVE FINDINGS) -->
      <div style="background:${PALETTE.cardBg}; border:1px solid ${PALETTE.border}; border-radius:8px; padding:10px 12px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="font-size:8.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:${PALETTE.textMuted}; display:flex; align-items:center; gap:5px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${PALETTE.success}" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            What’s Going Well
          </div>
          <div style="font-size:7px; font-weight:700; color:${PALETTE.success}; text-transform:uppercase;">
            Verified Strengths
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
          ${positiveResults
            .map((pos) => `
            <div style="background:${PALETTE.successBg}; border:1px solid ${PALETTE.successBorder}; border-radius:6px; padding:6px 8px; display:flex; align-items:flex-start; gap:6px;">
              <div style="color:${PALETTE.success}; margin-top:1px; flex-shrink:0;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style="min-width:0;">
                <div style="font-size:8px; font-weight:800; color:${PALETTE.textPrimary}; line-height:1.2; margin-bottom:1px;">
                  ${escapeHtml(pos.title)}
                </div>
                <div style="font-size:7px; color:${PALETTE.textSecondary}; line-height:1.3;">
                  ${escapeHtml(pos.desc)}
                </div>
              </div>
            </div>
          `)
            .join("")}
        </div>
      </div>

    </div>

    <!-- 6. FOOTER SECTION -->
    <div style="border-top:1px solid ${PALETTE.border}; padding-top:8px; display:flex; justify-content:space-between; align-items:center; font-size:7.5px; color:${PALETTE.textMuted}; flex-shrink:0; margin-top:8px;">
      <div style="display:flex; align-items:center; gap:4px;">
        <span>Generated by <strong style="color:${PALETTE.textPrimary};">Mentor Docks</strong></span>
        <span>•</span>
        <span>Professional Website Intelligence & Audit Platform</span>
      </div>
      <div style="font-family:monospace; color:${PALETTE.textSecondary}; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${escapeHtml(scan.url || "")}
      </div>
      <div>
        Page 1 of 1 • 2026
      </div>
    </div>
  `;

  mountHost.appendChild(pageContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    // Small delay to ensure styles and layouts are resolved
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(pageContainer, {
      scale: 2, // High resolution crisp output
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#FFFFFF",
      windowWidth: 794,
      windowHeight: 1123,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    // 210mm x 297mm standard A4 portrait
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");

    const filename = generateReportFilename(scan.url);
    pdf.save(filename);
  } finally {
    if (mountHost.parentNode) {
      mountHost.parentNode.removeChild(mountHost);
    }
  }
}
