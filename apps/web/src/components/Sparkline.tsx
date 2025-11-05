"use client";

import React from 'react';

interface SparklineProps {
  values: number[]; // e.g., stars 0-5
  max?: number; // max value for scaling (default 5)
  width?: number; // default 120
  height?: number; // default 32
  color?: string; // stroke color
}

export default function Sparkline({ values, max = 5, width = 120, height = 32, color = '#6366F1' }: SparklineProps) {
  const len = values.length;
  if (len === 0) {
    return <svg width={width} height={height} />;
  }
  const padding = 4;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const stepX = len > 1 ? w / (len - 1) : 0;
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = padding + h - (Math.max(0, Math.min(max, v)) / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}