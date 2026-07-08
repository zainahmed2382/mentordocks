import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { prisma } from './_prisma.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Helper functions
interface HTMLDiagnostics {
  title: string;
  metaDescription: string;
  hasViewport: boolean;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  scriptCount: number;
  stylesheetCount: number;
  inlineStylesCount: number;
  hasMainLandmark: boolean;
  hasNavLandmark: boolean;
  hasFooterLandmark: boolean;
  hasSkipLink: boolean;
  formInputCount: number;
  formInputWithLabelId: number;
  totalHtmlSizeKb: number;
}

function analyzeHTML(html: string): HTMLDiagnostics {
  const result: HTMLDiagnostics = {
    title: "",
    metaDescription: "",
    hasViewport: false,
    h1Count: 0,
    h2Count: 0,
    h3Count: 0,
    h4Count: 0,
    totalImages: 0,
    imagesWithAlt: 0,
    imagesWithoutAlt: 0,
    scriptCount: 0,
    stylesheetCount: 0,
    inlineStylesCount: 0,
    hasMainLandmark: false,
    hasNavLandmark: false,
    hasFooterLandmark: false,
    hasSkipLink: false,
    formInputCount: 0,
    formInputWithLabelId: 0,
    totalHtmlSizeKb: parseFloat((html.length / 1024).toFixed(2)),
  };

  try {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    }

    const metaMatches = html.matchAll(/<meta\s+([^>]*?)>/gi);
    for (const match of metaMatches) {
      const attributes = match[1];
      if (/name\s*=\s*["']description["']/i.test(attributes)) {
        const contentMatch = attributes.match(/content\s*=\s*["']([\s\S]*?)["']/i);
        if (contentMatch) {
          result.metaDescription = contentMatch[1].trim();
        }
      }
      if (/name\s*=\s*["']viewport["']/i.test(attributes)) {
        result.hasViewport = true;
      }
    }

    if (!result.metaDescription) {
      const descriptionMatch = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) || 
                               html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      if (descriptionMatch) {
        result.metaDescription = descriptionMatch[1].trim();
      }
    }

    result.h1Count = (html.match(/<h1/gi) || []).length;
    result.h2Count = (html.match(/<h2/gi) || []).length;
    result.h3Count = (html.match(/<h3/gi) || []).length;
    result.h4Count = (html.match(/<h4/gi) || []).length;

    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    result.totalImages = imgMatches.length;
    for (const imgTag of imgMatches) {
      if (/alt\s*=\s*["']/i.test(imgTag)) {
        result.imagesWithAlt++;
      } else {
        result.imagesWithoutAlt++;
      }
    }

    result.scriptCount = (html.match(/<script/gi) || []).length;
    result.stylesheetCount = (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;
    result.inlineStylesCount = (html.match(/<style/gi) || []).length;

    result.hasMainLandmark = /<(main|div)[^>]*\bid=["']main["']|role=["']main["']/i.test(html) || /<main/i.test(html);
    result.hasNavLandmark = /<(nav|div)[^>]*\bid=["']nav["']|role=["']navigation["']/i.test(html) || /<nav/i.test(html);
    result.hasFooterLandmark = /<(footer|div)[^>]*\bid=["']footer["']|role=["']contentinfo["']/i.test(html) || /<footer/i.test(html);

    result.hasSkipLink = /href=["']#main["']/i.test(html) || /href=["']#content["']/i.test(html) || /skip\s*to\s*main/i.test(html);

    const inputMatches = html.match(/<input[^>]*>|<select[^>]*>|<textarea[^>]*>/gi) || [];
    result.formInputCount = inputMatches.length;
    for (const inputTag of inputMatches) {
      if (/id\s*=\s*["']([^"']+)["']/i.test(inputTag)) {
        const idMatch = inputTag.match(/id\s*=\s*["']([^"']+)["']/i);
        if (idMatch && idMatch[1]) {
          const inputId = idMatch[1];
          const labelRegex = new RegExp(`for\\s*=\\s*["']${inputId}["']`, "i");
          if (labelRegex.test(html)) {
            result.formInputWithLabelId++;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error analyzing HTML stats locally:", error);
  }

  return result;
}

interface AuditIssue {
  category: string;
  severity: "Low" | "Medium" | "High";
  problem: string;
  reason: string;
  recommendation: string;
  example_fix?: string;
}

interface AuditReport {
  website_url: string;
  overall_score: number;
  code_quality_score: number;
  design_score: number;
  responsiveness_score: number;
  typography_score: number;
  color_theme_score: number;
  performance_score: number;
  accessibility_score: number;
  issues: AuditIssue[];
  summary: string;
  priority_fixes: string[];
  h1Count?: number;
  h2Count?: number;
  h3Count?: number;
  h4Count?: number;
  isFallbackScanner?: boolean;
  fallbackReason?: string;
}

async function generateReportWithGemini(url: string, html: string, diagnostics: HTMLDiagnostics): Promise<AuditReport> {
  const prompt = `You are a senior web auditor. Analyze this website and provide a comprehensive audit report in JSON format.

URL: ${url}
HTML Diagnostics: ${JSON.stringify(diagnostics, null, 2)}

Return your response as valid JSON only (no extra text). The JSON should match this structure:
{
  "website_url": "${url}",
  "overall_score": 0-100,
  "code_quality_score": 0-100,
  "design_score": 0-100,
  "responsiveness_score": 0-100,
  "typography_score": 0-100,
  "color_theme_score": 0-100,
  "performance_score": 0-100,
  "accessibility_score": 0-100,
  "issues": [
    {
      "category": "Code Quality" | "UI/UX Design" | "Responsiveness" | "Typography" | "Color Theme" | "Performance" | "Accessibility",
      "severity": "Low" | "Medium" | "High",
      "problem": "Brief description of the issue",
      "reason": "Why this is important",
      "recommendation": "How to fix it",
      "example_fix": "Optional code example"
    }
  ],
  "summary": "Executive summary of the audit",
  "priority_fixes": ["List of top 3-5 priority fixes"]
}
`;

  const result = await genAI!.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let text = result.response.text();
  text = text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

function generateFallbackReport(url: string, diagnostics: HTMLDiagnostics): AuditReport {
  const issues: AuditIssue[] = [];
  let codeQualityScore = 85;
  let designScore = 75;
  let responsivenessScore = 70;
  let typographyScore = 80;
  let colorThemeScore = 80;
  let performanceScore = 70;
  let accessibilityScore = 75;

  if (diagnostics.h1Count === 0) {
    issues.push({
      category: 'Code Quality',
      severity: 'High',
      problem: 'No H1 heading found',
      reason: 'H1 headings are critical for SEO and document structure',
      recommendation: 'Add a single descriptive H1 heading',
      example_fix: '<h1>Welcome to Our Website</h1>'
    });
    codeQualityScore -= 10;
  }
  if (diagnostics.h1Count > 1) {
    issues.push({
      category: 'Code Quality',
      severity: 'Medium',
      problem: 'Multiple H1 headings found',
      reason: 'Best practice is to have one H1 per page',
      recommendation: 'Keep only the most important H1'
    });
    codeQualityScore -= 5;
  }

  if (!diagnostics.hasViewport) {
    issues.push({
      category: 'Responsiveness',
      severity: 'High',
      problem: 'No viewport meta tag',
      reason: 'Critical for mobile responsiveness',
      recommendation: 'Add viewport meta tag',
      example_fix: '<meta name="viewport" content="width=device-width, initial-scale=1">'
    });
    responsivenessScore -= 20;
  }

  if (diagnostics.imagesWithoutAlt > 0) {
    issues.push({
      category: 'Accessibility',
      severity: 'Medium',
      problem: `${diagnostics.imagesWithoutAlt} image(s) missing alt attributes`,
      reason: 'Alt text is required for screen readers',
      recommendation: 'Add descriptive alt text to all images'
    });
    accessibilityScore -= (diagnostics.imagesWithoutAlt * 3);
  }
  if (!diagnostics.hasMainLandmark) {
    issues.push({
      category: 'Accessibility',
      severity: 'Medium',
      problem: 'No main landmark found',
      reason: 'Helps screen readers navigate page structure',
      recommendation: 'Use <main> tag or role="main"'
    });
    accessibilityScore -= 10;
  }
  if (diagnostics.formInputCount > 0 && diagnostics.formInputCount !== diagnostics.formInputWithLabelId) {
    issues.push({
      category: 'Accessibility',
      severity: 'Medium',
      problem: 'Some form inputs missing labels',
      reason: 'Form inputs need labels for accessibility',
      recommendation: 'Associate labels with inputs using for/id attributes'
    });
    accessibilityScore -= 8;
  }

  if (diagnostics.scriptCount > 15) {
    issues.push({
      category: 'Performance',
      severity: 'Medium',
      problem: 'High number of scripts loaded',
      reason: 'Can impact page load time',
      recommendation: 'Consider bundling and deferring scripts'
    });
    performanceScore -= 10;
  }
  if (diagnostics.inlineStylesCount > 10) {
    issues.push({
      category: 'Performance',
      severity: 'Low',
      problem: 'Many inline styles',
      reason: 'Better to use external stylesheets',
      recommendation: 'Move inline styles to CSS files'
    });
    performanceScore -= 5;
  }

  if (!diagnostics.metaDescription) {
    issues.push({
      category: 'Typography',
      severity: 'Medium',
      problem: 'No meta description',
      reason: 'Important for search engines and social sharing',
      recommendation: 'Add a unique, descriptive meta description'
    });
    typographyScore -= 10;
  }

  const overallScore = Math.round(
    (codeQualityScore + designScore + responsivenessScore + 
     typographyScore + colorThemeScore + performanceScore + accessibilityScore) / 7
  );

  return {
    website_url: url,
    overall_score: Math.max(0, Math.min(100, overallScore)),
    code_quality_score: Math.max(0, Math.min(100, codeQualityScore)),
    design_score: Math.max(0, Math.min(100, designScore)),
    responsiveness_score: Math.max(0, Math.min(100, responsivenessScore)),
    typography_score: Math.max(0, Math.min(100, typographyScore)),
    color_theme_score: Math.max(0, Math.min(100, colorThemeScore)),
    performance_score: Math.max(0, Math.min(100, performanceScore)),
    accessibility_score: Math.max(0, Math.min(100, accessibilityScore)),
    issues,
    summary: `Audit complete for ${url}. Found ${issues.length} issues that need attention.`,
    priority_fixes: issues.filter(i => i.severity === 'High').map(i => i.problem).slice(0, 5),
    h1Count: diagnostics.h1Count,
    h2Count: diagnostics.h2Count,
    h3Count: diagnostics.h3Count,
    h4Count: diagnostics.h4Count,
    isFallbackScanner: true,
    fallbackReason: 'Local scanner used - no AI API configured or API quota reached'
  };
}

// Audit endpoint
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = 'https://' + url;
    }

    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    const html = await response.text();
    const diagnostics = analyzeHTML(html);

    let report;
    if (genAI) {
      try {
        report = await generateReportWithGemini(targetUrl, html, diagnostics);
      } catch (geminiError) {
        console.warn('Gemini API failed, using fallback:', geminiError);
        report = generateFallbackReport(targetUrl, diagnostics);
      }
    } else {
      report = generateFallbackReport(targetUrl, diagnostics);
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        await prisma.audit.create({
          data: {
            userId: decoded.id,
            url: targetUrl.replace(/https?:\/\//, ''),
            score: report.overall_score,
            reportData: report,
          },
        });
      } catch (dbError) {
        console.error('Failed to save audit to DB:', dbError);
      }
    }

    res.json(report);
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ error: 'Failed to audit website. Please try again.' });
  }
});

export default router;
