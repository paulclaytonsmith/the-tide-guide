// Card state machine types
export type CardRole = 'thumbnail' | 'active';
export type CardPhase = 'entering' | 'entered' | 'exiting' | 'exited';
export type CardCompoundState = `${CardRole}-${CardPhase}`;



// Card state machine context
export interface CardStateContext {
  cardStates: CardCompoundState[];
  activeIndex: number | null;
  pendingActiveIndex: number | null;
  animatingOutCount: number;
  cardKeys: number[];
}

// Card state machine events
export type CardStateEvent = 
  | { type: 'CARD_CLICK'; index: number }
  | { type: 'CARD_CLOSE' }
  | { type: 'ANIMATION_COMPLETE'; index: number; state: CardCompoundState };

// Animation configuration
export interface AnimationConfig {
  initialProps?: any;
  animateProps?: any;
  exitProps?: any;
  pointerEvents?: React.CSSProperties['pointerEvents'];
  showCloseButton: boolean;
  closeButtonOpacity: number;
  cardBg: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

// Card component props
export interface CardProps {
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  height?: number | string;
  compoundState: CardCompoundState;
  onCardClick?: () => void;
  onAnimationComplete?: () => void;
  index?: number;
  pendingActiveIndex?: number | null;
  style?: React.CSSProperties;
} 