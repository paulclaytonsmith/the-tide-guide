'use client';

import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  width: 100%;
  border: 2px solid #FFFFFF;
`;

const Tile = styled.div`
  width: 96px;
  height: 96px;
  border: 1px solid #FFFFFF;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.5);
  }
  
  &::before {
    width: 2px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &::after {
    width: 100%;
    height: 2px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

interface GridProps {
  columns: number;
  rows: number;
}

export const Grid: React.FC<GridProps> = ({ columns, rows }) => {
  return (
    <GridContainer>
      {Array.from({ length: columns * rows }).map((_, index) => (
        <Tile key={index} />
      ))}
    </GridContainer>
  );
}; 