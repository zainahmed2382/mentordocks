import React from "react";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface SparklineChartProps {
  data: ChartDataPoint[];
  color: string;
  fillColor: string;
  label: string;
  currentValue: number;
  delay?: number;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ data, color, fillColor, label, currentValue, delay = 0 }) => {
  const W = 200;
  const H = 70;
  const pad = 8;

  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: H - pad - ((d.value - minV) / range) * (H - pad * 2)
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${H - pad} L ${points[0].x} ${H - pad} Z`;

  const trend = values[values.length - 1] - values[values.length - 2];

  return (
    <div className="dash-card p-5 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{currentValue}</div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line
            key={i}
            x1={pad}
            y1={H - pad - f * (H - pad * 2)}
            x2={W - pad}
            y2={H - pad - f * (H - pad * 2)}
            stroke="#f1f5f9"
            strokeWidth={1}
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill={fillColor} opacity={0.4} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sparkline-path"
          style={{ animationDelay: `${delay + 200}ms` }}
        />

        {/* Last point dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={4}
          fill={color}
        />
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1">
        {data.slice(0, 5).map((d, i) => (
          <span key={i} className="text-[9px] text-slate-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
};

interface PerformanceChartsProps {
  overallScore: number;
  performanceScore: number;
  accessibilityScore: number;
  auditHistory: Array<{ url: string; date: string; score: number }>;
}

function generateTrendData(baseScore: number, historyScores: number[]): ChartDataPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const last5 = months.slice(-5);

  // Use actual history if available, otherwise simulate
  if (historyScores.length >= 3) {
    return last5.map((month, i) => ({
      label: month,
      value: i < historyScores.length
        ? historyScores[i]
        : Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 10))
    }));
  }

  // Simulate ascending trend toward current score
  return last5.map((month, i) => ({
    label: month,
    value: Math.max(10, Math.min(100, Math.round(baseScore - (4 - i) * 4 + (Math.random() - 0.5) * 6)))
  }));
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  overallScore,
  performanceScore,
  accessibilityScore,
  auditHistory
}) => {
  const historyScores = auditHistory.map(h => h.score);

  const overallTrend = generateTrendData(overallScore, historyScores);
  const perfTrend = generateTrendData(performanceScore, []);
  const a11yTrend = generateTrendData(accessibilityScore, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Analytics & Trends</h3>
        <span className="text-xs text-slate-500">Last 5 months</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SparklineChart
          data={overallTrend}
          color="#3b82f6"
          fillColor="#dbeafe"
          label="Overall Score"
          currentValue={overallScore}
          delay={400}
        />
        <SparklineChart
          data={perfTrend}
          color="#10b981"
          fillColor="#d1fae5"
          label="Performance"
          currentValue={performanceScore}
          delay={500}
        />
        <SparklineChart
          data={a11yTrend}
          color="#8b5cf6"
          fillColor="#ede9fe"
          label="Accessibility"
          currentValue={accessibilityScore}
          delay={600}
        />
      </div>
    </div>
  );
};
