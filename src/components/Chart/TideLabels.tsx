import React, { useState, useEffect, useRef } from 'react';
import { CHART_CONFIG, ANIMATION_CONFIG } from './config';
import { motion, AnimatePresence } from 'framer-motion';
import './TideLabels.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface TideLabelsProps {
  data: Point[];
  previousData?: Point[];
  contentWidth: number;
  isAnimating?: boolean;
}

export const TideLabels: React.FC<TideLabelsProps> = ({ 
  data, 
  previousData,
  contentWidth,
  isAnimating = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: (window.innerWidth * contentWidth) / 100,
    height: 0
  });
  
  // Track previous heights for each point
  const prevHeights = useRef<Map<string, number>>(new Map());

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

  // Helper function to find corresponding point in previous data
  const findPreviousPoint = (currentPoint: Point) => {
    if (!previousData) return null;
    return previousData.find(p => 
      p.type === currentPoint.type && 
      p.time.getHours() === currentPoint.time.getHours()
    );
  };

  // Helper function to calculate y position with offsets
  const calculateYPosition = (height: number, displayMin: number, heightScale: number, availableHeight: number) => {
    const scaledHeight = (height - displayMin) * heightScale;
    return CHART_CONFIG.topOffset + (availableHeight - scaledHeight);
  };

  return (
    <div 
      className="tide-labels"
      ref={containerRef}
      style={{ opacity: isAnimating ? 0 : 1 }}
    >
      <AnimatePresence>
        {data.length > 0 && data
          .filter(point => point.type === "High" || point.type === "Low")
          .map((point) => {
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
            
            // Find corresponding point in previous data to determine animation direction
            const previousPoint = findPreviousPoint(point);
            const offset = 50; // Animation distance
            
            // If we have a previous point, animate from its position
            // Otherwise, animate from below for high tide and above for low tide
            const initialY = previousPoint 
              ? calculateYPosition(previousPoint.height, displayMin, heightScale, availableHeight)
              : point.type === "High" 
                ? y + offset  // High tide points come from below
                : y - offset; // Low tide points come from above

            return (
              <motion.div
                key={`${point.time.getTime()}-${point.type}`}
                className="tide-point-label"
                initial={{ y: initialY }}
                animate={{ 
                  y,
                  transition: {
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    mass: 0.8,
                    restSpeed: 0.001,
                    restDelta: 0.001
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  transform: `translateX(-50%)`,
                }}
              >
                <p className="tide-point-height">{`${point.height.toFixed(1)}'`}</p>
                <div className="tide-point-marker" />
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}; 