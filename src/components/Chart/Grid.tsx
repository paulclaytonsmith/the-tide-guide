'use client';

import React from 'react';
import './Grid.css';

export const Grid: React.FC = () => {
  return (
    <div className="grid-container">
      <div className="grid">
        {Array.from({ length: 100 }).map((_, index) => (
          <div key={index} className="grid-tile" />
        ))}
      </div>
    </div>
  );
}; 