import { useMemo } from 'react';
import { useMantineTheme } from '@mantine/core';
import { CardCompoundState, AnimationConfig } from '../state/types';
import { ANIMATION_TIMING } from '../utils/animationTiming';

export const useCardAnimations = (compoundState: CardCompoundState): AnimationConfig => {
  const theme = useMantineTheme();

  return useMemo(() => {
    let initialProps: any = undefined;
    let animateProps: any = undefined;
    let exitProps: any = undefined;
    let pointerEvents: React.CSSProperties['pointerEvents'] = undefined;
    let showCloseButton = false;
    let closeButtonOpacity = 0;
    let cardBg = theme.colors.card?.[0] || '#fff';

    switch (compoundState) {
      case 'thumbnail-entered':
        // Don't set initialProps for thumbnail-entered to avoid starting with opacity 0
        animateProps = { 
          opacity: 1, 
          scale: 1, 
          transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
        };
        exitProps = { 
          opacity: 0, 
          scale: 0.95, 
          transition: { duration: ANIMATION_TIMING.CARD_EXIT_FAST } 
        };
        break;

      case 'thumbnail-exiting':
        animateProps = { 
          opacity: 0, 
          scale: 0.95, 
          transition: { duration: ANIMATION_TIMING.CARD_EXIT } 
        };
        pointerEvents = 'none';
        break;

      case 'thumbnail-entering':
        // Don't set initialProps to allow cards to animate in from their current state
        animateProps = { 
          opacity: 1, 
          scale: 1, 
          transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
        };
        break;

      case 'thumbnail-exited':
        animateProps = { 
          opacity: 0, 
          scale: 0.95, 
          transition: { duration: ANIMATION_TIMING.CARD_EXIT_INSTANT } 
        };
        pointerEvents = 'none';
        break;

      case 'active-entering':
        initialProps = { opacity: 1, scale: 1 };
        animateProps = { 
          opacity: 1, 
          scale: 1, 
          transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
        };
        cardBg = '#ffe066'; // yellow
        break;

      case 'active-entered':
        animateProps = { opacity: 1, scale: 1 };
        showCloseButton = true;
        closeButtonOpacity = 1;
        cardBg = '#00e884'; // green/accent
        break;

      case 'active-exiting':
        animateProps = { 
          opacity: 1, 
          scale: 1, 
          transition: { duration: ANIMATION_TIMING.CARD_EXIT } 
        };
        showCloseButton = true;
        closeButtonOpacity = 0;
        // Add a small delay to ensure the close button fade animation completes
        // This will trigger the onAnimationComplete callback
        break;

      default:
        animateProps = { opacity: 1, scale: 1 };
    }

    return {
      initialProps,
      animateProps,
      exitProps,
      pointerEvents,
      showCloseButton,
      closeButtonOpacity,
      cardBg,
    };
  }, [compoundState, theme.colors.card]);
}; 