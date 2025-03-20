'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TIME_AXIS_CONFIG, ANIMATION_CONFIG } from './config';
import './TimeAxis.css';

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface TimeAxisProps {
  data: Point[];
  startTime: Date;
  endTime: Date;
  contentWidth: number;
  isInitialLoad: boolean;
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ 
  data, 
  startTime, 
  endTime, 
  contentWidth,
  isInitialLoad 
}) => {
  const generateTimeLabels = () => {
    const labels = [];
    
    // Start at the first labelFrequency-hour mark after startTime
    const firstLabel = new Date(startTime);
    // Round up to next labelFrequency-hour mark
    const currentHour = firstLabel.getHours();
    const hoursToNext = (TIME_AXIS_CONFIG.labelFrequency - (currentHour % TIME_AXIS_CONFIG.labelFrequency)) % TIME_AXIS_CONFIG.labelFrequency;
    firstLabel.setMinutes(0, 0, 0); // Reset minutes and seconds
    firstLabel.setHours(currentHour + hoursToNext);
    
    // Get the midnight of the last day (which we don't want to include)
    const lastDayMidnight = new Date(endTime);
    lastDayMidnight.setHours(0, 0, 0, 0);
    
    // Generate labels every labelFrequency hours until we reach the last day's midnight (exclusive)
    for (let time = new Date(firstLabel); 
         time < lastDayMidnight;
         time = new Date(time.getTime() + (TIME_AXIS_CONFIG.labelFrequency * 60 * 60 * 1000))) {
      const isMidnight = time.getHours() === 0;
      labels.push({
        time: new Date(time),
        dateLabel: isMidnight ? `${time.toLocaleDateString('en-US', { weekday: 'long' })} ${time.getMonth() + 1}/${time.getDate()}` : '',
        timeLabel: time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true}).replace(/\s/g, ''),
        isMidnight
      });
    }
    
    return labels;
  };

  const timeLabels = generateTimeLabels();
  const timeRange = endTime.getTime() - startTime.getTime();

  return (
    <motion.div 
      className="time-axis"
      initial={ANIMATION_CONFIG.fadeIn.initial}
      animate={isInitialLoad ? { opacity: 0 } : ANIMATION_CONFIG.fadeIn.animate}
    >
      <div className="time-axis__dates">
        {timeLabels.filter(label => label.isMidnight).map((label, index) => (
          <p 
            key={`date-${index}`}
            className="chart-label"
            style={{
              position: 'absolute',
              left: `${((label.time.getTime() - startTime.getTime()) / timeRange) * contentWidth}vw`,
            }}
          >
            {label.dateLabel}
          </p>
        ))}
      </div>
      <div className="time-axis__times">
        {timeLabels.map((label, index) => (
          <p 
            key={index}
            className="chart-label"
            style={{
              position: 'absolute',
              left: `${((label.time.getTime() - startTime.getTime()) / timeRange) * contentWidth}vw`,
            }}
          >
            {label.timeLabel}
          </p>
        ))}
      </div>
    </motion.div>
  );
}; 