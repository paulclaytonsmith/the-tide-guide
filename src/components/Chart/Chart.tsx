'use client';

import React, { useMemo } from 'react';
import { TimeAxis } from './TimeAxis';
import { Grid } from './Grid';
import { ChartDrawing } from './ChartDrawing';
import './Chart.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface ChartProps {
  tideData: Point[];
}

const VIEWPORT_WIDTHS = 3; // How many viewport widths wide the chart should be

export const Chart: React.FC<ChartProps> = ({ tideData }) => {
  // Get start and end times from the full dataset
  const startTime = tideData[0].time;
  const endTime = tideData[tideData.length - 1].time;
  console.log('Chart - Data time range:', {
    start: startTime.toLocaleString(),
    end: endTime.toLocaleString()
  });

  // Calculate offset to align midnight with the edge
  const { offsetPercentage, contentWidth } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTimeRange = endTime.getTime() - startTime.getTime();
    const timeToMidnight = today.getTime() - startTime.getTime();
    
    // Calculate what percentage of the total time range is before midnight
    const beforeMidnightPercentage = (timeToMidnight / totalTimeRange);
    
    // Calculate the total width needed in viewport widths
    const totalWidth = VIEWPORT_WIDTHS * 100;
    
    // Calculate the offset in viewport width units
    const offsetPercentage = beforeMidnightPercentage * totalWidth;

    const pagePaddingPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-padding'));
    const pagePaddingVw = (pagePaddingPx / window.innerWidth) * 100;
    
    // Calculate the total offset including padding
    const totalOffset = Math.max(0, offsetPercentage - pagePaddingVw);
    
    return { 
      offsetPercentage: totalOffset,
      contentWidth: totalWidth
    };
  }, [startTime, endTime]);

  return (
    <div className="chart-container">
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
            <ChartDrawing 
              data={tideData}
              contentWidth={contentWidth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 