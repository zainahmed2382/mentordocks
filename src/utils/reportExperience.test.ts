import test from 'node:test';
import assert from 'node:assert/strict';
import { getFriendlyIssueContent, getPositiveFindings } from './reportExperience';
import type { AuditIssue, AuditReport } from '../types';

test('friendly issue guidance turns technical wording into beginner-friendly guidance', () => {
  const issue: AuditIssue = {
    category: 'Performance',
    severity: 'High',
    problem: 'Eliminate render-blocking resources',
    reason: 'Render-blocking resources slow down the first visible content.',
    recommendation: 'Reduce or defer large scripts and styles that block rendering.',
  };

  const content = getFriendlyIssueContent(issue);

  assert.match(content.plainEnglish, /loading as quickly as possible/i);
  assert.equal(content.priority, 'Critical');
  assert.equal(content.difficulty, 'Medium');
  assert.match(content.expectedImprovement, /Faster loading speed/i);
  assert.match(content.aiInsight, /priority/i);
});

test('positive findings highlight strengths from a healthy report', () => {
  const report: AuditReport = {
    website_url: 'https://example.com',
    overall_score: 91,
    code_quality_score: 88,
    design_score: 84,
    responsiveness_score: 90,
    typography_score: 87,
    color_theme_score: 86,
    performance_score: 89,
    accessibility_score: 92,
    issues: [],
    summary: 'Great foundation',
    priority_fixes: [],
  };

  const positives = getPositiveFindings(report);

  assert.ok(positives.some((item) => item.includes('HTTPS')) || positives.some((item) => item.includes('Accessibility')));
  assert.ok(positives.length >= 3);
});
