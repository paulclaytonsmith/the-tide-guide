'use client';

import React from 'react';
import { TimeAxis } from './TimeAxis';
import { Grid } from './Grid';
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
      <TimeAxis timeLabels={timeLabels} />
      <Grid />
    </div>
  );
}; 