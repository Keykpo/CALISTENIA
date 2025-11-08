'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export interface HexagonProfile {
  relativeStrength: number;
  muscularEndurance: number;
  balanceControl: number;
  jointMobility: number;
  bodyTension: number;
  skillTechnique: number;
}

interface SkillHexagonProps {
  profile: HexagonProfile;
  showCard?: boolean;
  animated?: boolean;
  title?: string;
  description?: string;
  size?: number;
  showRanks?: boolean;
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
  if (value >= 9.95) return { rank: 'S+', label: 'Legendary', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' };
  if (value >= 9.9) return { rank: 'S', label: 'Master', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  if (value >= 9.8) return { rank: 'S-', label: 'Elite', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  if (value >= 9.6) return { rank: 'A+', label: 'Expert', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' };
  if (value >= 9.3) return { rank: 'A', label: 'Advanced', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
  if (value >= 9.0) return { rank: 'A-', label: 'Proficient', color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
  if (value >= 8.0) return { rank: 'B+', label: 'Skilled', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' };
  if (value >= 7.0) return { rank: 'B', label: 'Competent', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  if (value >= 6.0) return { rank: 'B-', label: 'Intermediate+', color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  if (value >= 5.0) return { rank: 'C+', label: 'Intermediate', color: 'text-cyan-700', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300' };
  if (value >= 4.0) return { rank: 'C', label: 'Developing', color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' };
  if (value >= 3.0) return { rank: 'C-', label: 'Beginner+', color: 'text-cyan-500', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' };
  if (value >= 2.0) return { rank: 'D+', label: 'Novice+', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' };
  if (value >= 1.0) return { rank: 'D', label: 'Novice', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  return { rank: 'D-', label: 'Beginner', color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
}

export default function SkillHexagon({
  profile,
  showCard = true,
  animated = true,
  title = 'Your Skill Hexagon',
  description,
  size = 400,
  showRanks = true
}: SkillHexagonProps) {
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    if (animated) {
      // Trigger animation after mount
      setTimeout(() => setAnimationTriggered(true), 100);
    } else {
      setAnimationTriggered(true);
    }
  }, [animated]);

  const categories = [
    { key: 'relativeStrength', label: 'Relative Strength', value: profile.relativeStrength, rank: getRankFromValue(profile.relativeStrength) },
    { key: 'muscularEndurance', label: 'Muscular Endurance', value: profile.muscularEndurance, rank: getRankFromValue(profile.muscularEndurance) },
    { key: 'balanceControl', label: 'Balance Control', value: profile.balanceControl, rank: getRankFromValue(profile.balanceControl) },
    { key: 'jointMobility', label: 'Joint Mobility', value: profile.jointMobility, rank: getRankFromValue(profile.jointMobility) },
    { key: 'bodyTension', label: 'Body Tension', value: profile.bodyTension, rank: getRankFromValue(profile.bodyTension) },
    { key: 'skillTechnique', label: 'Skill Technique', value: profile.skillTechnique, rank: getRankFromValue(profile.skillTechnique) },
  ];

  // Calculate hexagon points
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 150;
  const angleStep = (Math.PI * 2) / 6;
  const startAngle = -Math.PI / 2; // Start from top

  const points = categories.map((cat, i) => {
    const angle = startAngle + angleStep * i;
    const radius = (cat.value / 10) * maxRadius;
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
    <div className="w-full">
      {title && showCard && (
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      )}

      <svg
        viewBox="0 0 400 500"
        className="w-full h-auto"
        style={{ maxWidth: `${size}px`, margin: '0 auto' }}
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

        {/* Data hexagon with animation */}
        <path
          d={pathString}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          className={animated ? "transition-all duration-1000 ease-out" : ""}
          style={{
            opacity: animationTriggered ? 1 : 0,
            transform: animationTriggered ? 'scale(1)' : 'scale(0)',
            transformOrigin: 'center',
          }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill="rgb(59, 130, 246)"
            className={animated ? "transition-all duration-1000 ease-out" : ""}
            style={{
              opacity: animationTriggered ? 1 : 0,
              transitionDelay: animated ? `${i * 100}ms` : '0ms',
            }}
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const angle = startAngle + angleStep * i;
          const labelRadius = maxRadius + 40;
          const labelX = centerX + Math.cos(angle) * labelRadius;
          const labelY = centerY + Math.sin(angle) * labelRadius;
          const cat = categories[i];

          return (
            <g key={i}>
              <text
                x={labelX}
                y={labelY - 10}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-slate-700"
              >
                {p.label}
              </text>
              {showRanks ? (
                <>
                  <text
                    x={labelX}
                    y={labelY + 5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-sm font-bold ${cat.rank.color.replace('text-', 'fill-')}`}
                  >
                    {cat.rank.rank}
                  </text>
                  <text
                    x={labelX}
                    y={labelY + 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-slate-500"
                  >
                    {cat.rank.label}
                  </text>
                </>
              ) : (
                <text
                  x={labelX}
                  y={labelY + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-blue-600"
                >
                  {p.value.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {description && (
        <div className="mt-4 text-center text-sm text-slate-600">
          <p>{description}</p>
        </div>
      )}

      {/* Rank Badges Grid */}
      {showRanks && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 text-center">Your Ranks</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${cat.rank.bgColor} ${cat.rank.borderColor} ${cat.rank.color} font-bold px-3 py-1`}
                >
                  {cat.rank.rank}
                </Badge>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-700">{cat.label}</p>
                  <p className="text-xs text-slate-500">{cat.rank.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (showCard) {
    return <Card className="p-6">{content}</Card>;
  }

  return content;
}
