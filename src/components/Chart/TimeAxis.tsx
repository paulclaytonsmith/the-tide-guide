'use client';

import React from 'react';
import './TimeAxis.css';

const LABEL_FREQUENCY = 6; // Hours between each label

interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
}

interface TimeAxisProps {
  data: Point[];
  startTime: Date;
  endTime: Date;
  contentWidth: number;  // Add this prop to receive the total width
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ data, startTime, endTime, contentWidth }) => {
  console.log('TimeAxis - Props:', {
    start: startTime.toLocaleString(),
    end: endTime.toLocaleString(),
    dataPoints: data.length
  });

  const generateTimeLabels = () => {
    const labels = [];
    
    // Start at the first LABEL_FREQUENCY-hour mark after startTime
    const firstLabel = new Date(startTime);
    // Round up to next LABEL_FREQUENCY-hour mark
    const currentHour = firstLabel.getHours();
    const hoursToNext = (LABEL_FREQUENCY - (currentHour % LABEL_FREQUENCY)) % LABEL_FREQUENCY;
    firstLabel.setMinutes(0, 0, 0); // Reset minutes and seconds
    firstLabel.setHours(currentHour + hoursToNext);
    
    // Get the midnight of the last day (which we don't want to include)
    const lastDayMidnight = new Date(endTime);
    lastDayMidnight.setHours(0, 0, 0, 0);
    
    // Generate labels every LABEL_FREQUENCY hours until we reach the last day's midnight (exclusive)
    for (let time = new Date(firstLabel); 
         time < lastDayMidnight;  // Changed to < instead of <= to exclude the last midnight
         time = new Date(time.getTime() + (LABEL_FREQUENCY * 60 * 60 * 1000))) {
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
    <div className="time-axis">
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
    </div>
  );
}; 