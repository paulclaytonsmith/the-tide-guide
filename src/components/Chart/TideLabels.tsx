import React, { useState, useEffect, useRef } from 'react';
import './TideLabels.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface TideLabelsProps {
  data: Point[];
  contentWidth: number;
}

const RANGE_MULTIPLIER = 2;           // Extends range in both directions
const TOP_OFFSET_HEIGHT = 24;         // Offset from top of chart to start drawing in pixels
const BOTTOM_OFFSET_PERCENTAGE = 0.3; // Offset from bottom of chart to end drawing in percentage of chart height

export const TideLabels: React.FC<TideLabelsProps> = ({ data, contentWidth }) => {
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
    return TOP_OFFSET_HEIGHT + (availableHeight - scaledHeight);
  };

  return (
    <div className="tide-labels" ref={containerRef}>
      {data.length > 0 && data
        .filter(point => point.type === "High" || point.type === "Low")
        .map((point, index) => {
          const timeRange = data[data.length - 1].time.getTime() - data[0].time.getTime();
          const timeScale = dimensions.width / timeRange;

          const maxHeight = Math.max(...data.map(p => p.height));
          const minHeight = Math.min(...data.map(p => p.height));
          const actualRange = maxHeight - minHeight;
          const rangeExtension = (actualRange * (RANGE_MULTIPLIER - 1)) / 2;
          const displayMin = minHeight - rangeExtension;
          const displayMax = maxHeight + rangeExtension;
          const heightRange = displayMax - displayMin;
          const bottomOffset = dimensions.height * BOTTOM_OFFSET_PERCENTAGE;
          const availableHeight = dimensions.height - TOP_OFFSET_HEIGHT - bottomOffset;
          const heightScale = availableHeight / heightRange;

          const x = (point.time.getTime() - data[0].time.getTime()) * timeScale;
          const y = calculateYPosition(point.height, displayMin, heightScale, availableHeight);

          return (
            <div
              key={index}
              className="tide-point-label"
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y - 20}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <p className="tide-point-height">{`${point.height.toFixed(1)}'`}</p>
            </div>
          );
        })}
    </div>
  );
}; 