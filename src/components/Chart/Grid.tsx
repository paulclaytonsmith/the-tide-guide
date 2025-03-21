'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_CONFIG } from './config';
import './Grid.css';

interface GridProps {
  isInitialLoad: boolean;
}

export const Grid: React.FC<GridProps> = ({ isInitialLoad }) => {
  return (
    <motion.div 
      className="grid-container"
      initial={{ opacity: 0, y: 400 }}
      animate={isInitialLoad ? 
        { opacity: 0, y: 400 } : 
        { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.4, 0.5, 0.2, 1] } }
      }
      style={{
        visibility: isInitialLoad ? 'hidden' : 'visible'
      }}
    >
      <div className="grid">
        {Array.from({ length: 100 }).map((_, index) => (
          <div key={index} className="grid-tile" />
        ))}
      </div>
    </motion.div>
  );
}; 