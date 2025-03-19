'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ChartDrawing.css';
import { CHART_CONFIG, ANIMATION_CONFIG, INITIAL_WAVE_CONFIG } from './config';
import { motion } from 'framer-motion';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface ChartDrawingProps {
  data: Point[];
  contentWidth: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  isInitialLoad: boolean;
}

interface AnimatedPathProps {
  d: string;
  fill: string;
  className: string;
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
    width: (window.innerWidth * contentWidth) / 100,
    height: 0
  });

  console.log('ChartDrawing render:', { isInitialLoad, dataLength: data.length });

  // Helper function to calculate y position with offsets
  const calculateYPosition = (height: number, displayMin: number, heightScale: number, availableHeight: number) => {
    const scaledHeight = (height - displayMin) * heightScale;
    return CHART_CONFIG.topOffset + (availableHeight - scaledHeight);
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

  const getInitialWavePath = () => {
    if (dimensions.width === 0) return '';
    
    const amplitude = dimensions.height * INITIAL_WAVE_CONFIG.amplitude;
    const frequency = INITIAL_WAVE_CONFIG.frequency;
    const points = [];
    
    points.push(`M 0 ${dimensions.height}`); // Start bottom left
    
    // Create smooth sine wave with cubic curves
    const numPoints = 50; // We need fewer points when using cubic curves
    const dx = dimensions.width / numPoints;
    
    // Start at the first point
    const startY = (dimensions.height / 2) + 
      amplitude * Math.sin(0);
    points.push(`L 0 ${startY}`);
    
    // Create cubic curves between points
    for (let i = 0; i < numPoints; i++) {
      const x1 = i * dx;
      const x2 = (i + 1) * dx;
      
      // Calculate points
      const y1 = (dimensions.height / 2) + 
        amplitude * Math.sin((x1 / dimensions.width) * frequency);
      const y2 = (dimensions.height / 2) + 
        amplitude * Math.sin((x2 / dimensions.width) * frequency);
      
      // Calculate control points using the derivative of the sine function
      const derivative = frequency * amplitude / dimensions.width;
      const controlLen = dx / 3;
      
      const c1x = x1 + controlLen;
      const c1y = y1 + Math.cos((x1 / dimensions.width) * frequency) * derivative * controlLen;
      
      const c2x = x2 - controlLen;
      const c2y = y2 - Math.cos((x2 / dimensions.width) * frequency) * derivative * controlLen;
      
      points.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`);
    }
    
    // Close the path
    points.push(`L ${dimensions.width} ${dimensions.height}`);
    points.push(`L 0 ${dimensions.height}`);
    points.push('Z');
    
    return points.join(' ');
  };

  // Calculate the current path
  const currentPath = useMemo(() => {
    console.log('Calculating path:', { isInitialLoad });
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
        <motion.path
          d={currentPath}
          fill="var(--color-blue)"
          className="wave-path"
          initial={false}
          animate={{ d: currentPath }}
          transition={ANIMATION_CONFIG.wave.spring}
          onAnimationStart={() => {
            console.log('Wave animation started:', { 
              isInitialLoad,
              pathLength: currentPath.length,
              dataLength: data.length,
              firstHeight: data[0]?.height,
              lastHeight: data[data.length - 1]?.height
            });
            onAnimationStart?.();
          }}
          onAnimationComplete={() => {
            console.log('Wave animation completed:', { 
              isInitialLoad,
              pathLength: currentPath.length,
              dataLength: data.length,
              firstHeight: data[0]?.height,
              lastHeight: data[data.length - 1]?.height
            });
            onAnimationComplete?.();
          }}
        />
      </svg>
    </div>
  );
}; 