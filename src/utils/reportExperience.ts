import type { AuditIssue, AuditReport } from '../types';

export type FriendlyIssueContent = {
  plainEnglish: string;
  whyItMatters: string;
  howToFix: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedFixTime: string;
  expectedImprovement: string;
  aiInsight: string;
  proTip: string;
  learnMore: string;
};

const severityToPriority: Record<string, FriendlyIssueContent['priority']> = {
  High: 'Critical',
  Medium: 'High',
  Low: 'Medium',
};

const severityToDifficulty: Record<string, FriendlyIssueContent['difficulty']> = {
  High: 'Medium',
  Medium: 'Easy',
  Low: 'Easy',
};

function normalizeIssueText(text: string) {
  return text.replace(/render-blocking resources/gi, 'files that slow the page from loading quickly').replace(/DOM size is excessive/gi, 'your webpage contains many elements').replace(/unused JavaScript/gi, 'JavaScript that is not being used');
}

export function getFriendlyIssueContent(issue: AuditIssue): FriendlyIssueContent {
  const normalizedProblem = normalizeIssueText(issue.problem);
  const normalizedReason = normalizeIssueText(issue.reason);
  const normalizedRecommendation = normalizeIssueText(issue.recommendation);

  const plainEnglish = normalizedProblem
    .replace(/Eliminate/i, 'Some')
    .replace(/Reduce/i, 'Some')
    .replace(/Improve/i, 'A few changes can help')
    .replace(/Missing/i, 'This is missing')
    .replace(/Unoptimized/i, 'Some parts are not optimized');

  const priority = severityToPriority[issue.severity] ?? 'Medium';
  const difficulty = severityToDifficulty[issue.severity] ?? 'Easy';

  const estimatedFixTime = issue.severity === 'High' ? '15 Minutes' : issue.severity === 'Medium' ? '5 Minutes' : '2 Minutes';

  const expectedImprovement = issue.category === 'Performance'
    ? '✓ Faster loading speed'
    : issue.category === 'Accessibility'
      ? '✓ Better Accessibility'
      : issue.category === 'Typography' || issue.category === 'UI/UX Design'
        ? '✓ Better User Experience'
        : '✓ Better SEO';

  const aiInsight = issue.severity === 'High'
    ? `Prioritize this issue first because it can have a noticeable impact on how quickly visitors can use your site.`
    : `Address this after the highest-impact items so your improvements build in a practical order.`;

  const proTip = issue.category === 'Accessibility'
    ? 'Try testing the page with a screen reader or keyboard-only navigation to spot friction quickly.'
    : issue.category === 'Performance'
      ? 'Keep the page lightweight and avoid adding large scripts unless they are truly necessary.'
      : 'Small, consistent improvements often make the biggest difference for real users.';

  const learnMore = issue.category === 'Accessibility'
    ? 'Accessibility means making your site usable for more people, including visitors who rely on assistive technologies.'
    : issue.category === 'Performance'
      ? 'Performance focuses on how quickly and smoothly your website loads and responds.'
      : 'Good website quality means balancing speed, clarity, and usability for visitors and search engines.';

  return {
    plainEnglish: plainEnglish.length > 0 ? plainEnglish : 'This issue can make the page less helpful or slower for visitors.',
    whyItMatters: normalizedReason.length > 0 ? normalizedReason : 'This can affect how visitors experience your website and how search engines understand it.',
    howToFix: normalizedRecommendation.length > 0 ? normalizedRecommendation : 'Review the page and make a small, focused improvement that addresses the main problem first.',
    difficulty,
    priority,
    estimatedFixTime,
    expectedImprovement,
    aiInsight,
    proTip,
    learnMore,
  };
}

export function getPositiveFindings(report: AuditReport) {
  const positives: string[] = [];

  if (report.overall_score >= 80) positives.push('✓ Strong overall website quality');
  if (report.performance_score >= 80) positives.push('✓ Good performance baseline');
  if (report.accessibility_score >= 80) positives.push('✓ Strong accessibility foundation');
  if (report.responsiveness_score >= 80) positives.push('✓ Mobile-friendly layout');
  if (report.typography_score >= 80) positives.push('✓ Readable and polished typography');
  if (report.color_theme_score >= 80) positives.push('✓ Consistent visual design');
  if (report.code_quality_score >= 80) positives.push('✓ Clean structure and maintainable code');
  if (report.issues.length === 0) positives.push('✓ No major issues detected');
  if (report.website_url.includes('https://')) positives.push('✓ HTTPS enabled');
  if (report.summary && report.summary.length > 0) positives.push('✓ Clear audit summary available');

  return positives.slice(0, 6);
}
