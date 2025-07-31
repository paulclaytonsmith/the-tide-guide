import React from 'react';
import { Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@mantine/hooks';
import { Card } from './Card';
import { useCardStateMachine } from '../hooks/useCardStateMachine';

const CARD_COUNT = 6;
const MotionDiv = motion.div;

export const CardContainer: React.FC = () => {
  // Use the state machine hook for all state management
  const {
    cardStates,
    cardKeys,
    handleCardClick,
    handleCardClose,
    handleAnimationComplete,
    pendingActiveIndex,
  } = useCardStateMachine();

  const isMobile = useMediaQuery('(max-width: 48em)');
  
  // Grid configuration
  const gridGap = isMobile ? 16 : 16;
  const gridPadding = isMobile ? 16 : 32;
  
  // Calculate the total height needed for mobile layout
  const getContainerHeight = () => {
    if (isMobile) {
      const cardHeight = 359;
      const totalHeight = gridPadding + (CARD_COUNT * cardHeight) + ((CARD_COUNT - 1) * gridGap) + gridPadding;
      return `${totalHeight}px`;
    }
    return '100%';
  };
  
  const getCardStyle = (index: number): React.CSSProperties => {
    if (isMobile) {
      // Mobile: Single column layout
      const cardHeight = 359;
      const cardWidth = `calc(100% - ${gridPadding * 2}px)`;
      const cardTop = `calc(${gridPadding}px + ${index} * (${cardHeight}px + ${gridGap}px))`;
      
      const mobileStyle: React.CSSProperties = {
        position: 'absolute',
        top: cardTop,
        left: gridPadding,
        width: cardWidth,
        height: cardHeight,
      };
      
      return mobileStyle;
    } else {
      // Desktop: 3x2 grid layout
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      const cardWidth = `calc((100% - ${gridPadding * 2}px - ${gridGap * 2}px) / 3)`;
      const cardHeight = `calc((100% - ${gridPadding * 2}px - ${gridGap}px) / 2)`;
      
      const cardTop = `calc(${gridPadding}px + ${row} * (${cardHeight} + ${gridGap}px))`;
      const cardLeft = `calc(${gridPadding}px + ${col} * (${cardWidth} + ${gridGap}px))`;
      
      const desktopStyle: React.CSSProperties = {
        position: 'absolute',
        top: cardTop,
        left: cardLeft,
        width: cardWidth,
        height: cardHeight,
      };
      
      return desktopStyle;
    }
  };

  const renderCard = (i: number) => (
    <Card
      key={cardKeys[i]}
      height="100%"
      compoundState={cardStates[i]}
      onCardClick={() => handleCardClick(i)}
      onClose={handleCardClose}
      index={i}
      pendingActiveIndex={pendingActiveIndex}
      onAnimationComplete={() => handleAnimationComplete(i, cardStates[i])}
      style={getCardStyle(i)}
    />
  );

  return (
    <MotionDiv style={{ height: '100%', width: '100%' }}>
      <Box
        data-card-container
        style={{
          height: getContainerHeight(),
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          background: '#f5f2e9',
        }}
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => renderCard(i))}
      </Box>
    </MotionDiv>
  );
}; 
