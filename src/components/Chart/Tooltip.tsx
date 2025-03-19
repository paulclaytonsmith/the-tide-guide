import React from 'react';
import './Tooltip.css';

interface TooltipProps {
  height: number;
  time: Date;
  rate: number;
  position: { x: number; y: number };
  visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ height, time, rate, position, visible }) => {
  if (!visible) return null;

  const formattedTime = time.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const formattedHeight = `${height.toFixed(1)}'`;
  const formattedRate = `${Math.abs(rate).toFixed(1)}' / hr`;
  const isRising = rate > 0;

  return (
    <div 
      className="tide-tooltip"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <div className="tide-tooltip-line">
        <div className="tide-tooltip-point" />
        <div className="tide-tooltip-vr" />
      </div>
      <div className="tide-tooltip-content">
        <div className="tide-tooltip-measurement">
          {formattedHeight}
          <br />
          {formattedTime}
        </div>
        <div className="tide-tooltip-rate">
          <span className={`tide-tooltip-arrow ${isRising ? 'rising' : 'falling'}`}>
            {isRising ? '↑' : '↓'}
          </span>
          <span className="tide-tooltip-rate-value">{formattedRate}</span>
        </div>
      </div>
    </div>
  );
}; 