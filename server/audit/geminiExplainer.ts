import { GoogleGenAI, Type } from "@google/genai";
import type { DetailedAuditExplanation } from "../../src/types";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("[GeminiExplainer] Failed to initialize Gemini client:", err);
      aiClient = null;
    }
  }
  return aiClient;
}

/**
 * Validates that the AI generated explanation directly solves the exact detected title.
 * Prevents generic cross-contamination (e.g., image compression or script deferral recommended for duplicate IDs).
 */
export function isExplanationRelevant(title: string, category: string, explanation: DetailedAuditExplanation): boolean {
  if (!explanation || !explanation.bestRecommendation || !explanation.simpleProblem) return false;

  const titleLower = title.toLowerCase();
  const recLower = explanation.bestRecommendation.toLowerCase();
  const stepsLower = (explanation.howToFixSteps || []).join(" ").toLowerCase();
  const problemLower = explanation.simpleProblem.toLowerCase();

  // Rule 1: Duplicate IDs
  if (titleLower.includes("duplicate") || titleLower.includes("id")) {
    const mentionsId = recLower.includes("id") || recLower.includes("unique") || recLower.includes("class") || problemLower.includes("id");
    if (!mentionsId) return false;
    if (recLower.includes("compress") || recLower.includes("defer") || recLower.includes("script") || recLower.includes("cache") || recLower.includes("image")) {
      return false;
    }
  }

  // Rule 2: Security headers / HTTPS
  if (titleLower.includes("security") || titleLower.includes("header") || titleLower.includes("https")) {
    if (recLower.includes("compress") || recLower.includes("image") || recLower.includes("defer script")) {
      return false;
    }
  }

  // Rule 3: Alt text
  if (titleLower.includes("alt") || titleLower.includes("image description")) {
    const mentionsAlt = recLower.includes("alt") || recLower.includes("image") || recLower.includes("description") || recLower.includes("photo");
    if (!mentionsAlt) return false;
  }

  // Rule 4: Form labels
  if (titleLower.includes("label") || titleLower.includes("unlabeled")) {
    const mentionsLabel = recLower.includes("label") || recLower.includes("aria") || recLower.includes("input") || problemLower.includes("form");
    if (!mentionsLabel) return false;
  }

  // Rule 5: Reject generic image compression or script deferral unless the title/category is specifically image/performance related
  if (recLower.includes("compress") || recLower.includes("squoosh") || recLower.includes("tinypng") || recLower.includes("webp") || recLower.includes("avif")) {
    if (!titleLower.includes("image") && !titleLower.includes("picture") && !titleLower.includes("lcp") && !titleLower.includes("asset") && category !== "performance") {
      return false;
    }
  }

  if (recLower.includes("defer script") || recLower.includes("unused javascript") || recLower.includes("render-blocking")) {
    if (!titleLower.includes("script") && !titleLower.includes("js") && !titleLower.includes("javascript") && !titleLower.includes("render-blocking") && !titleLower.includes("blocking") && category !== "performance" && category !== "code") {
      return false;
    }
  }

  return true;
}

export async function explainAuditWithGemini(
  title: string,
  description: string,
  category: string,
  severity: "critical" | "medium" | "minor",
  url: string,
  displayValue?: string
): Promise<DetailedAuditExplanation | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const domain = url.replace(/^https?:\/\//i, "").replace(/\/.*$/, "") || url;

  const prompt = `You are an expert web auditor generating a 100% SPECIFIC explanation and fix recommendation for a real website audit finding on website: "${domain}".

Exact Detected Finding:
- Title: "${title}"
- Category: "${category}"
- Severity: "${severity}"
- Audit Details: "${description}"
- Metric Display Value: "${displayValue || ""}"

STRICT MANDATORY RULES FOR GENERATION:
1. Every single word in simpleProblem, howToFixSteps, and bestRecommendation MUST be 100% SPECIFIC TO THE EXACT DETECTED ITEM: "${title}".
2. ABSOLUTELY NO GENERIC OPTIMIZATION ADVICE! Do NOT recommend image compression, script deferral, or caching UNLESS "${title}" is specifically about images, script deferral, or caching.
3. Specific issue guidelines:
   - If Title is "Duplicate element IDs" or mentions "duplicate": explain that multiple HTML elements share the same 'id' attribute, explain why IDs must be unique, and give a recommendation to make every ID unique or convert repetitive IDs to CSS class names. NEVER mention images or scripts!
   - If Title is about Security Headers: explain HTTP security headers (CSP, HSTS, X-Frame-Options) specifically.
   - If Title is about Missing Alt Text: explain image alt text specifically.
   - If Title is about Missing Meta Description: explain meta descriptions specifically.
   - If Title is about Form Labels: explain form <label> tags and aria-label attributes specifically.
   - If Title is about Color Contrast: explain WCAG AA text contrast ratios specifically.
4. "simpleProblem" MUST describe the EXACT issue "${title}" found on "${domain}" in 1-2 plain sentences.
5. "howToFixSteps" MUST give 3-4 simple action steps solving THAT EXACT issue.
6. "bestRecommendation" MUST be a single clear sentence offering the best fix specifically for THAT EXACT issue.
7. Output MUST be valid JSON conforming to the schema.`;

  const fetchPromise = (async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              friendlyTitle: { type: Type.STRING, description: "Simple, friendly title" },
              simpleProblem: { type: Type.STRING, description: "1-2 sentence problem description for non-technical user" },
              whyItHappened: { type: Type.STRING, description: "Why this issue happened on this site" },
              whyItMattersBullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 bullet points explaining business impact",
              },
              howToFixSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 simple action steps to fix it",
              },
              bestRecommendation: { type: Type.STRING, description: "Best single recommendation sentence" },
              expectedImprovementBullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 benefits after fixing",
              },
              priority: { type: Type.STRING, description: "Critical | High | Medium | Low" },
              difficulty: { type: Type.STRING, description: "Easy | Medium | Hard" },
              timeRequired: { type: Type.STRING, description: "Estimated time to fix (e.g. 10 minutes)" },
              whereIsIssue: { type: Type.STRING, description: "Where on the site this issue lives" },
              readyToUseExample: { type: Type.STRING, description: "Clear example of what to change" },
              codeSnippet: { type: Type.STRING, description: "Clean code snippet or setting example" },
            },
            required: [
              "friendlyTitle",
              "simpleProblem",
              "whyItHappened",
              "whyItMattersBullets",
              "howToFixSteps",
              "bestRecommendation",
              "expectedImprovementBullets",
              "priority",
              "difficulty",
              "timeRequired",
              "whereIsIssue",
              "readyToUseExample",
              "codeSnippet",
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim()) as DetailedAuditExplanation;
        if (isExplanationRelevant(title, category, parsed)) {
          return parsed;
        } else {
          console.warn(`[GeminiExplainer] Gemini generated irrelevant recommendation for "${title}", rejecting and falling back to deterministic builder.`);
          return null;
        }
      }
    } catch (err: any) {
      return null;
    }
    return null;
  })();

  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 7000));

  return Promise.race([fetchPromise, timeoutPromise]);
}
