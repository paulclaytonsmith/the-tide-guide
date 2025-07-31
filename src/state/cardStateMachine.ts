import { CardStateContext, CardStateEvent, CardCompoundState } from './types';

const CARD_COUNT = 6;

// Initial state
export const getInitialState = (): CardStateContext => ({
  cardStates: Array(CARD_COUNT).fill('thumbnail-entered'),
  activeIndex: null,
  pendingActiveIndex: null,
  animatingOutCount: 0,
  cardKeys: Array(CARD_COUNT).fill(0).map((_, i) => i),
});

// State machine reducer
export const cardStateReducer = (
  state: CardStateContext,
  event: CardStateEvent
): CardStateContext => {
  switch (event.type) {
    case 'CARD_CLICK': {
      const { index } = event;
      console.log('[StateMachine] CARD_CLICK', { index, currentStates: state.cardStates });
      return {
        ...state,
        cardStates: state.cardStates.map((_, i) =>
          i === index ? 'thumbnail-entered' : 'thumbnail-exiting'
        ),
        pendingActiveIndex: index,
        animatingOutCount: CARD_COUNT - 1,
      };
    }

    case 'CARD_CLOSE': {
      console.log('[StateMachine] CARD_CLOSE', { currentStates: state.cardStates });
      const newStates = state.cardStates.map((cardState) =>
        cardState.startsWith('active') ? 'active-exiting' : cardState
      );
      console.log('[StateMachine] CARD_CLOSE result', { newStates });
      return {
        ...state,
        cardStates: newStates,
      };
    }

    case 'ANIMATION_COMPLETE': {
      const { index, state: cardState } = event;
      console.log('[StateMachine] ANIMATION_COMPLETE', { index, cardState, currentStates: state.cardStates });
      
      // Handle thumbnail-exiting animation completion
      if (cardState === 'thumbnail-exiting') {
        const newAnimatingOutCount = state.animatingOutCount - 1;
        console.log('[StateMachine] thumbnail-exiting complete', { index, newAnimatingOutCount });
        
        if (newAnimatingOutCount === 0 && state.pendingActiveIndex !== null) {
          // All animatingOut cards are done, now start the active card animation
          const newStates = state.cardStates.map((_, i) =>
            i === state.pendingActiveIndex ? 'active-entering' : 'thumbnail-exited'
          );
          console.log('[StateMachine] All thumbnail-exiting complete, starting active card animation', { newStates });
          return {
            ...state,
            cardStates: newStates,
            animatingOutCount: 0,
          };
        }
        
        return {
          ...state,
          animatingOutCount: newAnimatingOutCount,
        };
      }
      
      // Handle active-exiting animation completion
      if (cardState === 'active-exiting') {
        console.log('[StateMachine] active-exiting complete', { index, currentStates: state.cardStates });
        
        // Find which card was actually the active card (the one in active-exiting state)
        const activeCardIndex = state.cardStates.findIndex(_ => _ === 'active-exiting');
        console.log('[StateMachine] Found active card at index:', activeCardIndex);
        
        // Now that active card has completed its exit, start thumbnail-entering animations
        const newCardStates: CardCompoundState[] = state.cardStates.map((_, i) =>
          i === activeCardIndex ? 'thumbnail-entered' : 'thumbnail-entering'
        );
        console.log('[StateMachine] Setting active card to thumbnail-entered, others to thumbnail-entering', { newCardStates });
        
        return {
          ...state,
          cardStates: newCardStates,
          activeIndex: null,
        };
      }
      
      // Handle active-entering animation completion
      if (cardState === 'active-entering') {
        console.log('[StateMachine] active-entering complete', { index });
        const newCardStates = [...state.cardStates];
        newCardStates[index] = 'active-entered';
        
        return {
          ...state,
          cardStates: newCardStates,
          activeIndex: state.pendingActiveIndex,
          pendingActiveIndex: null,
        };
      }
      
      // Handle thumbnail-entering animation completion
      if (cardState === 'thumbnail-entering') {
        console.log('[StateMachine] thumbnail-entering complete', { index });
        const newCardStates = [...state.cardStates];
        newCardStates[index] = 'thumbnail-entered';
        
        return {
          ...state,
          cardStates: newCardStates,
        };
      }
      
      return state;
    }

    default:
      return state;
  }
};

// Helper functions for state machine
export const isCardActive = (state: CardCompoundState): boolean => {
  return state.startsWith('active');
};

export const isCardAnimating = (state: CardCompoundState): boolean => {
  return state.includes('entering') || state.includes('exiting');
};

export const canCardBeClicked = (state: CardCompoundState): boolean => {
  return state === 'thumbnail-entered';
}; 