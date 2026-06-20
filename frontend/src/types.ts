export interface AuditIssue {
  category: string; // One of: 'Code Quality', 'UI/UX Design', 'Responsiveness', 'Typography', 'Color Theme', 'Performance', 'Accessibility'
  severity: "Low" | "Medium" | "High";
  problem: string;
  reason: string;
  recommendation: string;
  example_fix?: string;
}

export interface AuditReport {
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
}

export type CategoryFilter = "all" | "Code Quality" | "UI/UX Design" | "Responsiveness" | "Typography" | "Color Theme" | "Performance" | "Accessibility";
export type SeverityFilter = "all" | "High" | "Medium" | "Low";
