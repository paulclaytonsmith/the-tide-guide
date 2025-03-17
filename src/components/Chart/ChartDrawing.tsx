'use client';

import React, { useState, useEffect } from 'react';
import './ChartDrawing.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low";
}

interface ChartDrawingProps {
  data: Point[];
}

export const ChartDrawing: React.FC<ChartDrawingProps> = ({ data }) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 3, // 300vw
    height: window.innerHeight * 0.5
  });

  useEffect(() => {
    const updateDimensions = () => {
      const vh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vh')) || window.innerHeight * 0.01;
      const height = vh * 50; // 50vh equivalent
      setDimensions({
        width: window.innerWidth * 3, // 300vw
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
    if (data.length === 0) return '';

    // Get time range (yesterday midnight to day+4 midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const fourDaysAfter = new Date(today);
    fourDaysAfter.setDate(fourDaysAfter.getDate() + 4);

    // Total time range (for calculating insets)
    const totalTimeRange = fourDaysAfter.getTime() - yesterday.getTime();

    // Find the second to last tide from yesterday
    const yesterdayTides = data.filter(d => 
      d.time >= yesterday && d.time < today
    );
    const startTide = yesterdayTides.length > 1 
      ? yesterdayTides[yesterdayTides.length - 2] 
      : yesterdayTides[0];

    // Find the second tide of day+3
    const threeDaysAfter = new Date(today);
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);
    const day3Tides = data.filter(d => 
      d.time.getTime() >= threeDaysAfter.getTime() && 
      d.time.getTime() < threeDaysAfter.getTime() + (24 * 60 * 60 * 1000)
    );
    const endTide = day3Tides.length > 1 ? day3Tides[1] : day3Tides[0];

    if (!startTide || !endTide) return '';

    // Calculate insets as percentages of total width
    const leftInset = ((startTide.time.getTime() - yesterday.getTime()) / totalTimeRange) * dimensions.width;
    const rightInset = ((fourDaysAfter.getTime() - endTide.time.getTime()) / totalTimeRange) * dimensions.width;

    // Available width for drawing (total width minus insets)
    const drawingWidth = dimensions.width - (leftInset + rightInset);

    // Scale time values to width, using actual tide points instead of midnight
    const timeScale = drawingWidth / (endTide.time.getTime() - startTide.time.getTime());
    
    // Scale height values to SVG height
    const maxHeight = Math.max(...data.map(p => p.height));
    const minHeight = Math.min(...data.map(p => p.height));
    const heightRange = maxHeight - minHeight;
    const heightPadding = heightRange * 0.1; // 10% padding
    const heightScale = (dimensions.height * 0.8) / (heightRange + heightPadding * 2);

    // Create path starting from the first point
    const pathPoints = data
      .filter(point => point.time >= startTide.time && point.time <= endTide.time)
      .map((point, i) => {
        const x = leftInset + ((point.time.getTime() - startTide.time.getTime()) * timeScale);
        const y = dimensions.height - ((point.height - minHeight + heightPadding) * heightScale);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      });

    // Close the path by adding bottom corners
    return `${pathPoints.join(' ')} L ${dimensions.width - rightInset} ${dimensions.height} L ${leftInset} ${dimensions.height} Z`;
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