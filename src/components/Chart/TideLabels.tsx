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
  hoveredPoint?: Point | null;
  onPointHover?: (point: Point | null, x?: number) => void;
  tooltipAlignRight?: boolean;
}

export const TideLabels: React.FC<TideLabelsProps> = ({ 
  data, 
  contentWidth,
  isAnimating = false,
  hoveredPoint: externalHoveredPoint,
  onPointHover,
  tooltipAlignRight
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalHoveredPoint, setInternalHoveredPoint] = useState<Point | null>(null);
  const [dimensions, setDimensions] = useState({
    width: (window.innerWidth * contentWidth) / 100,
    height: 0
  });

  // Use external hover point if provided, otherwise use internal state
  const hoveredPoint = externalHoveredPoint ?? internalHoveredPoint;

  const handleMouseEnter = (point: Point, x: number) => {
    setInternalHoveredPoint(point);
    onPointHover?.(point, x);
  };

  const handleMouseLeave = () => {
    setInternalHoveredPoint(null);
    onPointHover?.(null);
  };

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
                .filter(point => point.time.getTime() < data[data.length - 1].time.getTime())
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
                      onMouseEnter={() => handleMouseEnter(point, x)}
                      onMouseLeave={handleMouseLeave}
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
                        variants={{
                          ...ANIMATION_CONFIG.labels.marker,
                          hover: {
                            width: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverScale,
                            height: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverScale,
                            x: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverOffset,
                            y: CHART_CONFIG.markerSize * CHART_CONFIG.markerHoverOffset
                          },
                          default: {
                            width: CHART_CONFIG.markerSize,
                            height: CHART_CONFIG.markerSize,
                            x: 0,
                            y: 0
                          }
                        }}
                        initial="initial"
                        animate={[
                          "enter",
                          hoveredPoint === point ? "hover" : "default"
                        ]}
                        exit="exit"
                        custom={x}
                        transition={{ duration: 0 }}
                      />  
                      {hoveredPoint === point && (
                        <Tooltip
                          height={point.height}
                          time={point.time}
                          rate={rate}
                          visible={true}
                          type={point.type}
                          alignRight={tooltipAlignRight !== undefined ? tooltipAlignRight : x > dimensions.width / 2}
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
                .filter(point => point.time.getTime() < data[data.length - 1].time.getTime())
                .filter(point => {
                  // Filter out hourly points that are near high/low points
                  return !highLowPoints.some(hlPoint => {
                    const hoursDiff = Math.abs(point.time.getTime() - hlPoint.time.getTime()) / (1000 * 60 * 60);
                    return hoursDiff <= CHART_CONFIG.hourlyMarkerThreshold;
                  });
                })
                .map((point) => {
                  const x = ((point.time.getTime() - data[0].time.getTime()) / (data[data.length - 1].time.getTime() - data[0].time.getTime())) * dimensions.width;
                  const y = calculateYPosition(point.height, displayMin, heightScale, availableHeight);

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
                        position: 'absolute',
                        left: `${x}px`,
                        transform: `translateX(-50%)`,
                        top: `${y}px`
                      }}
                      onMouseEnter={() => handleMouseEnter(point, x)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <motion.div 
                        className={`tide-point-marker tide-point-marker--hourly`}
                        variants={{
                          initial: { opacity: 0 },
                          enter: { opacity: 0 },
                          hover: { opacity: 1 },
                          default: { opacity: 0 }
                        }}
                        initial="initial"
                        animate={[
                          "enter",
                          hoveredPoint === point ? "hover" : "default"
                        ]}
                        exit="exit"
                        custom={x}
                        transition={{ duration: 0 }}
                      />
                      {hoveredPoint === point && (
                        <Tooltip
                          height={point.height}
                          time={point.time}
                          rate={rate}
                          visible={true}
                          type={point.type}
                          alignRight={tooltipAlignRight !== undefined ? tooltipAlignRight : x > dimensions.width / 2}
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