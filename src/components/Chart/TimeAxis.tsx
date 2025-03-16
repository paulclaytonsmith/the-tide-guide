'use client';

import React from 'react';
import './TimeAxis.css';

interface TimeAxisProps {
  timeLabels: {
    label: string;
    isDate?: boolean;
  }[];
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ timeLabels }) => {
  const formatLabel = (label: string, isDate: boolean | undefined) => {
    if (isDate) {
      // Split date into day and time parts
      const [day, time] = label.split(/(?<=\d{1,2}\/\d{1,2})\s+/);
      return (
        <div role="group" aria-label="Time axis label">
          <p className="chart-label">
            <span className="chart-label__day">{day}</span>
            <span className="chart-label__time" aria-label={`Time: ${time}`}>{time}</span>
          </p>
        </div>
      );
    } else {
      // For time-only labels, add a blank line before the time
      return (
        <div role="group" aria-label="Time axis label">
          <p className="chart-label">
            <span>&nbsp;</span>
            <span className="secondary">{label}</span>
          </p>
        </div>
      );
    }
  };

  return (
    <div className="time-axis">
      {timeLabels.map((time, index) => (
        <span 
          key={index} 
          className={`time-axis-label ${time.isDate ? 'time-axis-label--date' : 'time-axis-label--time'}`}
        >
          {formatLabel(time.label, time.isDate)}
        </span>
      ))}
    </div>
  );
}; 