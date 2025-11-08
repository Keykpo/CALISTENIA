'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface HexagonProfile {
  relativeStrength: number;
  muscularEndurance: number;
  balanceControl: number;
  jointMobility: number;
  bodyTension: number;
  skillTechnique: number;
}

interface ResultsHexagonProps {
  profile: HexagonProfile;
}

export default function ResultsHexagon({ profile }: ResultsHexagonProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const categories = [
    { key: 'relativeStrength', label: 'Relative Strength', value: profile.relativeStrength },
    { key: 'muscularEndurance', label: 'Muscular Endurance', value: profile.muscularEndurance },
    { key: 'balanceControl', label: 'Balance Control', value: profile.balanceControl },
    { key: 'jointMobility', label: 'Joint Mobility', value: profile.jointMobility },
    { key: 'bodyTension', label: 'Body Tension', value: profile.bodyTension },
    { key: 'skillTechnique', label: 'Skill Technique', value: profile.skillTechnique },
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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Skill Hexagon</h3>

      <svg
        viewBox="0 0 400 450"
        className="w-full h-auto"
        style={{ maxWidth: '400px', margin: '0 auto' }}
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
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: animated ? 1 : 0,
            transform: animated ? 'scale(1)' : 'scale(0)',
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
            className="transition-all duration-1000 ease-out"
            style={{
              opacity: animated ? 1 : 0,
              transitionDelay: `${i * 100}ms`,
            }}
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const angle = startAngle + angleStep * i;
          const labelRadius = maxRadius + 30;
          const labelX = centerX + Math.cos(angle) * labelRadius;
          const labelY = centerY + Math.sin(angle) * labelRadius;

          return (
            <g key={i}>
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-slate-700"
              >
                {p.label}
              </text>
              <text
                x={labelX}
                y={labelY + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold fill-blue-600"
              >
                {p.value.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 text-center text-sm text-slate-600">
        <p>This hexagon shows your current skill levels across 6 key calisthenics dimensions.</p>
      </div>
    </Card>
  );
}
