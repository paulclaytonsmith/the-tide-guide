import { useCallback } from 'react';
import { CardCompoundState } from '../state/types';
import { ANIMATION_TIMING } from '../utils/animationTiming';

export const useCardTransitions = () => {
  const getTransitionDuration = useCallback((state: CardCompoundState): number => {
    switch (state) {
      case 'thumbnail-entered':
        return ANIMATION_TIMING.CARD_ENTER;
      case 'thumbnail-exiting':
        return ANIMATION_TIMING.CARD_EXIT;
      case 'thumbnail-entering':
        return ANIMATION_TIMING.CARD_ENTER;
      case 'thumbnail-exited':
        return ANIMATION_TIMING.CARD_EXIT_INSTANT;
      case 'active-entering':
        return ANIMATION_TIMING.CARD_ENTER;
      case 'active-entered':
        return 0; // No transition needed
      case 'active-exiting':
        return ANIMATION_TIMING.CARD_EXIT;
      default:
        return ANIMATION_TIMING.CARD_ENTER;
    }
  }, []);

  const shouldTriggerAnimationComplete = useCallback((state: CardCompoundState): boolean => {
    return state === 'thumbnail-exiting' || 
           state === 'active-exiting' || 
           state === 'thumbnail-entering';
  }, []);

  return {
    getTransitionDuration,
    shouldTriggerAnimationComplete,
  };
}; 