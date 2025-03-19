'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ChartDrawing.css';
import { CHART_CONFIG, ANIMATION_CONFIG } from './config';
import { motion } from 'framer-motion';

interface Point {
  time: Date;
  height: number;
  type: "Hourly";  // Only hourly points are used for drawing
}

interface ChartDrawingProps {
  data: Point[];
  contentWidth: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  isInitialLoad: boolean;
}

export const ChartDrawing: React.FC<ChartDrawingProps> = ({ 
  data, 
  contentWidth,
  onAnimationStart,
  onAnimationComplete,
  isInitialLoad 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    ...CHART_CONFIG.defaultDimensions,
    width: (window.innerWidth * contentWidth) / 100
  });

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [data]);

  const heightBounds = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0 };
    return data.reduce((acc, point) => ({
      min: Math.min(acc.min, point.height),
      max: Math.max(acc.max, point.height)
    }), { min: Infinity, max: -Infinity });
  }, [data]);

  // Helper function to calculate y position with offsets
  const calculateYPosition = (height: number, displayMin: number, heightScale: number, availableHeight: number) => {
    const scaledHeight = (height - displayMin) * heightScale;
    return CHART_CONFIG.topOffset + (availableHeight - scaledHeight);
  };

  // Scale points to SVG dimensions
  const getScaledPath = () => {
    if (data.length === 0) return '';

    // Scale time values to width
    const timeRange = data[data.length - 1].time.getTime() - data[0].time.getTime();
    const timeScale = dimensions.width / timeRange;
    
    // Scale height values to SVG height with multiplier
    const maxHeight = Math.max(...data.map(p => p.height));
    const minHeight = Math.min(...data.map(p => p.height));
    const actualRange = maxHeight - minHeight;
    
    // Calculate the extended range
    const rangeExtension = (actualRange * (CHART_CONFIG.rangeMultiplier - 1)) / 2;
    const displayMin = minHeight - rangeExtension;
    const displayMax = maxHeight + rangeExtension;
    const heightRange = displayMax - displayMin;
    
    // Calculate available drawing height after offsets
    const bottomOffset = dimensions.height * CHART_CONFIG.bottomOffset;
    const availableHeight = dimensions.height - CHART_CONFIG.topOffset - bottomOffset;
    
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
        const thirdX = dx / CHART_CONFIG.smoothFactor;
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

  // Calculate the current path
  const currentPath = useMemo(() => {
    return getScaledPath();
  }, [data, dimensions, isInitialLoad]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: (window.innerWidth * contentWidth) / 100,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [contentWidth]);

  return (
    <div className="chart-drawing" ref={containerRef}>
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        preserveAspectRatio="none"
      >
        {dimensions.height > 0 && (
          <motion.path
            d={currentPath}
            fill="var(--color-blue)"
            className="wave-path"
            initial={{ d: currentPath, scaleY: 0.8 }}
            animate={{ d: currentPath, scaleY: 1 }}
            transition={{
              ...ANIMATION_CONFIG.wave.spring,
              scaleY: {
                type: "spring",
                stiffness: 25,
                damping: 5,
                mass: 3
              }
            }}
            onAnimationStart={() => {
              onAnimationStart?.();
            }}
            onAnimationComplete={onAnimationComplete}
          />
        )}
      </svg>
    </div>
  );
}; 