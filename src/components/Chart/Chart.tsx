'use client';

import React from 'react';
import styled from 'styled-components';
import { TimeAxis } from './TimeAxis';
import { Grid } from './Grid';

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 48px;
  width: 100%;
  height: 100%;
`;

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
    <ChartContainer>
      <TimeAxis timeLabels={timeLabels} />
      <Grid columns={columns} rows={rows} />
    </ChartContainer>
  );
}; 