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
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ data, startTime, endTime }) => {
  const generateTimeLabels = () => {
    const labels = [];
    
    // Start at the first LABEL_FREQUENCY-hour mark after startTime
    const firstLabel = new Date(startTime);
    // Round up to next LABEL_FREQUENCY-hour mark
    const currentHour = firstLabel.getHours();
    const hoursToNext = (LABEL_FREQUENCY - (currentHour % LABEL_FREQUENCY)) % LABEL_FREQUENCY;
    firstLabel.setMinutes(0, 0, 0); // Reset minutes and seconds
    firstLabel.setHours(currentHour + hoursToNext);
    
    // Generate labels every LABEL_FREQUENCY hours until we reach endTime
    for (let time = new Date(firstLabel); time <= endTime; time = new Date(time.getTime() + (LABEL_FREQUENCY * 60 * 60 * 1000))) {
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
          className={`time-axis-label ${label.isMidnight ? 'time-axis-label--date' : 'time-axis-label--time'} ${
            index === 0 || index === timeLabels.length - 1 ? 'time-axis-label--edge' : ''
          }`}
          style={{
            position: 'absolute',
            left: `${((label.time.getTime() - startTime.getTime()) / timeRange) * 100}%`,
          }}
        >
          {formatLabel(label.dateLabel, label.timeLabel, label.isMidnight)}
        </span>
      ))}
    </div>
  );
}; 