/*

INSTRUCTIONS: Refactor this component to use a state machine pattern.

Current Problem
- CardContainer.tsx handles both state management AND rendering
- Card.tsx handles both animation logic AND styling
- Complex state logic mixed with UI concerns

New Structure to refactor to:
src/
├── components/
│   ├── Card/
│   │   ├── Card.tsx              # Pure UI component
│   │   ├── CardContainer.tsx     # Layout wrapper
│   │   └── index.ts
│   └── CardGrid/
│       ├── CardGrid.tsx          # Pure UI component
│       └── index.ts
├── hooks/
│   ├── useCardStateMachine.ts    # State management logic
│   ├── useCardAnimations.ts      # Animation logic
│   └── useCardTransitions.ts     # Transition coordination
├── state/
│   ├── cardStateMachine.ts       # State machine logic
│   └── types.ts                  # Shared types
└── utils/
    └── animationTiming.ts        # Animation constants
*/ 

import React from 'react';
import { Box, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Card, CardCompoundState } from './Card';
import { motion } from 'framer-motion';

const CARD_COUNT = 6;

export const CardContainer: React.FC = () => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 48em)');

  // Compound state for each card
  const [cardStates, setCardStates] = React.useState<CardCompoundState[]>(
    Array(CARD_COUNT).fill('thumbnail-entered')
  );
  // Track which card is being activated
  const [pendingActiveIndex, setPendingActiveIndex] = React.useState<number | null>(null);
  // Track which card is currently active
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  // Track animating out cards
  const animatingOutCount = React.useRef(0);
  // Add cardKeys state for unique remounting
  const [cardKeys, setCardKeys] = React.useState(Array(CARD_COUNT).fill(0).map((_, i) => i));

  // Figma: 32px gap and padding, 3x2 grid desktop; 16px gap/padding, column mobile
  const gridGap = isMobile ? 16 : 16;
  const gridPadding = isMobile ? 16 : 32;
  const cardHeight = isMobile ? 359 : undefined;

  const MotionDiv = motion.div;

  // Handler for card click
  const handleCardClick = (index: number) => {
    setCardStates(states => {
      const newStates = states.map((_, i) =>
        i === index ? 'active-entering' : 'thumbnail-exiting'
      );
      console.log('[CardContainer] handleCardClick, newStates:', newStates);
      return newStates;
    });
    setPendingActiveIndex(index);
    animatingOutCount.current = CARD_COUNT - 1;
  };

  // Handler for when an animatingOut card finishes
  const handleAnimatingOutComplete = (index: number) => {
    // Only count thumbnail-exiting cards
    if (cardStates[index] !== 'thumbnail-exiting') return;
    animatingOutCount.current -= 1;
    console.log('[CardContainer] handleAnimatingOutComplete', { index, cardStates, animatingOutCount: animatingOutCount.current });
    if (animatingOutCount.current === 0 && pendingActiveIndex !== null) {
      // All animatingOut cards are done, set clicked card to active-entered, others to thumbnail-exited
      setCardStates(states => {
        const newStates = states.map((_, i) =>
          i === pendingActiveIndex ? 'active-entered' : 'thumbnail-exited'
        );
        console.log('[CardContainer] All animating out done, newStates:', newStates);
        return newStates;
      });
      setActiveIndex(pendingActiveIndex);
      setPendingActiveIndex(null);
    }
  };

  // Handler for close button
  const handleCardClose = () => {
    setCardStates(states => {
      const newStates = states.map((state, i) =>
        state.startsWith('active') ? 'active-exiting' : 'thumbnail-entering'
      );
      console.log('[CardContainer] handleCardClose, newStates:', newStates);
      return newStates;
    });
  };

  // Handler for when active card finishes exiting
  const handleActiveExitingComplete = (index: number) => {
    // Only respond if this card is active-exiting
    if (cardStates[index] !== 'active-exiting') return;
    console.log('[CardContainer] handleActiveExitingComplete', { index, cardStates });
    // Set just-closed card to 'thumbnail-entering', others to 'thumbnail-entered'
    setCardStates(() => {
      const newStates = Array(CARD_COUNT).fill('thumbnail-entered');
      newStates[index] = 'thumbnail-entering';
      console.log('[CardContainer] All cards reset, just-closed card to thumbnail-entering:', newStates);
      return newStates;
    });
    // Increment the key for the just-closed card to force remount
    setCardKeys(keys => {
      const newKeys = [...keys];
      newKeys[index] = newKeys[index] + 1;
      return newKeys;
    });
    setActiveIndex(null);
  };

  // Handler for when a thumbnail-entering card finishes its animation
  const handleThumbnailEnteringComplete = (index: number) => {
    if (cardStates[index] !== 'thumbnail-entering') return;
    setCardStates(states => {
      const newStates = [...states];
      newStates[index] = 'thumbnail-entered';
      console.log('[CardContainer] handleThumbnailEnteringComplete', { index, newStates });
      return newStates;
    });
  };

  const renderCard = (i: number) => (
    <Card
      key={cardKeys[i]}
      height={cardHeight}
      compoundState={cardStates[i]}
      onCardClick={() => handleCardClick(i)}
      onClose={handleCardClose}
      index={i}
      onAnimationComplete={() => {
        if (cardStates[i] === 'thumbnail-exiting') {
          handleAnimatingOutComplete(i);
        } else if (cardStates[i] === 'active-exiting') {
          handleActiveExitingComplete(i);
        } else if (cardStates[i] === 'thumbnail-entering') {
          handleThumbnailEnteringComplete(i);
        }
      }}
    />
  );

  return (
    <MotionDiv style={{ height: '100vh', width: '100vw' }}>
      <Box
        style={{
          background: '#f5f2e9',
          minHeight: isMobile ? '100vh' : undefined,
          height: isMobile ? undefined : '100vh',
          width: '100vw',
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