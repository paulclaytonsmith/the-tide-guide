'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { TimeAxis } from './TimeAxis';
import { Grid } from './Grid';
import { ChartDrawing } from './ChartDrawing';
import { TideLabels } from './TideLabels';
import { Tooltip } from './Tooltip';
import { VIEWPORT_WIDTHS, CHART_CONFIG, TIME_AXIS_CONFIG } from './config';
import { generateInitialTideData } from '../../lib/initialTideData';
import { Point, HourlyPoint } from './types';
import './Chart.css';

interface ChartProps {
  tideData: Point[];
}

export const Chart: React.FC<ChartProps> = ({ tideData }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasStartedTransition, setHasStartedTransition] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [tooltipAlignRight, setTooltipAlignRight] = useState(false);

  // Use initial tide data when no real data is provided
  const currentTideData = useMemo(() => {
    return tideData.length === 0 ? generateInitialTideData().predictions : tideData;
  }, [tideData]);

  // Filter to only use hourly points for the wave drawing
  const hourlyData = useMemo(() => {
    if (currentTideData.length === 0) return [];
    return currentTideData.filter((point): point is HourlyPoint => point.type === "Hourly");
  }, [currentTideData]);

  // Keep all points for labels
  const allData = useMemo(() => {
    return currentTideData;
  }, [currentTideData]);

  // When tideData changes and it's not empty, we're no longer in initial load
  useEffect(() => {
    if (tideData.length > 0 && isInitialLoad && !hasStartedTransition) {
      setHasStartedTransition(true);
      setIsInitialLoad(false);
    }
  }, [tideData, isInitialLoad, hasStartedTransition, currentTideData]);

  // Get start and end times from the current dataset
  const startTime = currentTideData[0].time;
  const endTime = currentTideData[currentTideData.length - 1].time;

  // Find the midnight point and calculate its rate
  const midnightPoint = useMemo(() => {
    const midnight = currentTideData.find(point => {
      const hours = point.time.getHours();
      const minutes = point.time.getMinutes();
      return hours === 0 && minutes === 0;
    });

    if (!midnight) return null;

    const pointIndex = currentTideData.indexOf(midnight);
    const nextPoint = currentTideData[pointIndex + 1];
    const rate = nextPoint 
      ? (nextPoint.height - midnight.height) / 
        ((nextPoint.time.getTime() - midnight.time.getTime()) / (1000 * 60 * 60))
      : 0;

    return {
      point: midnight,
      rate
    };
  }, [currentTideData]);

  // Calculate offset to align midnight with the edge
  const { offsetPercentage, contentWidth } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTimeRange = endTime.getTime() - startTime.getTime();
    const timeToMidnight = today.getTime() - startTime.getTime();
    
    const beforeMidnightPercentage = (timeToMidnight / totalTimeRange);
    const totalWidth = VIEWPORT_WIDTHS * 100;
    const offsetPercentage = beforeMidnightPercentage * totalWidth;

    const pagePaddingPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-padding'));
    const pagePaddingVw = (pagePaddingPx / window.innerWidth) * 100;
    
    const totalOffset = Math.max(0, offsetPercentage - pagePaddingVw);
    
    return { 
      offsetPercentage: totalOffset,
      contentWidth: totalWidth
    };
  }, [startTime, endTime]);

  const handleAnimationStart = () => {
    setIsAnimating(true);
    // Start fading in labels after a longer delay
    setTimeout(() => {
      setShowLabels(true);
    }, 5000);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  // Find the closest point to the mouse position
  const findClosestPoint = (x: number) => {
    if (!x || currentTideData.length === 0) return null;

    const timeRange = endTime.getTime() - startTime.getTime();
    const timeScale = (contentWidth * window.innerWidth / 100) / timeRange;
    
    let closestPoint = currentTideData[0];
    let minDistance = Infinity;

    currentTideData.forEach(point => {
      const pointX = (point.time.getTime() - startTime.getTime()) * timeScale;
      const distance = Math.abs(pointX - x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    return closestPoint;
  };

  const handleMouseMove = (x: number) => {
    setMouseX(x);
    const closest = findClosestPoint(x);
    setHoveredPoint(closest);
    
    // Calculate tooltip alignment based on mouse position relative to viewport
    const viewportWidth = window.innerWidth;
    const scrollOffset = viewportWidth * (offsetPercentage / 100);
    const adjustedX = x - scrollOffset;
    setTooltipAlignRight(adjustedX > viewportWidth / 2);
  };

  const handleMouseLeave = () => {
    setMouseX(null);
    setHoveredPoint(null);
  };

  const handlePointHover = (point: Point | null, x?: number) => {
    setHoveredPoint(point);
    if (x !== undefined) {
      // For direct marker hovers, use the same viewport-relative calculation
      const viewportWidth = window.innerWidth;
      const scrollOffset = viewportWidth * (offsetPercentage / 100);
      const adjustedX = x - scrollOffset;
      setTooltipAlignRight(adjustedX > viewportWidth / 2);
    }
  };

  return (
    <div 
      className="chart-container"
      style={{
        '--marker-size': `${CHART_CONFIG.markerSize}px`,
        '--marker-border': `${CHART_CONFIG.markerBorder}px`,
        '--label-offset': `${CHART_CONFIG.labelOffset}px`,
        '--wave-opacity': CHART_CONFIG.waveOpacity,
        '--time-axis-padding': `${TIME_AXIS_CONFIG.bottomPadding}px`,
      } as React.CSSProperties}
    >
      <Grid isInitialLoad={isInitialLoad} />
      
      <div className={`chart-scroll-container ${isInitialLoad ? 'chart-scroll-container--no-scroll' : ''}`}>
        <div 
          className="chart-scroll-content"
          style={{
            width: `${contentWidth - offsetPercentage}vw`
          }}
        >
          <div className="chart"
            style={{
              transform: `translateX(-${offsetPercentage}vw)`
            }}
          >
            <TimeAxis 
              data={currentTideData}
              startTime={startTime}
              endTime={endTime}
              contentWidth={contentWidth}
              isInitialLoad={isInitialLoad}
            />
            <div className="chart-overlay-container">
              <ChartDrawing 
                data={hourlyData}
                contentWidth={contentWidth}
                onAnimationStart={handleAnimationStart}
                onAnimationComplete={handleAnimationComplete}
                isInitialLoad={isInitialLoad}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              <TideLabels
                data={allData}
                contentWidth={contentWidth}
                isAnimating={!showLabels || isInitialLoad}
                hoveredPoint={hoveredPoint}
                onPointHover={handlePointHover}
                tooltipAlignRight={tooltipAlignRight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 