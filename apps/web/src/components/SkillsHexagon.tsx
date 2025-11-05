'use client';

import React from 'react';

export interface HexagonValues {
  fuerzaRelativa: number; // 0-100
  resistenciaMuscular: number; // 0-100
  controlEquilibrio: number; // 0-100
  movilidadArticular: number; // 0-100
  tensionCorporal: number; // 0-100
  tecnica: number; // 0-100
}

interface SkillsHexagonProps {
  values: HexagonValues;
  size?: number; // SVG size
  gridLevels?: number; // number of concentric grid levels
  secondaryValues?: HexagonValues; // optional second polygon to compare
  primaryColor?: string; // stroke color for primary polygon
  secondaryColor?: string; // stroke color for secondary polygon
}

const AXES = [
  { key: 'fuerzaRelativa', label: 'Fuerza relativa' },
  { key: 'resistenciaMuscular', label: 'Resistencia muscular' },
  { key: 'controlEquilibrio', label: 'Control y equilibrio' },
  { key: 'movilidadArticular', label: 'Movilidad articular' },
  { key: 'tensionCorporal', label: 'Tensión corporal / core' },
  { key: 'tecnica', label: 'Técnica / Habilidad específica' },
] as const;

export default function SkillsHexagon({ values, size = 360, gridLevels = 4, secondaryValues, primaryColor = '#6366F1', secondaryColor = '#F59E0B' }: SkillsHexagonProps) {
  const radius = size / 2 - 24; // padding for labels
  const center = { x: size / 2, y: size / 2 };

  // Compute angle for each axis (pointing upwards for index 0)
  const angleForIndex = (i: number) => ((-90 + i * (360 / AXES.length)) * Math.PI) / 180;

  // Convert value (0-100) to a point on the axis
  const pointFor = (i: number, val: number) => {
    const a = angleForIndex(i);
    const r = (val / 100) * radius;
    return {
      x: center.x + Math.cos(a) * r,
      y: center.y + Math.sin(a) * r,
    };
  };

  // Data polygon points (primary)
  const dataPoints = AXES.map((axis, i) => pointFor(i, values[axis.key]));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Secondary polygon points (optional)
  const secondaryPath = secondaryValues
    ? AXES.map((axis, i) => pointFor(i, secondaryValues[axis.key]))
        .map((p) => `${p.x},${p.y}`)
        .join(' ')
    : null;

  // Grid hexagons
  const gridPolygons = Array.from({ length: gridLevels }, (_, levelIdx) => {
    const ratio = (levelIdx + 1) / gridLevels;
    const pts = AXES.map((_, i) => {
      const a = angleForIndex(i);
      const r = ratio * radius;
      return {
        x: center.x + Math.cos(a) * r,
        y: center.y + Math.sin(a) * r,
      };
    });
    const path = pts.map((p) => `${p.x},${p.y}`).join(' ');
    return path;
  });

  return (
    <div className="relative w-full flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Axes lines */}
        {AXES.map((axis, i) => {
          const end = pointFor(i, 100);
          return (
            <line
              key={`axis-${axis.key}`}
              x1={center.x}
              y1={center.y}
              x2={end.x}
              y2={end.y}
              stroke="#CBD5E1" // slate-300
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Grid polygons */}
        {gridPolygons.map((poly, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={poly}
            fill="none"
            stroke="#E5E7EB" // gray-200
          />
        ))}

        {/* Data polygons */}
        <polygon
          points={dataPath}
          fill={primaryColor === '#6366F1' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.18)'}
          stroke={primaryColor}
          strokeWidth={2}
        />

        {secondaryPath && (
          <polygon
            points={secondaryPath}
            fill={secondaryColor === '#F59E0B' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.18)'}
            stroke={secondaryColor}
            strokeWidth={2}
          />
        )}

        {/* Axis labels */}
        {AXES.map((axis, i) => {
          const a = angleForIndex(i);
          const labelR = radius + 12; // place labels just outside
          const lx = center.x + Math.cos(a) * labelR;
          const ly = center.y + Math.sin(a) * labelR;
          const textAnchor = Math.cos(a) > 0.1 ? 'start' : Math.cos(a) < -0.1 ? 'end' : 'middle';
          const dy = Math.sin(a) > 0.3 ? '1em' : Math.sin(a) < -0.3 ? '-0.5em' : '0.35em';
          return (
            <text
              key={`label-${axis.key}`}
              x={lx}
              y={ly}
              fontSize={12}
              fill="#374151" // gray-700
              textAnchor={textAnchor as any}
              dy={dy}
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}