'use client';

import React from 'react';
import './Grid.css';

interface GridProps {
  columns: number;
  rows: number;
}

export const Grid: React.FC<GridProps> = ({ columns, rows }) => {
  return (
    <div 
      className="grid-container"
      style={{ '--columns': columns } as React.CSSProperties}
    >
      {Array.from({ length: columns * rows }).map((_, index) => (
        <div key={index} className="grid-tile" />
      ))}
    </div>
  );
}; 