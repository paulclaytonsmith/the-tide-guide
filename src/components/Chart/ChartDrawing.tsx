'use client';

import React, { useState, useEffect } from 'react';
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
  const [dimensions, setDimensions] = useState({
    width: window.innerHeight * 2,
    height: window.innerHeight * 0.5
  });

  useEffect(() => {
    const updateDimensions = () => {
      const vh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vh')) || window.innerHeight * 0.01;
      const height = vh * 50; // 50vh equivalent
      setDimensions({
        width: window.innerHeight * 2, // 200vh
        height: height
      });
    };

    // Initial update
    updateDimensions();

    // Update on viewport changes
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Scale points to SVG dimensions
  const getScaledPath = () => {
    // Scale time values to width
    const timeScale = dimensions.width / (dummyData.length - 1);
    
    // Scale height values to SVG height (leaving some padding)
    const maxHeight = Math.max(...dummyData.map(p => p.height));
    const minHeight = Math.min(...dummyData.map(p => p.height));
    const heightRange = maxHeight - minHeight;
    const heightScale = (dimensions.height * 1) / heightRange;  // Use 100% of height for wave

    // Create path starting from the first point
    const pathPoints = dummyData.map((point, i) => {
      const x = point.time * timeScale;
      const y = dimensions.height - (point.height - minHeight) * heightScale;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    // Close the path by adding bottom corners
    return `${pathPoints.join(' ')} L ${dimensions.width} ${dimensions.height} L 0 ${dimensions.height} Z`;
  };

  return (
    <div className="chart-drawing">
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        preserveAspectRatio="none"
      >
        <path
          d={getScaledPath()}
          fill="var(--color-blue)"
          className="wave-path"
        />
      </svg>
    </div>
  );
}; 