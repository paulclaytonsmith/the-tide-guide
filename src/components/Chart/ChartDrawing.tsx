'use client';

import React, { useState, useEffect, useRef } from 'react';
import './ChartDrawing.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low";
}

interface ChartDrawingProps {
  data: Point[];
}

const RANGE_MULTIPLIER = 2;           // Extends range 3x in both directions
const TOP_OFFSET_HEIGHT = 24;         // Offset from top of chart to start drawing
const BOTTOM_OFFSET_PERCENTAGE = 0.3; // Offset from bottom of chart to end drawing

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

    // Helper function to calculate y position with offsets
    const calculateYPosition = (height: number) => {
      // First scale the height to the available drawing space
      const scaledHeight = (height - displayMin) * heightScale;
      // Then position it with the top offset
      return TOP_OFFSET_HEIGHT + (availableHeight - scaledHeight);
    };

    // Find highest and lowest tides in the filtered set
    const filteredPoints = data.filter(point => point.time >= startTide.time && point.time <= endTide.time);
    const lowestTide = filteredPoints.reduce((min, p) => p.height < min.height ? p : min, filteredPoints[0]);
    const highestTide = filteredPoints.reduce((max, p) => p.height > max.height ? p : max, filteredPoints[0]);

    console.log('Tide Range Debug:', {
      lowestTide: {
        height: lowestTide.height,
        time: lowestTide.time.toLocaleString(),
        yPos: calculateYPosition(lowestTide.height)
      },
      highestTide: {
        height: highestTide.height,
        time: highestTide.time.toLocaleString(),
        yPos: calculateYPosition(highestTide.height)
      },
      bounds: {
        displayMin,
        displayMax,
        actualMin: minHeight,
        actualMax: maxHeight,
        multiplier: RANGE_MULTIPLIER,
        rangeExtension,
        topOffset: TOP_OFFSET_HEIGHT,
        bottomOffset,
        availableHeight,
        containerHeight: dimensions.height
      }
    });

    console.log('All Tides Y Positions:', filteredPoints.map(p => ({
      height: p.height.toFixed(2),
      time: p.time.toLocaleString(),
      yPos: calculateYPosition(p.height).toFixed(2),
      type: p.type
    })));

    // Create path starting from the first point
    const pathPoints = data
      .filter(point => point.time >= startTide.time && point.time <= endTide.time)
      .map((point, i) => {
        const x = leftInset + ((point.time.getTime() - startTide.time.getTime()) * timeScale);
        const y = calculateYPosition(point.height);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      });

    // Close the path by adding bottom corners at the bottom of the drawing area
    const bottomY = dimensions.height;
    return `${pathPoints.join(' ')} L ${dimensions.width - rightInset} ${bottomY} L ${leftInset} ${bottomY} Z`;
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