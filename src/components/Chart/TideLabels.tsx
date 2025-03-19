import React, { useState, useEffect, useRef } from 'react';
import { CHART_CONFIG } from './config';
import { motion, AnimatePresence } from 'framer-motion';
import './TideLabels.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface TideLabelsProps {
  data: Point[];
  contentWidth: number;
  isAnimating?: boolean;
}

export const TideLabels: React.FC<TideLabelsProps> = ({ 
  data, 
  contentWidth,
  isAnimating = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: (window.innerWidth * contentWidth) / 100,
    height: 0
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: (window.innerWidth * contentWidth) / 100,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [contentWidth]);

  // Helper function to calculate y position with offsets
  const calculateYPosition = (height: number, displayMin: number, heightScale: number, availableHeight: number) => {
    const scaledHeight = (height - displayMin) * heightScale;
    return CHART_CONFIG.topOffset + (availableHeight - scaledHeight);
  };

  return (
    <motion.div 
      className="tide-labels"
      ref={containerRef}
      animate={{ opacity: isAnimating ? 0 : 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <AnimatePresence>
        {data.length > 0 && data
          .filter(point => point.type === "High" || point.type === "Low")
          .map((point, index) => {
            const timeRange = data[data.length - 1].time.getTime() - data[0].time.getTime();
            const timeScale = dimensions.width / timeRange;

            const maxHeight = Math.max(...data.map(p => p.height));
            const minHeight = Math.min(...data.map(p => p.height));
            const actualRange = maxHeight - minHeight;
            const rangeExtension = (actualRange * (CHART_CONFIG.rangeMultiplier - 1)) / 2;
            const displayMin = minHeight - rangeExtension;
            const displayMax = maxHeight + rangeExtension;
            const heightRange = displayMax - displayMin;
            const bottomOffset = dimensions.height * CHART_CONFIG.bottomOffset;
            const availableHeight = dimensions.height - CHART_CONFIG.topOffset - bottomOffset;
            const heightScale = availableHeight / heightRange;

            const x = (point.time.getTime() - data[0].time.getTime()) * timeScale;
            const y = calculateYPosition(point.height, displayMin, heightScale, availableHeight);

            return (
              <motion.div
                key={`${point.time.getTime()}-${point.height}`}
                className="tide-point-label"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: {
                    duration: 0.1,
                    ease: "easeOut",
                    delay: 0.3
                  }
                }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <p className="tide-point-height">{`${point.height.toFixed(1)}'`}</p>
                <div className="tide-point-marker" />
              </motion.div>
            );
          })}
      </AnimatePresence>
    </motion.div>
  );
}; 