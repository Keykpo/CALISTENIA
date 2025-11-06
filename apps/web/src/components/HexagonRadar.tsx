import React from 'react';

type HexagonValues = {
  relativeStrength: number;
  muscularEndurance: number;
  balanceControl: number;
  jointMobility: number;
  bodyTension: number;
  skillTechnique: number;
};

const labels = [
  'Relative Strength',
  'Muscular Endurance',
  'Balance & Control',
  'Joint Mobility',
  'Body Tension',
  'Skill Technique',
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

export default function HexagonRadar({
  values,
  size = 300,
  max = 10,
}: {
  values: HexagonValues;
  size?: number;
  max?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.4;
  const axes = [
    values.relativeStrength,
    values.muscularEndurance,
    values.balanceControl,
    values.jointMobility,
    values.bodyTension,
    values.skillTechnique,
  ];

  const points = axes.map((v, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const r = (v / max) * radius;
    return polarToCartesian(cx, cy, r, angle);
  });

  const outlinePoints = Array.from({ length: axes.length }, (_, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return polarToCartesian(cx, cy, radius, angle);
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');
  const outlinePath = outlinePoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full flex flex-col items-center">
      <svg width={size} height={size} role="img" aria-label="Hexagon profile radar chart">
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((r, idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={radius * r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Axes lines */}
        {outlinePoints.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={1} />
        ))}

        {/* Outline */}
        <polygon points={outlinePath} fill="none" stroke="#9ca3af" strokeWidth={1.5} />

        {/* Value polygon */}
        <polygon points={polygonPath} fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" strokeWidth={2} />

        {/* Labels */}
        {outlinePoints.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={p.x < cx ? 'end' : p.x > cx ? 'start' : 'middle'}
            dominantBaseline={p.y < cy ? 'text-after-edge' : 'text-before-edge'}
            fontSize={12}
            fill="#374151"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}