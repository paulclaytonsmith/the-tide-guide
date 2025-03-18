'use client';

import React, { useState, useEffect, useRef } from 'react';
import './ChartDrawing.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface ChartDrawingProps {
  data: Point[];
  contentWidth: number;
}

const RANGE_MULTIPLIER = 2;           // Extends range in both directions
const TOP_OFFSET_HEIGHT = 24;         // Offset from top of chart to start drawing in pixels
const BOTTOM_OFFSET_PERCENTAGE = 0.3; // Offset from bottom of chart to end drawing in percentage of chart height

export const ChartDrawing: React.FC<ChartDrawingProps> = ({ data, contentWidth }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: (window.innerWidth * contentWidth) / 100, // Convert vw to pixels
    height: 0 // Will be set after measuring container
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: (window.innerWidth * contentWidth) / 100, // Convert vw to pixels
          height: containerRef.current.clientHeight
        });
      }
    };

    // Initial update
    updateDimensions();

    // Update on viewport changes
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [contentWidth]);

  // Helper function to calculate y position with offsets
  const calculateYPosition = (height: number, displayMin: number, heightScale: number, availableHeight: number) => {
    // First scale the height to the available drawing space
    const scaledHeight = (height - displayMin) * heightScale;
    // Then position it with the top offset
    return TOP_OFFSET_HEIGHT + (availableHeight - scaledHeight);
  };

  // Scale points to SVG dimensions
  const getScaledPath = () => {
    if (data.length === 0) return '';

    // Sort all points by time to ensure correct order
    const sortedData = [...data].sort((a, b) => a.time.getTime() - b.time.getTime());
    if (sortedData.length === 0) return '';

    // Scale time values to width
    const timeRange = data[data.length - 1].time.getTime() - data[0].time.getTime();
    const timeScale = dimensions.width / timeRange;
    
    // Scale height values to SVG height with multiplier
    const maxHeight = Math.max(...data.map(p => p.height));
    const minHeight = Math.min(...data.map(p => p.height));
    const actualRange = maxHeight - minHeight;
    
    // Calculate the extended range
    const rangeExtension = (actualRange * (RANGE_MULTIPLIER - 1)) / 2;
    const displayMin = minHeight - rangeExtension;
    const displayMax = maxHeight + rangeExtension;
    const heightRange = displayMax - displayMin;
    
    // Calculate available drawing height after offsets
    const bottomOffset = dimensions.height * BOTTOM_OFFSET_PERCENTAGE;
    const availableHeight = dimensions.height - TOP_OFFSET_HEIGHT - bottomOffset;
    
    // Scale heights to fit available drawing height
    const heightScale = availableHeight / heightRange;

    // Create path starting from the first point
    const pathPoints = [];
    
    // Start at the bottom left
    pathPoints.push(`M 0 ${dimensions.height}`);

    if (sortedData.length > 0) {
      // Move to first point
      const firstPoint = sortedData[0];
      const firstX = (firstPoint.time.getTime() - data[0].time.getTime()) * timeScale;
      const firstY = calculateYPosition(firstPoint.height, displayMin, heightScale, availableHeight);
      pathPoints.push(`L ${firstX} ${firstY}`);

      // Create smooth curve through all points
      for (let i = 0; i < sortedData.length - 1; i++) {
        const current = sortedData[i];
        const next = sortedData[i + 1];
        
        const currentX = (current.time.getTime() - data[0].time.getTime()) * timeScale;
        const currentY = calculateYPosition(current.height, displayMin, heightScale, availableHeight);
        const nextX = (next.time.getTime() - data[0].time.getTime()) * timeScale;
        const nextY = calculateYPosition(next.height, displayMin, heightScale, availableHeight);

        // Get points before and after for tangent calculation
        const prev = sortedData[Math.max(0, i - 1)];
        const after = sortedData[Math.min(sortedData.length - 1, i + 2)];
        
        // Calculate tangents
        const prevX = (prev.time.getTime() - data[0].time.getTime()) * timeScale;
        const prevY = calculateYPosition(prev.height, displayMin, heightScale, availableHeight);
        const afterX = (after.time.getTime() - data[0].time.getTime()) * timeScale;
        const afterY = calculateYPosition(after.height, displayMin, heightScale, availableHeight);

        // Calculate the slope of the line between previous and next points
        const dx = nextX - currentX;
        const dy = nextY - currentY;
        const prevDx = currentX - prevX;
        const prevDy = currentY - prevY;
        const nextDx = afterX - nextX;
        const nextDy = afterY - nextY;

        // Calculate the average slope to smooth transitions
        const prevSlope = prevDx !== 0 ? prevDy / prevDx : 0;
        const nextSlope = dx !== 0 ? dy / dx : 0;
        const afterSlope = nextDx !== 0 ? nextDy / nextDx : 0;

        // Use weighted average for smoother transitions
        const weightedSlope1 = (prevSlope + nextSlope) / 2;
        const weightedSlope2 = (nextSlope + afterSlope) / 2;

        // Calculate control points using weighted slopes
        const thirdX = dx / 3;
        const controlX1 = currentX + thirdX;
        const controlY1 = currentY + (thirdX * weightedSlope1);
        const controlX2 = nextX - thirdX;
        const controlY2 = nextY - (thirdX * weightedSlope2);

        pathPoints.push(`C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${nextX} ${nextY}`);
      }
    }
    
    // Add bottom right point and close the path
    const bottomY = dimensions.height;
    pathPoints.push(`L ${dimensions.width} ${bottomY}`);
    pathPoints.push(`L 0 ${bottomY}`);
    pathPoints.push('Z');

    return pathPoints.join(' ');
  };

  return (
    <div className="chart-drawing" ref={containerRef}>
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
        {data.length > 0 && data
          .filter(point => point.type === "High" || point.type === "Low")
          .map((point, index) => {
            const timeRange = data[data.length - 1].time.getTime() - data[0].time.getTime();
            const timeScale = dimensions.width / timeRange;

            const maxHeight = Math.max(...data.map(p => p.height));
            const minHeight = Math.min(...data.map(p => p.height));
            const actualRange = maxHeight - minHeight;
            const rangeExtension = (actualRange * (RANGE_MULTIPLIER - 1)) / 2;
            const displayMin = minHeight - rangeExtension;
            const displayMax = maxHeight + rangeExtension;
            const heightRange = displayMax - displayMin;
            const bottomOffset = dimensions.height * BOTTOM_OFFSET_PERCENTAGE;
            const availableHeight = dimensions.height - TOP_OFFSET_HEIGHT - bottomOffset;
            const heightScale = availableHeight / heightRange;

            const x = (point.time.getTime() - data[0].time.getTime()) * timeScale;
            const y = calculateYPosition(point.height, displayMin, heightScale, availableHeight);

            const time = point.time.toLocaleTimeString([], { 
              hour: 'numeric',
              minute: '2-digit',
              hour12: true 
            });

            return (
              <g key={index}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="4" 
                  fill="white" 
                  stroke="var(--color-blue)" 
                  strokeWidth="2"
                />
              </g>
            );
          })}
       
      </svg>
    </div>
  );
}; 