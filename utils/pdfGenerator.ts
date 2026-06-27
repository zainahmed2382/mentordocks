import { jsPDF } from "jspdf";
import { AuditReport } from "../src/types";

export function exportReportToPDF(report: AuditReport) {
  // Create PDF on A4 portrait (210mm x 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  let y = margin;

  // Track page numbers manually for footer
  function drawHeaderBanner() {
    // Top colored bar
    doc.setFillColor(10, 10, 10); // #0a0a0a
    doc.rect(0, 0, pageWidth, 42, "F");

    // Accent blue line
    doc.setFillColor(59, 130, 246); // #3b82f6
    doc.rect(0, 42, pageWidth, 1.5, "F");

    // Title / Logo
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MENTOR DOCKS", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("WEB DESIGN & ACCESSIBILITY AUDIT ENGINE • v2.4", margin, 24);

    // Scan Meta info on the right of banner
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const domainText = report.website_url.replace(/https?:\/\/(www\.)?/, "");
    doc.text(`AUDIT SITE: ${domainText.toUpperCase()}`, pageWidth - margin - 85, 18, { align: "left" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    doc.text(`DATE GENERATED: ${dateStr.toUpperCase()}`, pageWidth - margin - 85, 24, { align: "left" });

    // Header Overall Score Card inside dark banner
    doc.setFillColor(20, 20, 20); // #141414
    doc.roundedRect(pageWidth - margin - 35, 8, 35, 26, 2, 2, "F");
    
    // Border for overall score
    doc.setDrawColor(50, 50, 50);
    doc.roundedRect(pageWidth - margin - 35, 8, 35, 26, 2, 2, "D");

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("OVERALL SCORE", pageWidth - margin - 17.5, 14, { align: "center" });

    // Dynamic rating color
    if (report.overall_score >= 90) {
      doc.setTextColor(16, 185, 129); // #10b981
    } else if (report.overall_score >= 55) {
      doc.setTextColor(245, 158, 11); // #f59e0b
    } else {
      doc.setTextColor(239, 68, 68); // #ef4444
    }
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${report.overall_score}`, pageWidth - margin - 17.5, 21, { align: "center" });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text("/ 100 PTS", pageWidth - margin - 17.5, 26, { align: "center" });

    // Adjust y to start after header banner
    y = 52;
  }

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 10;
      drawPageFooter();
    }
  }

  function drawPageFooter() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const domainText = report.website_url.replace(/https?:\/\/(www\.)?/, "");
    doc.text(`Mentor Docks Audit Certificate • ${domainText}`, margin, pageHeight - margin + 3);
    
    const pageNumText = `Page ${doc.getNumberOfPages()}`;
    doc.text(pageNumText, pageWidth - margin, pageHeight - margin + 3, { align: "right" });

    // Footer divider line
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - margin - 2, pageWidth - margin, pageHeight - margin - 2);
  }

  // Draw initial banner and footers
  drawHeaderBanner();
  drawPageFooter();

  // Part 1: Category Scoring Matrix grid
  checkPageBreak(50);
  
  // Section Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("EXECUTIVE SCORECARD MATRIX", margin, y);
  y += 5;

  const matrixItems = [
    { name: "Code Quality", score: report.code_quality_score, desc: "W3C structure & viewport validation" },
    { name: "UI/UX Design", score: report.design_score, desc: "Visual rhythm, margins & spacing" },
    { name: "Responsiveness", score: report.responsiveness_score, desc: "Mobile scale, viewport flexibilities" },
    { name: "Typography", score: report.typography_score, desc: "Font hierarchic balance & scale" },
    { name: "Color Contrast", score: report.color_theme_score, desc: "Contrast matching standards" },
    { name: "Performance", score: report.performance_score, desc: "Resource loads & render blocks" },
    { name: "Accessibility", score: report.accessibility_score, desc: "WCAG 2.1 skip link / input labeling" }
  ];

  // Draw scorecard grid (2 columns)
  const colWidth = (contentWidth - 6) / 2;
  let currentStartX = margin;

  matrixItems.forEach((item, index) => {
    const isLeft = index % 2 === 0;
    const itemX = isLeft ? margin : margin + colWidth + 6;
    const itemY = y;

    // Background Card
    doc.setFillColor(248, 250, 252); // soft slate background
    doc.roundedRect(itemX, itemY, colWidth, 14, 1.5, 1.5, "F");
    
    doc.setDrawColor(230, 235, 240);
    doc.setLineWidth(0.35);
    doc.roundedRect(itemX, itemY, colWidth, 14, 1.5, 1.5, "D");

    // Item Score Bar Accent left
    if (item.score >= 90) doc.setFillColor(16, 185, 129);
    else if (item.score >= 55) doc.setFillColor(245, 158, 11);
    else doc.setFillColor(239, 68, 68);
    doc.rect(itemX, itemY, 3, 14, "F");

    // Score Name
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(item.name.toUpperCase(), itemX + 6, itemY + 5.5);

    // Meta descriptions
    doc.setTextColor(110, 120, 135);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(item.desc, itemX + 6, itemY + 10);

    // Big score text on the right of card
    if (item.score >= 90) doc.setTextColor(16, 185, 129);
    else if (item.score >= 55) doc.setTextColor(245, 158, 11);
    else doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${item.score}`, itemX + colWidth - 12, itemY + 8.5, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("/100", itemX + colWidth - 5, itemY + 8.5, { align: "right" });

    if (!isLeft || index === matrixItems.length - 1) {
      y += 18;
      checkPageBreak(25);
    }
  });

  y += 2;

  // Executive summary synthesis
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("EXPERT EXECUTIVE SYNTHESIS", margin, y);
  y += 5;

  const textLines = doc.splitTextToSize(report.summary, contentWidth - 4);
  const textHeight = textLines.length * 4.5 + 8;
  checkPageBreak(textHeight);

  // Box for summary
  doc.setFillColor(252, 252, 253);
  doc.setDrawColor(220, 222, 225);
  doc.roundedRect(margin, y, contentWidth, textHeight, 2, 2, "F");
  doc.roundedRect(margin, y, contentWidth, textHeight, 2, 2, "D");

  // Dynamic left vertical bar decoration
  doc.setFillColor(59, 130, 246); // theme blue accent
  doc.rect(margin, y, 1.5, textHeight, "F");

  doc.setTextColor(50, 60, 75);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(textLines, margin + 4, y + 6);
  y += textHeight + 10;

  // Immediate Action Actions
  if (report.priority_fixes && report.priority_fixes.length > 0) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("CORE REMEDIATION PRIORITIES (IMMEDIATE ACTION)", margin, y);
    y += 5;

    // Yellow warning container box for action lists
    const itemSpacing = 10;
    const totalPriorityBoxHeight = report.priority_fixes.length * itemSpacing + 6;
    checkPageBreak(totalPriorityBoxHeight);

    doc.setFillColor(254, 251, 236); // very soft amber
    doc.setDrawColor(251, 191, 36);  // amber boundary
    doc.roundedRect(margin, y, contentWidth, totalPriorityBoxHeight, 2, 2, "F");
    doc.roundedRect(margin, y, contentWidth, totalPriorityBoxHeight, 2, 2, "D");

    let itemsY = y + 5;
    report.priority_fixes.forEach((fix, fixIdx) => {
      // Number circles
      doc.setFillColor(245, 158, 11); // solid warning amber
      doc.circle(margin + 5, itemsY - 0.5, 2.5, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(`${fixIdx + 1}`, margin + 5, itemsY + 0.25, { align: "center" });

      doc.setTextColor(120, 53, 4); // deep rich amber readable text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      
      const fixLineWrapped = doc.splitTextToSize(fix, contentWidth - 18);
      doc.text(fixLineWrapped, margin + 11, itemsY + 0.5);
      
      itemsY += itemSpacing;
    });

    y += totalPriorityBoxHeight + 10;
  }

  // Findings list details
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(`ACTIONABLE FINDINGS DIAGNOSTICS (${report.issues.length})`, margin, y);
  y += 6;

  // Draw findings items
  report.issues.forEach((issue, index) => {
    // Height estimation of issue items to determine page-break
    const problemLines = doc.splitTextToSize(issue.problem, contentWidth - 10);
    const reasonTitleLines = doc.splitTextToSize("Impact & Rationale:", contentWidth - 10);
    const reasonBodyLines = doc.splitTextToSize(issue.reason, contentWidth - 10);
    const recommendationLines = doc.splitTextToSize(issue.recommendation, contentWidth - 10);
    
    // Estimate total height needed
    let estimatedCodeHeight = 0;
    if (issue.example_fix) {
      // split code
      const codeLines = doc.splitTextToSize(issue.example_fix, contentWidth - 16);
      estimatedCodeHeight = codeLines.length * 4 + 10;
    }

    const findingBoxHeight = 
      6 + // upper margins
      (problemLines.length * 5) + 
      4 + 
      (reasonBodyLines.length * 4) + 
      4 + 
      (recommendationLines.length * 4) + 
      estimatedCodeHeight + 
      9; // padding floor

    checkPageBreak(findingBoxHeight);

    // Draw issue outer border structure
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.4);
    
    // Set draw borders according to severity
    if (issue.severity === "High") {
      doc.setDrawColor(244, 63, 94); // rose
      doc.setFillColor(255, 251, 252);
    } else if (issue.severity === "Medium") {
      doc.setDrawColor(245, 158, 11); // amber
      doc.setFillColor(255, 253, 245);
    } else {
      doc.setDrawColor(148, 163, 184); // slate/info
      doc.setFillColor(248, 250, 252);
    }

    doc.roundedRect(margin, y, contentWidth, findingBoxHeight, 2, 2, "F");
    doc.roundedRect(margin, y, contentWidth, findingBoxHeight, 2, 2, "D");

    // Severity Left block tag indicator accent line
    if (issue.severity === "High") doc.setFillColor(244, 63, 94);
    else if (issue.severity === "Medium") doc.setFillColor(245, 158, 11);
    else doc.setFillColor(148, 163, 184);
    doc.rect(margin, y, 2.5, findingBoxHeight, "F");

    let innerY = y + 6;

    // Issue header meta tags
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    if (issue.severity === "High") doc.setTextColor(220, 38, 38);
    else if (issue.severity === "Medium") doc.setTextColor(217, 119, 6);
    else doc.setTextColor(71, 85, 105);

    const headingMeta = `[${issue.category.toUpperCase()}] • ${issue.severity.toUpperCase()} SEVERITY findings`.toUpperCase();
    doc.text(headingMeta, margin + 6, innerY);
    innerY += 4.5;

    // Problem description title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(problemLines, margin + 6, innerY);
    innerY += (problemLines.length * 5) + 1;

    // Reason description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 125);
    doc.text("IMPACT ANALYSIS:", margin + 6, innerY);
    innerY += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(reasonBodyLines, margin + 6, innerY);
    innerY += (reasonBodyLines.length * 3.8) + 3;

    // Recommendation blueprint actions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 125);
    doc.text("ACTIONABLE RECOMMENDATION:", margin + 6, innerY);
    innerY += 3.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(recommendationLines, margin + 6, innerY);
    innerY += (recommendationLines.length * 3.8) + 3;

    // If Code remediation exists
    if (issue.example_fix) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 110, 125);
      doc.text("REMEDIATION BLUEPRINT:", margin + 6, innerY);
      innerY += 3;

      // Draw gray code block box
      const codeLines = doc.splitTextToSize(issue.example_fix, contentWidth - 14);
      const codeBoxHeight = codeLines.length * 3.8 + 5;
      
      doc.setFillColor(241, 245, 249); // light blue-gray standard code block
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin + 6, innerY, contentWidth - 12, codeBoxHeight, 1, 1, "F");
      doc.roundedRect(margin + 6, innerY, contentWidth - 12, codeBoxHeight, 1, 1, "D");

      doc.setTextColor(30, 41, 59);
      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.text(codeLines, margin + 9, innerY + 4);

      innerY += codeBoxHeight;
    }

    y += findingBoxHeight + 6;
  });

  // Stamp every single page footer
  const totalPagesCount = doc.getNumberOfPages();
  for (let pNum = 1; pNum <= totalPagesCount; pNum++) {
    doc.setPage(pNum);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const domainText = report.website_url.replace(/https?:\/\/(www\.)?/, "");
    doc.text(`Mentor Docks Audit Certificate • ${domainText}`, margin, pageHeight - margin + 3);
    
    const pageNumText = `Page ${pNum} of ${totalPagesCount}`;
    doc.text(pageNumText, pageWidth - margin, pageHeight - margin + 3, { align: "right" });

    // Footer lines
    doc.setDrawColor(220, 222, 225);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - margin - 2, pageWidth - margin, pageHeight - margin - 2);
  }

  // Trigger browser save download
  const domainSlug = report.website_url.replace(/https?:\/\/(www\.)?/, "").replace(/[^a-zA-Z0-9]/g, "-");
  doc.save(`Mentor-Docks-Audit-${domainSlug}.pdf`);
}
