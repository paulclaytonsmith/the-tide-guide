import React, { useState, useEffect, useRef } from 'react';
import { CHART_CONFIG, ANIMATION_CONFIG } from './config';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from './Tooltip';
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
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
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
    const markerOffset = (CHART_CONFIG.markerSize + CHART_CONFIG.markerBorder * 2) / 2;
    return CHART_CONFIG.topOffset + (availableHeight - scaledHeight) - markerOffset;
  };

  return (
    <div 
      className="tide-labels"
      ref={containerRef}
      style={{ opacity: isAnimating ? 0 : 1 }}
    >
      {/* Calculate shared values */}
      {(() => {
        if (data.length === 0) return null;

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

        return (
          <>
            {/* High/Low Points */}
            <AnimatePresence>
              {data
                .filter(point => point.type === "High" || point.type === "Low")
                .map((point) => {
                  const timeRange = data[data.length - 1].time.getTime() - data[0].time.getTime();
                  const timeScale = dimensions.width / timeRange;
                  const markerOffset = (CHART_CONFIG.markerSize + CHART_CONFIG.markerBorder * 2) / 2;
                  const x = ((point.time.getTime() - data[0].time.getTime()) * timeScale) - markerOffset;
                  const y = calculateYPosition(point.height, displayMin, heightScale, availableHeight);

                  const nextPoint = data[data.indexOf(point) + 1];
                  const rate = nextPoint 
                    ? (nextPoint.height - point.height) / 
                      ((nextPoint.time.getTime() - point.time.getTime()) / (1000 * 60 * 60))
                    : 0;

                  return (
                    <motion.div
                      key={`${point.time.getTime()}-${point.type}`}
                      className="tide-point-label"
                      initial={{ y }}
                      animate={{ y }}
                      exit={{ y }}
                      style={{
                        position: 'absolute',
                        left: `${x}px`,
                        transform: `translateX(-50%)`,
                      }}
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <motion.p 
                        className="tide-point-height"
                        variants={ANIMATION_CONFIG.labels.heightText}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        custom={x}
                      >
                        {`${point.height.toFixed(1)}'`}
                      </motion.p>
                      <motion.div 
                        className="tide-point-marker"
                        variants={ANIMATION_CONFIG.labels.marker}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        custom={x}
                        whileHover={{ 
                          width: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverScale,
                          height: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverScale,
                          x: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverOffset,
                          y: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverOffset
                        }}
                        transition={{ duration: 0 }}
                      />  
                      {hoveredPoint === point && (
                        <Tooltip
                          height={point.height}
                          time={point.time}
                          rate={rate}
                          visible={true}
                          alignRight={x > dimensions.width / 2}
                        />
                      )}
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            {/* Hourly Points */}
            {(() => {
              if (data.length === 0) return null;

              // Get high/low points for comparison
              const highLowPoints = data.filter(p => p.type === "High" || p.type === "Low");

              return data
                .filter(point => point.type === "Hourly")
                .map((point) => {
                  const x = ((point.time.getTime() - data[0].time.getTime()) / (data[data.length - 1].time.getTime() - data[0].time.getTime())) * dimensions.width;
                  const y = calculateYPosition(point.height, displayMin, heightScale, availableHeight);

                  // Check if this hourly point is near any high/low point
                  const isNearHighLow = highLowPoints.some(hlPoint => {
                    const hoursDiff = Math.abs(point.time.getTime() - hlPoint.time.getTime()) / (1000 * 60 * 60);
                    return hoursDiff <= CHART_CONFIG.hourlyMarkerThreshold;
                  });

                  // Calculate rate for tooltip
                  const nextPoint = data[data.indexOf(point) + 1];
                  const rate = nextPoint 
                    ? (nextPoint.height - point.height) / 
                      ((nextPoint.time.getTime() - point.time.getTime()) / (1000 * 60 * 60))
                    : 0;

                  return (
                    <div
                      key={`hourly-${point.time.getTime()}`}
                      className="tide-point-label"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`
                      }}
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <div className={`tide-point-marker tide-point-marker--hourly ${isNearHighLow ? 'tide-point-marker--near-extreme' : ''}`} />
                      {hoveredPoint === point && (
                        <Tooltip
                          height={point.height}
                          time={point.time}
                          rate={rate}
                          visible={true}
                          alignRight={x > dimensions.width / 2}
                        />
                      )}
                    </div>
                  );
                });
            })()}
          </>
        );
      })()}
    </div>
  );
}; 