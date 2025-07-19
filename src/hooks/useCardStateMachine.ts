import { useReducer, useCallback } from 'react';
import { CardCompoundState } from '../state/types';
import { cardStateReducer, getInitialState } from '../state/cardStateMachine';

export const useCardStateMachine = () => {
  const [state, dispatch] = useReducer(cardStateReducer, getInitialState());

  const handleCardClick = useCallback((index: number) => {
    console.log('[useCardStateMachine] handleCardClick, index:', index);
    dispatch({ type: 'CARD_CLICK', index });
  }, []);

  const handleCardClose = useCallback(() => {
    console.log('[useCardStateMachine] handleCardClose');
    dispatch({ type: 'CARD_CLOSE' });
  }, []);

  const handleAnimationComplete = useCallback((index: number, cardState: CardCompoundState) => {
    console.log('[useCardStateMachine] handleAnimationComplete', { index, cardState });
    dispatch({ type: 'ANIMATION_COMPLETE', index, state: cardState });
  }, []);

  return {
    // State
    cardStates: state.cardStates,
    activeIndex: state.activeIndex,
    pendingActiveIndex: state.pendingActiveIndex,
    animatingOutCount: state.animatingOutCount,
    cardKeys: state.cardKeys,
    
    // Actions
    handleCardClick,
    handleCardClose,
    handleAnimationComplete,
  };
}; 