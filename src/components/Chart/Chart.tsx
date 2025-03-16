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
  columns: number;
  rows: number;
}

export const Chart: React.FC<ChartProps> = ({ timeLabels, columns, rows }) => {
  return (
    <div className="chart-container">
      <TimeAxis timeLabels={timeLabels} />
      <Grid columns={columns} rows={rows} />
    </div>
  );
}; 