'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_CONFIG } from './config';
import './Grid.css';

interface GridProps {
  isInitialLoad: boolean;
}

export const Grid: React.FC<GridProps> = ({ isInitialLoad }) => {
  console.log('Grid render:', { isInitialLoad });

  return (
    <motion.div 
      className="grid-container"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isInitialLoad ? 0 : 1,
        transition: ANIMATION_CONFIG.fadeIn
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