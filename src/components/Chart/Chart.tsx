'use client';

import React, { useMemo } from 'react';
import { TimeAxis } from './TimeAxis';
import { Grid } from './Grid';
import { ChartDrawing } from './ChartDrawing';
import { TideLabels } from './TideLabels';
import { Tooltip } from './Tooltip';
import { VIEWPORT_WIDTHS, CHART_CONFIG, TIME_AXIS_CONFIG } from './config';
import './Chart.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface ChartProps {
  tideData: Point[];
}

export const Chart: React.FC<ChartProps> = ({ tideData }) => {
  // Get start and end times from the full dataset
  const startTime = tideData[0].time;
  const endTime = tideData[tideData.length - 1].time;

  // Find the midnight point and calculate its rate
  const midnightPoint = useMemo(() => {
    const midnight = tideData.find(point => {
      const hours = point.time.getHours();
      const minutes = point.time.getMinutes();
      return hours === 0 && minutes === 0;
    });

    if (!midnight) return null;

    const pointIndex = tideData.indexOf(midnight);
    const nextPoint = tideData[pointIndex + 1];
    const rate = nextPoint 
      ? (nextPoint.height - midnight.height) / 
        ((nextPoint.time.getTime() - midnight.time.getTime()) / (1000 * 60 * 60))
      : 0;

    return {
      point: midnight,
      rate
    };
  }, [tideData]);

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
      <Grid />
      
      <div className="chart-scroll-container">
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
              data={tideData}
              startTime={startTime}
              endTime={endTime}
              contentWidth={contentWidth}
            />
            <div className="chart-overlay-container">
              <ChartDrawing 
                data={tideData}
                contentWidth={contentWidth}
              />
              <TideLabels
                data={tideData}
                contentWidth={contentWidth}
              />
              {midnightPoint && (
                <Tooltip
                  height={midnightPoint.point.height}
                  time={midnightPoint.point.time}
                  rate={midnightPoint.rate}
                  position={{ x: 0, y: 0 }}
                  visible={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 