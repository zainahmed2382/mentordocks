import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { prisma } from './_prisma.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

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
  const prompt = `You are a friendly web auditor helping beginners understand their website. Analyze this website and provide a simple, easy-to-read audit report in JSON format. Keep everything in plain English, no technical jargon.

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
      "problem": "1-2 sentence simple description of the issue",
      "reason": "Why this matters in simple terms",
      "recommendation": "Clear, step-by-step how to fix it",
      "example_fix": "Optional simple code example if needed"
    }
  ],
  "summary": "Friendly summary of what we found and how the website is doing",
  "priority_fixes": ["Top 3-5 simple fixes to do first"]
}
`;

  const result = await genAI!.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let text = result.text || '';
  text = text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

async function generateReportWithOpenAI(url: string, html: string, diagnostics: HTMLDiagnostics): Promise<AuditReport> {
  const prompt = `You are a friendly web auditor helping beginners understand their website. Analyze this website and provide a simple, easy-to-read audit report in JSON format. Keep everything in plain English, no technical jargon.

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
      "problem": "1-2 sentence simple description of the issue",
      "reason": "Why this matters in simple terms",
      "recommendation": "Clear, step-by-step how to fix it",
      "example_fix": "Optional simple code example if needed"
    }
  ],
  "summary": "Friendly summary of what we found and how the website is doing",
  "priority_fixes": ["Top 3-5 simple fixes to do first"]
}
`;

  const result = await openai!.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = result.choices[0].message.content || "";
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
      problem: 'Your website is missing a main heading (called H1).',
      reason: 'Main headings help search engines and screen readers understand what your page is about.',
      recommendation: 'Add one big, clear heading at the top of your page that tells visitors what it\'s about.',
      example_fix: '<h1>Welcome to Our Website</h1>'
    });
    codeQualityScore -= 10;
  }
  if (diagnostics.h1Count > 1) {
    issues.push({
      category: 'Code Quality',
      severity: 'Medium',
      problem: 'You have more than one main heading (H1) on the page.',
      reason: 'It\'s best to have just one main heading so people and search engines know what the most important thing is.',
      recommendation: 'Keep only the most important heading as your main one.'
    });
    codeQualityScore -= 5;
  }

  if (!diagnostics.hasViewport) {
    issues.push({
      category: 'Responsiveness',
      severity: 'High',
      problem: 'Your website doesn\'t have a mobile view setting.',
      reason: 'This means your site might not look good or work well on phones and tablets.',
      recommendation: 'Add a simple tag to help your website fit on all screen sizes.',
      example_fix: '<meta name="viewport" content="width=device-width, initial-scale=1">'
    });
    responsivenessScore -= 20;
  }

  if (diagnostics.imagesWithoutAlt > 0) {
    issues.push({
      category: 'Accessibility',
      severity: 'Medium',
      problem: `${diagnostics.imagesWithoutAlt} of your images don\'t have a description.`,
      reason: 'People who use screen readers need descriptions to understand what your images show.',
      recommendation: 'Add a short, clear description to every image.'
    });
    accessibilityScore -= (diagnostics.imagesWithoutAlt * 3);
  }
  if (!diagnostics.hasMainLandmark) {
    issues.push({
      category: 'Accessibility',
      severity: 'Medium',
      problem: 'Your page doesn\'t clearly mark the main content area.',
      reason: 'This makes it harder for people with disabilities to find the most important stuff.',
      recommendation: 'Wrap your main content in a <main> tag.'
    });
    accessibilityScore -= 10;
  }
  if (diagnostics.formInputCount > 0 && diagnostics.formInputCount !== diagnostics.formInputWithLabelId) {
    issues.push({
      category: 'Accessibility',
      severity: 'Medium',
      problem: 'Some of your form fields don\'t have clear labels.',
      reason: 'People using screen readers won\'t know what to type in those fields.',
      recommendation: 'Make sure every form box has a label that says what it\'s for.'
    });
    accessibilityScore -= 8;
  }

  if (diagnostics.scriptCount > 15) {
    issues.push({
      category: 'Performance',
      severity: 'Medium',
      problem: 'Your website loads a lot of small code files.',
      reason: 'Too many small files can make your website slower to load.',
      recommendation: 'Combine your small code files into a few bigger ones if possible.'
    });
    performanceScore -= 10;
  }
  if (diagnostics.inlineStylesCount > 10) {
    issues.push({
      category: 'Performance',
      severity: 'Low',
      problem: 'You have a lot of style code mixed into your main page code.',
      reason: 'Keeping styles separate makes your website easier to update and can help it load faster.',
      recommendation: 'Move your style code into separate CSS files.'
    });
    performanceScore -= 5;
  }

  if (!diagnostics.metaDescription) {
    issues.push({
      category: 'Typography',
      severity: 'Medium',
      problem: 'You don\'t have a short description for search engines.',
      reason: 'This description shows up in search results and tells people what your page is about.',
      recommendation: 'Write a 1-2 sentence description of what visitors will find on this page.'
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
    summary: `Great news! We've finished checking ${url}. We found ${issues.length} things you can improve, and none of them are too hard to fix!`,
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

    let html = '';
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      if (response.ok) {
        html = await response.text();
      }
    } catch (fetchErr) {
      console.warn(`Could not fetch HTML from ${targetUrl}, using default diagnostics:`, fetchErr);
    }
    const diagnostics = analyzeHTML(html || '');

    let report;
    if (openai) {
      try {
        report = await generateReportWithOpenAI(targetUrl, html, diagnostics);
      } catch (openaiError) {
        console.warn('OpenAI API failed, trying Gemini:', openaiError);
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
      }
    } else if (genAI) {
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
