'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import {
  UnifiedHexagonProfile,
  UnifiedHexagonAxis,
  UNIFIED_AXIS_METADATA,
  getAllUnifiedAxes,
} from '@/lib/unified-hexagon-system';

export interface UnifiedHexagonProps {
  profile: UnifiedHexagonProfile;
  showCard?: boolean;
  animated?: boolean;
  title?: string;
  description?: string;
  size?: number;
  showRanks?: boolean;
  showAxisDetails?: boolean;
}

// Rank system: D- to S+ based on 0-10 scale
interface RankInfo {
  rank: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function getRankFromValue(value: number): RankInfo {
  if (value >= 9.5) return { rank: 'S+', label: 'Legendary', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' };
  if (value >= 9.0) return { rank: 'S', label: 'Master', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  if (value >= 8.5) return { rank: 'S-', label: 'Elite', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  if (value >= 8.0) return { rank: 'A+', label: 'Expert', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' };
  if (value >= 7.0) return { rank: 'A', label: 'Advanced', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
  if (value >= 6.0) return { rank: 'A-', label: 'Proficient', color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
  if (value >= 5.5) return { rank: 'B+', label: 'Skilled', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' };
  if (value >= 5.0) return { rank: 'B', label: 'Competent', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  if (value >= 4.0) return { rank: 'B-', label: 'Intermediate+', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  if (value >= 3.5) return { rank: 'C+', label: 'Intermediate', color: 'text-cyan-700', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300' };
  if (value >= 2.5) return { rank: 'C', label: 'Developing', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' };
  if (value >= 2.0) return { rank: 'C-', label: 'Beginner+', color: 'text-cyan-500', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' };
  if (value >= 1.5) return { rank: 'D+', label: 'Novice+', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' };
  if (value >= 1.0) return { rank: 'D', label: 'Novice', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  return { rank: 'D-', label: 'Beginner', color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
}

export default function UnifiedHexagon({
  profile,
  showCard = true,
  animated = true,
  title = 'Your Skill Hexagon',
  description,
  size = 400,
  showRanks = true,
  showAxisDetails = true,
}: UnifiedHexagonProps) {
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    if (animated) {
      setTimeout(() => setAnimationTriggered(true), 100);
    } else {
      setAnimationTriggered(true);
    }
  }, [animated]);

  const axes = getAllUnifiedAxes();

  const categories = axes.map(axis => {
    const metadata = UNIFIED_AXIS_METADATA[axis];
    const value = profile[axis] || 0;
    return {
      key: axis,
      label: metadata.displayName,
      shortLabel: metadata.shortName,
      value,
      rank: getRankFromValue(value),
      icon: metadata.icon,
      color: metadata.color,
      level: profile[`${axis}Level`] as string,
    };
  });

  // Calculate hexagon points
  const centerX = 225;
  const centerY = 230;
  const maxRadius = 150;
  const angleStep = (Math.PI * 2) / 6;
  const startAngle = -Math.PI / 2; // Start from top

  const points = categories.map((cat, i) => {
    const angle = startAngle + angleStep * i;
    const radius = animationTriggered ? (cat.value / 10) * maxRadius : 0;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    return { x, y, label: cat.label, value: cat.value };
  });

  const axisPoints = categories.map((_, i) => {
    const angle = startAngle + angleStep * i;
    const x = centerX + Math.cos(angle) * maxRadius;
    const y = centerY + Math.sin(angle) * maxRadius;
    return { x, y };
  });

  // Create path string for the hexagon
  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const content = (
    <div className="w-full space-y-4">
      {title && showCard && (
        <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">{title}</h3>
      )}
      {description && showCard && (
        <p className="text-sm text-slate-600 mb-4 text-center">{description}</p>
      )}

      <svg
        viewBox="0 0 450 520"
        className="w-full h-auto"
        style={{ maxWidth: `${size}px`, margin: '0 auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background concentric hexagons */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, idx) => {
          const bgPoints = axisPoints.map(p => ({
            x: centerX + (p.x - centerX) * scale,
            y: centerY + (p.y - centerY) * scale,
          }));
          const bgPath = bgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return (
            <path
              key={idx}
              d={bgPath}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {axisPoints.map((p, i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={p.x}
            y2={p.y}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        ))}

        {/* User's hexagon filled area */}
        <path
          d={pathString}
          fill="rgba(99, 102, 241, 0.15)"
          stroke="rgb(99, 102, 241)"
          strokeWidth="2"
          style={{
            transition: animated ? 'all 0.8s ease-out' : 'none',
          }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="rgb(99, 102, 241)"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Axis labels with icons */}
        {categories.map((cat, i) => {
          const angle = startAngle + angleStep * i;
          const labelRadius = maxRadius + 40;
          const x = centerX + Math.cos(angle) * labelRadius;
          const y = centerY + Math.sin(angle) * labelRadius;

          return (
            <g key={i}>
              {/* Background for better readability */}
              <rect
                x={x - 55}
                y={y - 18}
                width="110"
                height="36"
                fill="white"
                fillOpacity="0.9"
                rx="6"
              />
              <text
                x={x}
                y={y - 4}
                textAnchor="middle"
                className="text-xs font-semibold"
                fill="#334155"
              >
                {cat.icon} {cat.shortLabel}
              </text>
              <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                className="text-xs font-bold"
                fill="#6366f1"
              >
                {cat.value.toFixed(1)}/10
              </text>
            </g>
          );
        })}

        {/* Center value indicator */}
        <circle cx={centerX} cy={centerY} r="30" fill="white" stroke="#e2e8f0" strokeWidth="2" />
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-sm font-semibold"
          fill="#64748b"
        >
          Overall
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="text-xs font-bold"
          fill="#6366f1"
        >
          {(categories.reduce((sum, cat) => sum + cat.value, 0) / 6).toFixed(1)}
        </text>
      </svg>

      {/* Axis details breakdown */}
      {showAxisDetails && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <div>
                  <p className="text-xs font-medium text-slate-700">{cat.shortLabel}</p>
                  <p className="text-xs text-slate-500">{cat.level}</p>
                </div>
              </div>
              {showRanks && (
                <Badge variant="outline" className={`${cat.rank.bgColor} ${cat.rank.borderColor} ${cat.rank.color} text-xs px-2 py-0.5`}>
                  {cat.rank.rank}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card className="p-6">
        {content}
      </Card>
    );
  }

  return content;
}
