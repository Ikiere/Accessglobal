import React, { useState } from 'react';
import { DailyVolume } from '../types';

interface AnalyticsChartProps {
  data: DailyVolume[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  const [metricMode, setMetricMode] = useState<'volume' | 'txCount'>('volume');
  const [hoveredPoint, setHoveredPoint] = useState<DailyVolume | null>(null);

  const values = data.map(d => metricMode === 'volume' ? d.volume : d.txCount);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Chart dimensions inside SVG viewBox="0 0 700 240"
  const chartWidth = 640;
  const chartHeight = 180;
  const startX = 30;
  const startY = 20;

  const points = data.map((d, i) => {
    const val = metricMode === 'volume' ? d.volume : d.txCount;
    const x = startX + (i / (data.length - 1)) * chartWidth;
    const y = startY + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, data: d, val };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${startY + chartHeight} L ${points[0].x} ${startY + chartHeight} Z`;

  return (
    <div className="admin-card chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Real-Time Clearing & Settlement Velocity</h3>
          <p className="chart-subtitle">14-day aggregated platform metrics</p>
        </div>

        <div className="chart-toggle-group" role="group" aria-label="Metric Switcher">
          <button
            onClick={() => setMetricMode('volume')}
            className={`toggle-btn ${metricMode === 'volume' ? 'toggle-btn-active' : ''}`}
          >
            Gross Volume ($)
          </button>
          <button
            onClick={() => setMetricMode('txCount')}
            className={`toggle-btn ${metricMode === 'txCount' ? 'toggle-btn-active' : ''}`}
          >
            Transaction Count
          </button>
        </div>
      </div>

      <div className="chart-body">
        <svg viewBox="0 0 700 240" className="chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={startX} y1={startY} x2={startX + chartWidth} y2={startY} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={startX} y1={startY + chartHeight / 2} x2={startX + chartWidth} y2={startY + chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={startX} y1={startY + chartHeight} x2={startX + chartWidth} y2={startY + chartHeight} stroke="rgba(255,255,255,0.06)" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Smooth Line */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.date === p.data.date ? 6 : 3.5}
              fill="#f8fafc"
              stroke="#6366f1"
              strokeWidth="2.5"
              className="chart-circle"
              onMouseEnter={() => setHoveredPoint(p.data)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip display */}
        <div className="chart-tooltip-bar">
          {hoveredPoint ? (
            <div className="tooltip-content">
              <span className="tooltip-date font-mono">{hoveredPoint.date}:</span>
              <span className="tooltip-val font-mono">
                {metricMode === 'volume'
                  ? `$${(hoveredPoint.volume).toLocaleString()} USD`
                  : `${hoveredPoint.txCount.toLocaleString()} Transactions`}
              </span>
            </div>
          ) : (
            <span className="tooltip-hint">Hover over data points to inspect daily settlement data</span>
          )}
        </div>
      </div>
    </div>
  );
};
