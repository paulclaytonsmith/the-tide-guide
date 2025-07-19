import React from 'react';
import { Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { Card } from '../Card';
import { CardGridProps } from '../../state/types';

const MotionDiv = motion.div;

export const CardGrid: React.FC<CardGridProps> = ({
  cardCount,
  isMobile,
  gridGap,
  gridPadding,
  cardHeight,
  cardStates,
  cardKeys,
  onCardClick,
  onCardClose,
  onAnimationComplete,
}) => {
  const renderCard = (i: number) => (
    <Card
      key={cardKeys[i]}
      height={cardHeight}
      compoundState={cardStates[i]}
      onCardClick={() => onCardClick(i)}
      onClose={onCardClose}
      index={i}
      onAnimationComplete={() => {
        console.log(`[CardGrid] Card ${i} animation complete callback, current state: ${cardStates[i]}`);
        if (cardStates[i] === 'thumbnail-exiting') {
          console.log(`[CardGrid] Triggering thumbnail-exiting completion for card ${i}`);
          onAnimationComplete(i, cardStates[i]);
        } else if (cardStates[i] === 'active-exiting') {
          console.log(`[CardGrid] Triggering active-exiting completion for card ${i}`);
          onAnimationComplete(i, cardStates[i]);
        } else if (cardStates[i] === 'thumbnail-entering') {
          console.log(`[CardGrid] Triggering thumbnail-entering completion for card ${i}`);
          onAnimationComplete(i, cardStates[i]);
        }
      }}
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
            {Array.from({ length: cardCount }).map((_, i) => (
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
            {Array.from({ length: cardCount }).map((_, i) => renderCard(i))}
          </Box>
        )}
      </Box>
    </MotionDiv>
  );
}; 