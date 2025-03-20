import React from 'react';
import './Tooltip.css';
import ArrowIcon from './icons/arrow.svg';

interface TooltipProps {
  height: number;
  time: Date;
  rate: number;
  visible: boolean;
  alignRight?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ height, time, rate, visible, alignRight = false }) => {
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
    <div className={`tide-tooltip ${alignRight ? 'tide-tooltip--right' : ''}`}>
      <div className="tide-tooltip-content">
        <h1 className="tide-tooltip-measurement">
          {formattedHeight}
          <br />
          {formattedTime}
        </h1>
        <div className="tide-tooltip-rate">
          <span className="tide-tooltip-arrow">
            <img 
              src={ArrowIcon} 
              alt="" 
              className={isRising ? '' : 'falling'}
            />
          </span>
          <p className="tide-tooltip-rate-value">{formattedRate}</p>
        </div>
      </div>
    </div>
  );
}; 