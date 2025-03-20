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

interface ControlPoint {
  x: number;
  y: number;
}

interface PathSegment {
  control1: ControlPoint;
  control2: ControlPoint;
  end: ControlPoint;
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
    if (isInitialLoad) {
      // Center the wave vertically in the available space
      const centerY = CHART_CONFIG.topOffset + (availableHeight / 2);
      return centerY + ((2 - height) * heightScale); // 2 is the mean height
    }
    return CHART_CONFIG.topOffset + (availableHeight - scaledHeight);
  };

  // Calculate path segments with control points
  const pathSegments = useMemo(() => {
    if (data.length === 0) return [];

    const timeRange = data[data.length - 1].time.getTime() - data[0].time.getTime();
    const timeScale = dimensions.width / timeRange;
    
    const maxHeight = Math.max(...data.map(p => p.height));
    const minHeight = Math.min(...data.map(p => p.height));
    const actualRange = maxHeight - minHeight;
    
    // Use a much smaller range multiplier for initial data
    const effectiveRangeMultiplier = isInitialLoad ? 1.05 : CHART_CONFIG.rangeMultiplier;
    const rangeExtension = (actualRange * (effectiveRangeMultiplier - 1)) / 2;
    const displayMin = minHeight - rangeExtension;
    const displayMax = maxHeight + rangeExtension;
    const heightRange = displayMax - displayMin;
    
    const bottomOffset = dimensions.height * CHART_CONFIG.bottomOffset;
    const availableHeight = dimensions.height - CHART_CONFIG.topOffset - bottomOffset;
    
    // For initial data, use a fixed scale in pixels per foot
    // For live data, scale to fill available height
    const heightScale = isInitialLoad
      ? 50  // 50 pixels per foot for initial data
      : availableHeight / heightRange;

    console.log('Height Calculations:', {
      isInitialLoad,
      dimensions: {
        width: dimensions.width,
        height: dimensions.height
      },
      heights: {
        min: minHeight,
        max: maxHeight,
        actualRange,
        displayMin,
        displayMax,
        heightRange
      },
      scaling: {
        effectiveRangeMultiplier,
        bottomOffset,
        availableHeight,
        heightScale,
        pixelsPerFoot: heightScale
      }
    });

    const segments: PathSegment[] = [];

    if (sortedData.length > 0) {
      for (let i = 0; i < sortedData.length - 1; i++) {
        const current = sortedData[i];
        const next = sortedData[i + 1];
        
        const currentX = (current.time.getTime() - data[0].time.getTime()) * timeScale;
        const currentY = calculateYPosition(current.height, displayMin, heightScale, availableHeight);
        const nextX = (next.time.getTime() - data[0].time.getTime()) * timeScale;
        const nextY = calculateYPosition(next.height, displayMin, heightScale, availableHeight);

        const prev = sortedData[Math.max(0, i - 1)];
        const after = sortedData[Math.min(sortedData.length - 1, i + 2)];
        
        const prevX = (prev.time.getTime() - data[0].time.getTime()) * timeScale;
        const prevY = calculateYPosition(prev.height, displayMin, heightScale, availableHeight);
        const afterX = (after.time.getTime() - data[0].time.getTime()) * timeScale;
        const afterY = calculateYPosition(after.height, displayMin, heightScale, availableHeight);

        const dx = nextX - currentX;
        const dy = nextY - currentY;
        const prevDx = currentX - prevX;
        const prevDy = currentY - prevY;
        const nextDx = afterX - nextX;
        const nextDy = afterY - nextY;

        const prevSlope = prevDx !== 0 ? prevDy / prevDx : 0;
        const nextSlope = dx !== 0 ? dy / dx : 0;
        const afterSlope = nextDx !== 0 ? nextDy / nextDx : 0;

        const weightedSlope1 = (prevSlope + nextSlope) / 2;
        const weightedSlope2 = (nextSlope + afterSlope) / 2;

        const thirdX = dx / CHART_CONFIG.smoothFactor;
        const controlX1 = currentX + thirdX;
        const controlY1 = currentY + (thirdX * weightedSlope1);
        const controlX2 = nextX - thirdX;
        const controlY2 = nextY - (thirdX * weightedSlope2);

        segments.push({
          control1: { x: controlX1, y: controlY1 },
          control2: { x: controlX2, y: controlY2 },
          end: { x: nextX, y: nextY }
        });
      }
    }

    return segments;
  }, [data, dimensions, isInitialLoad]);

  // Generate SVG path from segments
  const getPathFromSegments = (segments: PathSegment[]) => {
    if (segments.length === 0) return '';

    const pathPoints = [];
    pathPoints.push(`M 0 ${dimensions.height}`);

    if (segments.length > 0) {
      const firstSegment = segments[0];
      pathPoints.push(`L ${firstSegment.control1.x} ${firstSegment.control1.y}`);

      segments.forEach(segment => {
        pathPoints.push(`C ${segment.control1.x} ${segment.control1.y} ${segment.control2.x} ${segment.control2.y} ${segment.end.x} ${segment.end.y}`);
      });
    }

    pathPoints.push(`L ${dimensions.width} ${dimensions.height}`);
    pathPoints.push(`L 0 ${dimensions.height}`);
    pathPoints.push('Z');

    return pathPoints.join(' ');
  };

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
            d={getPathFromSegments(pathSegments)}
            fill="var(--color-blue)"
            className="wave-path"
            initial={{ d: getPathFromSegments(pathSegments) }}
            animate={{ d: getPathFromSegments(pathSegments) }}
            transition={{
              d: {
                type: "spring",
                ...ANIMATION_CONFIG.wave.spring
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