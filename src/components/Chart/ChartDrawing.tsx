'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ChartDrawing.css';
import { CHART_CONFIG, ANIMATION_CONFIG } from './config';
import { motion } from 'framer-motion';
import { HourlyPoint } from './types';

interface ChartDrawingProps {
  data: HourlyPoint[];
  contentWidth: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  isInitialLoad: boolean;
  onMouseMove?: (x: number) => void;
  onMouseLeave?: () => void;
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

// Helper function to generate exaggerated data points for initial animation
const generateExaggeratedPoints = (data: HourlyPoint[]): HourlyPoint[] => {
  if (data.length === 0) return [];
  
  // Calculate the mean height
  const meanHeight = data.reduce((sum, point) => sum + point.height, 0) / data.length;
  
  // Create exaggerated points by amplifying the distance from the mean
  return data.map(point => ({
    ...point,
    height: meanHeight + (point.height - meanHeight) * 2.5 // Amplify deviation from mean by 2.5x
  }));
};

// Helper function to calculate y position with offsets
const calculateYPosition = (height: number, displayMin: number, heightScale: number, availableHeight: number, isInitialLoad: boolean) => {
  const scaledHeight = (height - displayMin) * heightScale;
  if (isInitialLoad) {
    // Center the wave vertically in the available space
    const centerY = CHART_CONFIG.topOffset + (availableHeight / 2);
    return centerY + ((2 - height) * heightScale); // 2 is the mean height
  }
  return CHART_CONFIG.topOffset + (availableHeight - scaledHeight);
};

// Path segment calculation function
const calculatePathSegments = (
  pointData: HourlyPoint[], 
  dims: { width: number; height: number }, 
  isInitial: boolean
): PathSegment[] => {
  if (pointData.length === 0) return [];

  const timeRange = pointData[pointData.length - 1].time.getTime() - pointData[0].time.getTime();
  const timeScale = dims.width / timeRange;
  
  const maxHeight = Math.max(...pointData.map(p => p.height));
  const minHeight = Math.min(...pointData.map(p => p.height));
  const actualRange = maxHeight - minHeight;
  
  const effectiveRangeMultiplier = isInitial ? 1.05 : CHART_CONFIG.rangeMultiplier;
  const rangeExtension = (actualRange * (effectiveRangeMultiplier - 1)) / 2;
  const displayMin = minHeight - rangeExtension;
  const displayMax = maxHeight + rangeExtension;
  const heightRange = displayMax - displayMin;
  
  const bottomOffset = dims.height * CHART_CONFIG.bottomOffset;
  const availableHeight = dims.height - CHART_CONFIG.topOffset - bottomOffset;
  
  const heightScale = isInitial
    ? 50
    : availableHeight / heightRange;

  const segments: PathSegment[] = [];
  const sortedPoints = [...pointData].sort((a, b) => a.time.getTime() - b.time.getTime());

  if (sortedPoints.length > 0) {
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const current = sortedPoints[i];
      const next = sortedPoints[i + 1];
      
      const currentX = (current.time.getTime() - pointData[0].time.getTime()) * timeScale;
      const currentY = calculateYPosition(current.height, displayMin, heightScale, availableHeight, isInitial);
      const nextX = (next.time.getTime() - pointData[0].time.getTime()) * timeScale;
      const nextY = calculateYPosition(next.height, displayMin, heightScale, availableHeight, isInitial);

      const prev = sortedPoints[Math.max(0, i - 1)];
      const after = sortedPoints[Math.min(sortedPoints.length - 1, i + 2)];
      
      const prevX = (prev.time.getTime() - pointData[0].time.getTime()) * timeScale;
      const prevY = calculateYPosition(prev.height, displayMin, heightScale, availableHeight, isInitial);
      const afterX = (after.time.getTime() - pointData[0].time.getTime()) * timeScale;
      const afterY = calculateYPosition(after.height, displayMin, heightScale, availableHeight, isInitial);

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
};

export const ChartDrawing: React.FC<ChartDrawingProps> = ({ 
  data, 
  contentWidth,
  onAnimationStart,
  onAnimationComplete,
  isInitialLoad,
  onMouseMove,
  onMouseLeave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    ...CHART_CONFIG.defaultDimensions,
    width: (window.innerWidth * contentWidth) / 100
  });

  // Generate initial exaggerated path segments
  const initialPathSegments = useMemo(() => {
    const exaggeratedData = generateExaggeratedPoints(data);
    return calculatePathSegments(exaggeratedData, dimensions, isInitialLoad);
  }, [data, dimensions, isInitialLoad]);

  // Generate final path segments from actual data
  const finalPathSegments = useMemo(() => {
    return calculatePathSegments(data, dimensions, isInitialLoad);
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

    // Extend the path slightly beyond the container width to prevent gaps
    pathPoints.push(`L ${dimensions.width + 1} ${dimensions.height}`);
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
    <motion.div 
      className="chart-drawing" 
      ref={containerRef}
      initial={ANIMATION_CONFIG.chartDrawing.initial}
      animate={ANIMATION_CONFIG.chartDrawing.animate}
    >
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        preserveAspectRatio="none"
      >
        {dimensions.height > 0 && (
          <motion.path
            d={getPathFromSegments(initialPathSegments)}
            fill="var(--color-blue)"
            className="wave-path"
            initial={{ d: getPathFromSegments(initialPathSegments) }}
            animate={{ d: getPathFromSegments(finalPathSegments) }}
            transition={{
              d: {
                type: "spring",
                ...(isInitialLoad ? ANIMATION_CONFIG.wave.spring.initial : ANIMATION_CONFIG.wave.spring.location)
              }
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              onMouseLeave?.();
            }}
            onMouseMove={(e: React.MouseEvent<SVGPathElement>) => {
              e.stopPropagation();
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) {
                const x = e.clientX - rect.left;
                onMouseMove?.(x);
              }
            }}
            onAnimationStart={() => {
              onAnimationStart?.();
            }}
            onAnimationComplete={onAnimationComplete}
          />
        )}
      </svg>
    </motion.div>
  );
}; 