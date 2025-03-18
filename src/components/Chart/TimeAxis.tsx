'use client';

import React from 'react';
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
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ data, startTime, endTime }) => {
  const generateTimeLabels = () => {
    const labels = [];
    
    // Start at midnight of the day of startTime
    const firstLabel = new Date(startTime);
    firstLabel.setHours(0, 0, 0, 0);
    
    // If we're not already at midnight of the previous day, go back one day
    if (firstLabel.getTime() > startTime.getTime()) {
      firstLabel.setDate(firstLabel.getDate() - 1);
    }
    
    // Generate labels every 6 hours until we reach endTime
    for (let time = new Date(firstLabel); time <= endTime; time = new Date(time.getTime() + (6 * 60 * 60 * 1000))) {
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

  const formatLabel = (dateLabel: string, timeLabel: string, isMidnight: boolean) => {
    return (
      <div role="group" aria-label="Time axis label">
        <p className="chart-label">
          {dateLabel && <span className="chart-label__day">{dateLabel}</span>}
          <span className={isMidnight ? "chart-label__day" : "secondary"}>{timeLabel}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="time-axis">
      {timeLabels.map((label, index) => (
        <span 
          key={index}
          className={`time-axis-label ${label.isMidnight ? 'time-axis-label--date' : 'time-axis-label--time'}`}
          style={{
            position: 'absolute',
            left: `${((label.time.getTime() - startTime.getTime()) / timeRange) * 100}%`,
            transform: 'translateX(-50%)'
          }}
        >
          {formatLabel(label.dateLabel, label.timeLabel, label.isMidnight)}
        </span>
      ))}
    </div>
  );
}; 