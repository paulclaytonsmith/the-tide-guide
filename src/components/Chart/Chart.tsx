'use client';

import React from 'react';
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

export const Chart: React.FC<ChartProps> = ({ tideData }) => {
  // Get start and end times from the full dataset
  const startTime = tideData[0].time;
  const endTime = tideData[tideData.length - 1].time;

  return (
    <div className="chart-container">
      <Grid />
      
      <div className="chart-scroll-container">
        <div className="chart-scroll-content">
          <div className="chart">
            <TimeAxis 
              data={tideData}
              startTime={startTime}
              endTime={endTime}
            />
            <ChartDrawing data={tideData} />
          </div>
        </div>
      </div>
    </div>
  );
}; 