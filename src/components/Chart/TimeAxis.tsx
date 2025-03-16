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
        <>
          <span>{day}</span>
          <span className="secondary">{time}</span>
        </>
      );
    } else {
      // For time-only labels, add a blank line before the time
      return (
        <>
          <span>&nbsp;</span>
          <span className="secondary">{label}</span>
        </>
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