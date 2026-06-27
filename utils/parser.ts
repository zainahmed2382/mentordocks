/**
 * Basic HTML analyzer helper to extract structural and technical metadata
 * for the website auditing tool.
 */

export interface HTMLDiagnostics {
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
  formInputWithLabelId: number; // inputs associated with labels
  totalHtmlSizeKb: number;
}

export function analyzeHTML(html: string): HTMLDiagnostics {
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
    // 1. Get title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    }

    // 2. Meta description & viewport
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

    // If description not found, try a looser match
    if (!result.metaDescription) {
      const descriptionMatch = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) || 
                               html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      if (descriptionMatch) {
        result.metaDescription = descriptionMatch[1].trim();
      }
    }

    // 3. Headings count
    result.h1Count = (html.match(/<h1/gi) || []).length;
    result.h2Count = (html.match(/<h2/gi) || []).length;
    result.h3Count = (html.match(/<h3/gi) || []).length;
    result.h4Count = (html.match(/<h4/gi) || []).length;

    // 4. Images details (alt tag validation)
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    result.totalImages = imgMatches.length;
    for (const imgTag of imgMatches) {
      // Check if alt attribute exists and is not empty or if it exists
      if (/alt\s*=\s*["']/i.test(imgTag)) {
        result.imagesWithAlt++;
      } else {
        result.imagesWithoutAlt++;
      }
    }

    // 5. Assets (Scripts, Stylesheets)
    result.scriptCount = (html.match(/<script/gi) || []).length;
    result.stylesheetCount = (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;
    result.inlineStylesCount = (html.match(/<style/gi) || []).length;

    // 6. Landmarks
    result.hasMainLandmark = /<(main|div)[^>]*\bid=["']main["']|role=["']main["']/i.test(html) || /<main/i.test(html);
    result.hasNavLandmark = /<(nav|div)[^>]*\bid=["']nav["']|role=["']navigation["']/i.test(html) || /<nav/i.test(html);
    result.hasFooterLandmark = /<(footer|div)[^>]*\bid=["']footer["']|role=["']contentinfo["']/i.test(html) || /<footer/i.test(html);

    // 7. Skip links (Common accessibility pattern)
    result.hasSkipLink = /href=["']#main["']/i.test(html) || /href=["']#content["']/i.test(html) || /skip\s*to\s*main/i.test(html);

    // 8. Forms & Inputs
    const inputMatches = html.match(/<input[^>]*>|<select[^>]*>|<textarea[^>]*>/gi) || [];
    result.formInputCount = inputMatches.length;
    for (const inputTag of inputMatches) {
      if (/id\s*=\s*["']([^"']+)["']/i.test(inputTag)) {
        const idMatch = inputTag.match(/id\s*=\s*["']([^"']+)["']/i);
        if (idMatch && idMatch[1]) {
          const inputId = idMatch[1];
          // Check if there is a corresponding label with matching 'for' attribute
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
