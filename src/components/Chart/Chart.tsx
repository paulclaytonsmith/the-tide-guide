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
}

export const Chart: React.FC<ChartProps> = ({ timeLabels }) => {
  return (
    <div className="chart-container">
      <Grid />
      
      <div className="chart-scroll-container">
        <div className="chart-scroll-content">
          <div className="chart">
            <TimeAxis timeLabels={timeLabels} />
            <ChartDrawing />
          </div>
        </div>
      </div>
    </div>
  );
}; 