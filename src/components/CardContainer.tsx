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

  const renderCard = (i: number) => (
    <Card
      key={cardKeys[i]}
      height={cardHeight}
      compoundState={cardStates[i]}
      onCardClick={() => handleCardClick(i)}
      onClose={handleCardClose}
      index={i}
      onAnimationComplete={() => handleAnimationComplete(i, cardStates[i])}
    />
  );

  return (
    <MotionDiv style={{ height: '100%', width: '100%' }}>
      <Box
        style={{
          background: '#f5f2e9',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'stretch',
          alignItems: 'stretch',
        }}
      >
        {isMobile ? (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: gridGap,
              padding: gridPadding,
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {Array.from({ length: CARD_COUNT }).map((_, i) => (
              <Box key={i} style={{ width: '100%', height: cardHeight }}>
                {renderCard(i)}
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: gridGap,
              padding: gridPadding,
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            {Array.from({ length: CARD_COUNT }).map((_, i) => renderCard(i))}
          </Box>
        )}
      </Box>
    </MotionDiv>
  );
}; 