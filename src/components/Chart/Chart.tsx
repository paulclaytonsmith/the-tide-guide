'use client';

import React from 'react';
import { TimeAxis } from './TimeAxis';
import { Grid } from './Grid';
import { ChartDrawing } from './ChartDrawing';
import './Chart.css';

interface ChartProps {
  timeLabels: {
    label: string;
    isDate?: boolean;
  }[];
  tideData: Array<{
    time: Date;
    height: number;
    type: "High" | "Low";
  }>;
}

export const Chart: React.FC<ChartProps> = ({ timeLabels, tideData }) => {
  // Filter tide data to get second to last tide from yesterday through second tide of day+3
  const getFilteredTideData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const threeDaysAfter = new Date(today);
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

    // Get yesterday's tides
    const yesterdayTides = tideData.filter(d => 
      d.time >= yesterday && d.time < today
    );

    // Get the second to last tide from yesterday
    const startFromTide = yesterdayTides.length > 1 
      ? yesterdayTides[yesterdayTides.length - 2] 
      : yesterdayTides[0];

    // Get day+3 tides
    const day3Tides = tideData.filter(d => 
      d.time.getTime() >= threeDaysAfter.getTime() && 
      d.time.getTime() < threeDaysAfter.getTime() + (24 * 60 * 60 * 1000)
    );

    // Get the first two tides of day+3
    const endTides = day3Tides.slice(0, 2);

    // Filter the complete dataset
    return tideData.filter(d => {
      if (!startFromTide) return false;
      return d.time >= startFromTide.time && 
             (endTides.length === 0 || d.time <= endTides[endTides.length - 1].time);
    });
  };

  const filteredTideData = getFilteredTideData();

  return (
    <div className="chart-container">
      <Grid />
      
      <div className="chart-scroll-container">
        <div className="chart-scroll-content">
          <div className="chart">
            <TimeAxis timeLabels={timeLabels} />
            <ChartDrawing data={filteredTideData} />
          </div>
        </div>
      </div>
    </div>
  );
}; 