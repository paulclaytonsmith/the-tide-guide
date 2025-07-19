// Animation timing constants
export const ANIMATION_TIMING = {
  // Card animations
  CARD_ENTER: 0.5,
  CARD_EXIT: 0.5,
  CARD_EXIT_FAST: 0.5,
  CARD_EXIT_INSTANT: 0.01,
  
  // Close button animations
  CLOSE_BUTTON_FADE: 1.0, // Increased to match BACKGROUND_TRANSITION
  
  // Background color transitions
  BACKGROUND_TRANSITION: 1.0, // Increased from 0.2 to 3.0 seconds for better observation
} as const;

// Animation easing functions
export const ANIMATION_EASING = {
  DEFAULT: 'easeInOut',
  FAST: 'easeOut',
} as const; 