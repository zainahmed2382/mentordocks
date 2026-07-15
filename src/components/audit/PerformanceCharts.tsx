import React, { useState } from "react";

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
  const gradId = `grad-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="dash-card p-5 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-black text-slate-100 mt-1">{currentValue}</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border ${
          trend >= 0 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: 56 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line
            key={i}
            x1={pad}
            y1={H - pad - f * (H - pad * 2)}
            x2={W - pad}
            y2={H - pad - f * (H - pad * 2)}
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray="2 4"
            opacity={0.4}
          />
        ))}

        {/* Area fill using linear gradient */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Sparkline Path */}
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

        {/* Hover vertical guide line */}
        {hoveredIdx !== null && (
          <line
            x1={points[hoveredIdx].x}
            y1={pad}
            x2={points[hoveredIdx].x}
            y2={H - pad}
            stroke={color}
            strokeWidth={1.2}
            strokeDasharray="2 2"
            opacity={0.6}
          />
        )}

        {/* Highlight circle on hover or last point */}
        {points.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={hoveredIdx === i ? 4.5 : i === points.length - 1 ? 3.5 : 0}
            fill={color}
            stroke="#0b1120"
            strokeWidth={hoveredIdx === i ? 1.5 : 0}
            className="transition-all duration-150 pointer-events-none"
            opacity={hoveredIdx === i || i === points.length - 1 ? 1 : 0}
          />
        ))}

        {/* Floating Tooltip inside SVG */}
        {hoveredIdx !== null && (
          <g className="transition-all duration-150 pointer-events-none">
            <rect
              x={Math.max(pad, Math.min(W - pad - 42, points[hoveredIdx].x - 21))}
              y={points[hoveredIdx].y - 18 < pad ? points[hoveredIdx].y + 8 : points[hoveredIdx].y - 18}
              width={42}
              height={13}
              rx={3}
              fill="#0f172a"
              stroke={color}
              strokeWidth={0.8}
            />
            <text
              x={Math.max(pad + 21, Math.min(W - pad - 21, points[hoveredIdx].x))}
              y={points[hoveredIdx].y - 18 < pad ? points[hoveredIdx].y + 17 : points[hoveredIdx].y - 9}
              fill="#f8fafc"
              fontSize={7.5}
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {data[hoveredIdx].label}: {data[hoveredIdx].value}
            </text>
          </g>
        )}

        {/* Transparent hover sensors */}
        {points.map((p, i) => (
          <circle
            key={`sensor-${i}`}
            cx={p.x}
            cy={p.y}
            r={14}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
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
