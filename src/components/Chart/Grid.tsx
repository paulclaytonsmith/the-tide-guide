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
      initial={ANIMATION_CONFIG.fadeIn.initial}
      animate={isInitialLoad ? { opacity: 0 } : ANIMATION_CONFIG.fadeIn.animate}
    >
      <div className="grid">
        {Array.from({ length: 100 }).map((_, index) => (
          <div key={index} className="grid-tile" />
        ))}
      </div>
    </motion.div>
  );
}; 