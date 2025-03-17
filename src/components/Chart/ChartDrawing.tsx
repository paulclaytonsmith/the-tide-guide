'use client';

import React from 'react';
import './ChartDrawing.css';

interface Point {
  time: number;
  height: number;
}

// Dummy data representing tide heights over time
const dummyData: Point[] = [
  { time: 0, height: 2 },
  { time: 1, height: 4 },
  { time: 2, height: 3 },
  { time: 3, height: 5 },
  { time: 4, height: 2 },
  { time: 5, height: 4 },
  { time: 6, height: 3 },
];

export const ChartDrawing: React.FC = () => {
  // SVG dimensions - using viewport units
  const width = window.innerHeight * 2; // 200vh
  const height = 400;

  // Scale points to SVG dimensions
  const getScaledPath = () => {
    // Scale time values to width
    const timeScale = width / (dummyData.length - 1);
    
    // Scale height values to SVG height (leaving some padding)
    const maxHeight = Math.max(...dummyData.map(p => p.height));
    const minHeight = Math.min(...dummyData.map(p => p.height));
    const heightRange = maxHeight - minHeight;
    const heightScale = (height * 0.6) / heightRange;  // Use 60% of height for wave

    // Create path starting from the first point
    const pathPoints = dummyData.map((point, i) => {
      const x = point.time * timeScale;
      const y = height - (point.height - minHeight) * heightScale;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    // Close the path by adding bottom corners
    return `${pathPoints.join(' ')} L ${width} ${height} L 0 ${height} Z`;
  };

  return (
    <div className="chart-drawing">
      <svg width={width} height={height} preserveAspectRatio="none">
        <path
          d={getScaledPath()}
          fill="var(--color-blue)"
          className="wave-path"
        />
      </svg>
    </div>
  );
}; 