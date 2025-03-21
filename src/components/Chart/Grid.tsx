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
      initial={{ opacity: 0 }}
      animate={isInitialLoad ? { opacity: 0 } : ANIMATION_CONFIG.fadeIn.animate}
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