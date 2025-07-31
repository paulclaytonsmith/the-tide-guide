import React from 'react';
import { Paper, useMantineTheme, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { CardProps } from '../../state/types';
import { useCardAnimations } from '../../hooks/useCardAnimations';
import { ANIMATION_TIMING } from '../../utils/animationTiming';

const MotionDiv = motion.div;

export const Card: React.FC<CardProps> = ({
  title = 'Bolinas, CA, USA',
  onClose,
  children,
  height,
  compoundState,
  onCardClick,
  onAnimationComplete,
  index,
  pendingActiveIndex,
  style,
}) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: 48em)`); // 768px
  const animationConfig = useCardAnimations(compoundState, index, pendingActiveIndex);

  // Figma-based values from theme
  const radius = isMobile ? theme.radius.md : theme.radius.lg;
  const paddingY = isMobile ? theme.spacing.lg : theme.spacing.xl;
  const paddingX = isMobile ? theme.spacing.md : theme.spacing.xl;
  const headerFontSize = theme.fontSizes.lg;
  const textColor = theme.colors.ink?.[0] || '#232732';

  // Handler for card click (excluding close button)
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (compoundState.startsWith('active')) return; // Disable click when active
    if (onCardClick) onCardClick();
  };

  // Handler for close button
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose();
  };

  React.useEffect(() => {
    console.log(`[Card] render index=${index}, compoundState=${compoundState}, pointerEvents=${animationConfig.pointerEvents}`);
  });

  return (
    <MotionDiv
      ref={animationConfig.cardRef}
      initial={animationConfig.initialProps}
      animate={animationConfig.animateProps}
      exit={animationConfig.exitProps}
      style={{
        height: height || '100%',
        position: 'absolute',
        ...(animationConfig.pointerEvents ? { pointerEvents: animationConfig.pointerEvents } : {}),
        ...style,
      } as React.CSSProperties}
      onClick={handleCardClick}
      onAnimationComplete={() => {
        console.log(`[Card ${index}] Animation complete callback triggered for state: ${compoundState}`);
        // Only trigger completion for states that matter to the state machine
        if (['thumbnail-exiting', 'active-exiting', 'thumbnail-entering', 'active-entering'].includes(compoundState)) {
          console.log(`[Card ${index}] Calling onAnimationComplete for relevant state: ${compoundState}`);
          if (onAnimationComplete) onAnimationComplete();
        } else {
          console.log(`[Card ${index}] Ignoring animation complete for irrelevant state: ${compoundState}`);
        }
      }}
    >
      <Paper
        radius={radius}
        p={0}
        w="100%"
        h={height || '100%'}
        style={{
          background: animationConfig.cardBg,
          position: 'relative',
          overflow: 'hidden',
          height: height || '100%',
          transition: `background ${ANIMATION_TIMING.BACKGROUND_TRANSITION}s`,
        }}
      >
        {/* Header section with absolute positioning */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: `${paddingY} ${paddingX} 0 ${paddingX}`,
            gap: theme.spacing.md,
            height: 'auto',
            zIndex: 1,
          }}
        >
          <Text
            component="h2"
            fw={700}
            fz={headerFontSize}
            style={{
              fontFamily: theme.headings.fontFamily,
              color: textColor,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.32px',
              margin: 0,
            }}
          >
            {title}
          </Text>
          {animationConfig.showCloseButton && (
            <motion.button
              onClick={handleClose}
              aria-label="Close"
              initial={{ opacity: animationConfig.closeButtonOpacity }}
              animate={{ opacity: animationConfig.closeButtonOpacity }}
              transition={{ duration: ANIMATION_TIMING.CLOSE_BUTTON_FADE }}
              onAnimationComplete={() => {
                // If this is active-exiting and close button is fading out, trigger card completion
                if (compoundState === 'active-exiting' && animationConfig.closeButtonOpacity === 0) {
                  console.log(`[Card ${index}] Close button fade complete, triggering card completion`);
                  if (onAnimationComplete) onAnimationComplete();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginLeft: '16px',
                borderRadius: '50%',
                cursor: animationConfig.closeButtonOpacity === 1 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                width: 36,
                height: 36,
                pointerEvents: animationConfig.closeButtonOpacity === 1 ? 'auto' : 'none',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.5')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              <IconX size={28} stroke={1} color="#016AE9" />
            </motion.button>
          )}
        </div>
        
        {/* Content section with absolute positioning */}
        <div
          style={{
            position: 'absolute',
            top: paddingY + 24, // Account for header height
            left: 0,
            right: 0,
            bottom: isMobile ? theme.spacing.lg : theme.spacing.lg,
            padding: `0 ${paddingX}`,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
          }}
        >
          {children}
        </div>
      </Paper>
    </MotionDiv>
  );
}; 