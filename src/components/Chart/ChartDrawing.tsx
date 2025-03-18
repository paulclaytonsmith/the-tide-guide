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
}

const RANGE_MULTIPLIER = 2;           // Extends range in both directions
const TOP_OFFSET_HEIGHT = 24;         // Offset from top of chart to start drawing in pixels
const BOTTOM_OFFSET_PERCENTAGE = 0.3; // Offset from bottom of chart to end drawing in percentage of chart height

export const ChartDrawing: React.FC<ChartDrawingProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 3, // 300vw
    height: 0 // Will be set after measuring container
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth * 3, // 300vw
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
  }, []);

  // Scale points to SVG dimensions
  const getScaledPath = () => {
    if (data.length === 0) return '';

    // Get time range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const threeDaysAfter = new Date(today);
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

    // Get yesterday's tides
    const yesterdayTides = data.filter(point => 
      point.time >= yesterday && point.time < today
    ).sort((a, b) => a.time.getTime() - b.time.getTime());

    // Get the second to last tide from yesterday
    const startFromTide = yesterdayTides.length > 1 
      ? yesterdayTides[yesterdayTides.length - 2] 
      : yesterdayTides[0];

    // Get day+3 tides
    const day3Tides = data.filter(point => 
      point.time.getTime() >= threeDaysAfter.getTime() && 
      point.time.getTime() < threeDaysAfter.getTime() + (24 * 60 * 60 * 1000)
    ).slice(0, 2);

    // Filter points to match reference implementation's range
    const filteredPoints = startFromTide 
      ? data.filter(point => 
          point.time >= startFromTide.time && 
          (day3Tides.length === 0 || point.time <= day3Tides[day3Tides.length - 1].time)
        ).sort((a, b) => a.time.getTime() - b.time.getTime())
      : [];

    if (filteredPoints.length === 0) return '';
    
    // Scale time values to width
    const timeScale = dimensions.width / (
      (day3Tides.length > 0 ? day3Tides[day3Tides.length - 1].time.getTime() : threeDaysAfter.getTime()) - 
      (startFromTide ? startFromTide.time.getTime() : yesterday.getTime())
    );
    
    // Scale height values to SVG height with multiplier
    const maxHeight = Math.max(...filteredPoints.map(p => p.height));
    const minHeight = Math.min(...filteredPoints.map(p => p.height));
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

    // Helper function to calculate y position with offsets
    const calculateYPosition = (height: number) => {
      // First scale the height to the available drawing space
      const scaledHeight = (height - displayMin) * heightScale;
      // Then position it with the top offset
      return TOP_OFFSET_HEIGHT + (availableHeight - scaledHeight);
    };

    // Create path starting from the first point
    const pathPoints = [];
    
    // Start at the bottom left
    pathPoints.push(`M 0 ${dimensions.height}`);
    
    // Add all the tide points
    filteredPoints.forEach(point => {
      const x = (point.time.getTime() - (startFromTide ? startFromTide.time.getTime() : yesterday.getTime())) * timeScale;
      const y = calculateYPosition(point.height);
      pathPoints.push(`L ${x} ${y}`);
    });
    
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
      </svg>
    </div>
  );
}; 