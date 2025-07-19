import React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { CardGrid } from './CardGrid';
import { useCardStateMachine } from '../hooks/useCardStateMachine';

const CARD_COUNT = 6;

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

  return (
    <CardGrid
      cardCount={CARD_COUNT}
      isMobile={isMobile}
      gridGap={gridGap}
      gridPadding={gridPadding}
      cardHeight={cardHeight}
      cardStates={cardStates}
      cardKeys={cardKeys}
      onCardClick={handleCardClick}
      onCardClose={handleCardClose}
      onAnimationComplete={handleAnimationComplete}
    />
  );
}; 