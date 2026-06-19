import React, { useState, useRef, useEffect } from 'react';
import type { MetricHistory } from '../types';

interface CustomChartProps {
  data: MetricHistory[];
  type: 'line' | 'area' | 'bar';
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  height?: number;
  unit?: string;
}

export const CustomChart: React.FC<CustomChartProps> = ({
  data,
  type,
  color = '#00F2FE',
  gradientStart = '#4FACFE',
  gradientEnd = '#00F2FE',
  height = 200,
  unit = ''
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width || 400);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 py-8" style={{ height }}>
        No historical data available.
      </div>
    );
  }

  // Calculate coordinates
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = containerWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.95; // Add padding bottom to chart scale
  const maxVal = Math.max(...values) * 1.05; // Add padding top to chart scale
  const valRange = maxVal - minVal || 1;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
    return { x, y, value: d.value, date: d.date };
  });

  // SVG Paths
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Handle Mouse Hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find closest point by X coordinate
    let closestIndex = 0;
    let minDistance = Infinity;

    points.forEach((p, idx) => {
      const distance = Math.abs(p.x - mouseX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setHoverIndex(closestIndex);
    
    // Tooltip position
    const pt = points[closestIndex];
    setTooltipPos({
      x: pt.x + 10,
      y: pt.y - 45
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Generate grid values
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps }).map((_, i) => {
    const ratio = i / (gridSteps - 1);
    const value = maxVal - ratio * valRange;
    const y = paddingTop + ratio * chartHeight;
    return { y, value };
  });

  return (
    <div ref={containerRef} className="relative w-full overflow-visible select-none">
      <svg
        width="100%"
        height={height}
        className="overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradient for fill */}
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientStart} stopOpacity={0.45} />
            <stop offset="100%" stopColor={gradientEnd} stopOpacity={0.01} />
          </linearGradient>
          {/* Glow filter for glowy charts */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={line.y}
              x2={containerWidth - paddingRight}
              y2={line.y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 8}
              y={line.y + 4}
              textAnchor="end"
              fill="#64748B"
              fontSize="10"
              fontWeight="500"
            >
              {unit === '$' 
                ? `$${(line.value >= 1e6 ? (line.value / 1e6).toFixed(1) + 'M' : line.value >= 1e3 ? (line.value / 1e3).toFixed(0) + 'k' : line.value.toFixed(0))}`
                : line.value.toFixed(0)
              }
            </text>
          </g>
        ))}

        {/* Vertical alignment helper columns */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={p.x}
            y1={paddingTop}
            x2={p.x}
            y2={paddingTop + chartHeight}
            stroke={hoverIndex === i ? 'rgba(255,255,255,0.1)' : 'transparent'}
            strokeWidth="1.5"
          />
        ))}

        {/* Area fill */}
        {type === 'area' && areaPath && (
          <path
            d={areaPath}
            fill={`url(#grad-${color.replace('#', '')})`}
            className="transition-all duration-300 ease-out"
          />
        )}

        {/* Bar chart rendering */}
        {type === 'bar' && points.map((p, i) => {
          const barWidth = Math.min(24, chartWidth / data.length * 0.5);
          const barHeight = paddingTop + chartHeight - p.y;
          return (
            <rect
              key={i}
              x={p.x - barWidth / 2}
              y={p.y}
              width={barWidth}
              height={barHeight}
              fill={hoverIndex === i ? gradientStart : gradientEnd}
              opacity={hoverIndex === i ? 0.95 : 0.75}
              rx="3"
              className="transition-all duration-200"
            />
          );
        })}

        {/* Line stroke */}
        {(type === 'line' || type === 'area') && linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-300 ease-out"
          />
        )}

        {/* Points and Hover nodes */}
        {(type === 'line' || type === 'area') && points.map((p, i) => (
          <g key={i}>
            {/* Pulsing ring around hover point */}
            {hoverIndex === i && (
              <circle
                cx={p.x}
                cy={p.y}
                r="7"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.5"
                className="animate-ping"
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 5.5 : 3.5}
              fill={hoverIndex === i ? '#0B0F19' : color}
              stroke={color}
              strokeWidth={hoverIndex === i ? 2.5 : 1}
              className="transition-all duration-150 ease-out cursor-pointer"
            />
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            fill={hoverIndex === i ? '#E2E8F0' : '#64748B'}
            fontSize="10"
            fontWeight={hoverIndex === i ? '600' : '400'}
            className="transition-all duration-150"
          >
            {p.date}
          </text>
        ))}
      </svg>

      {/* Hover Floating Tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="absolute z-20 pointer-events-none rounded-lg border border-slate-700 bg-slate-900/90 p-2 text-xs shadow-xl backdrop-blur-md transition-all duration-75"
          style={{
            left: `${Math.min(containerWidth - 110, Math.max(10, tooltipPos.x))}px`,
            top: `${Math.min(height - 60, Math.max(5, tooltipPos.y))}px`,
          }}
        >
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            {points[hoverIndex].date}
          </div>
          <div className="font-semibold text-white mt-0.5">
            {unit === '$' ? `$${points[hoverIndex].value.toLocaleString()}` : `${points[hoverIndex].value.toLocaleString()}${unit}`}
          </div>
        </div>
      )}
    </div>
  );
};
