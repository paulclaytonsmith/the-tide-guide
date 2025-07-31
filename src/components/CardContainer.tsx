import React from 'react';
import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { useCardStateMachine } from '../hooks/useCardStateMachine';

const CARD_COUNT = 6;
const MotionDiv = motion.div;

export const CardContainer: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 48em)');

  // Use the state machine hook for all state management
  const {
    cardStates,
    cardKeys,
    handleCardClick,
    handleCardClose,
    handleAnimationComplete,
  } = useCardStateMachine();

  // Figma: 32px gap and padding, 3x2 grid desktop; 16px gap/padding, column mobile
  const gridGap = isMobile ? 16 : 16;
  const gridPadding = isMobile ? 16 : 32;
  const cardHeight = isMobile ? 359 : undefined;

  // Calculate card dimensions and positions
  const getCardStyle = (index: number) => {
    if (isMobile) {
      // Mobile: vertical column layout
      const cardWidth = `calc(100% - ${gridPadding * 2}px)`;
      const cardTop = `calc(${gridPadding}px + ${index} * (${cardHeight}px + ${gridGap}px))`;
      
      return {
        position: 'absolute' as const,
        top: cardTop,
        left: gridPadding,
        width: cardWidth,
        height: cardHeight,
      };
    } else {
      // Desktop: 3x2 grid layout
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      // Calculate card dimensions using CSS calc
      const cardWidth = `calc((100% - ${gridPadding * 2}px - ${gridGap * 2}px) / 3)`;
      const cardHeightValue = `calc((100% - ${gridPadding * 2}px - ${gridGap}px) / 2)`;
      
      // Calculate positions using CSS calc
      const cardTop = `calc(${gridPadding}px + ${row} * (${cardHeightValue} + ${gridGap}px))`;
      const cardLeft = `calc(${gridPadding}px + ${col} * (${cardWidth} + ${gridGap}px))`;
      
      return {
        position: 'absolute' as const,
        top: cardTop,
        left: cardLeft,
        width: cardWidth,
        height: cardHeightValue,
      };
    }
  };

  const renderCard = (i: number) => (
    <div key={cardKeys[i]} style={getCardStyle(i)}>
      <Card
        height="100%"
        compoundState={cardStates[i]}
        onCardClick={() => handleCardClick(i)}
        onClose={handleCardClose}
        index={i}
        onAnimationComplete={() => handleAnimationComplete(i, cardStates[i])}
      />
    </div>
  );

  return (
    <MotionDiv style={{ height: '100%', width: '100%' }}>
      <Box
        style={{
          background: '#f5f2e9',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => renderCard(i))}
      </Box>
    </MotionDiv>
  );
}; 