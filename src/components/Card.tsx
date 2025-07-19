import React from 'react';
import { Paper, useMantineTheme, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';

// Compound state types
export type CardRole = 'thumbnail' | 'active';
export type CardPhase = 'entering' | 'entered' | 'exiting' | 'exited';
export type CardCompoundState = `${CardRole}-${CardPhase}`;

interface CardProps {
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  height?: number | string;
  compoundState: CardCompoundState;
  onCardClick?: () => void;
  onAnimationComplete?: () => void;
}

const MotionDiv = motion.div;

export const Card: React.FC<CardProps & { index?: number }> = ({
  title = 'Bolinas, CA, USA',
  onClose,
  children,
  height,
  compoundState,
  onCardClick,
  onAnimationComplete,
  index,
}) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: 48em)`); // 768px

  // Figma-based values from theme
  const radius = isMobile ? theme.radius.md : theme.radius.lg;
  const paddingY = isMobile ? theme.spacing.lg : theme.spacing.xl;
  const paddingX = isMobile ? theme.spacing.md : theme.spacing.xl;
  const headerFontSize = theme.fontSizes.lg;
  let cardBg = theme.colors.card?.[0] || '#fff';
  if (compoundState === 'active-entering') {
    cardBg = '#ffe066'; // yellow
  } else if (compoundState === 'active-entered') {
    cardBg = '#00e884'; // green/accent
  }
  const textColor = theme.colors.ink?.[0] || '#232732';

  // Animation logic based on compoundState
  let initialProps: any = undefined;
  let animateProps: any = undefined;
  let exitProps: any = undefined;
  let pointerEvents: React.CSSProperties['pointerEvents'] = undefined;
  // Determine if close button should be rendered (for animation)
  const showCloseButton = compoundState === 'active-entered' || compoundState === 'active-exiting';
  // Animate close button opacity
  let closeButtonOpacity = 0;
  if (compoundState === 'active-entered') closeButtonOpacity = 1;
  if (compoundState === 'active-exiting') closeButtonOpacity = 0;

  switch (compoundState) {
    case 'thumbnail-entered':
      initialProps = { opacity: 0, scale: 0.95 };
      animateProps = { opacity: 1, scale: 1, transition: { duration: 0.3 } };
      exitProps = { opacity: 0, scale: 0.95, transition: { duration: 0.2 } };
      break;
    case 'thumbnail-exiting':
      animateProps = { opacity: 0, scale: 0.95, transition: { duration: 0.3 } };
      pointerEvents = 'none';
      break;
    case 'thumbnail-entering':
      initialProps = { opacity: 0, scale: 0.95 };
      animateProps = { opacity: 1, scale: 1, transition: { duration: 0.3 } };
      break;
    case 'thumbnail-exited':
      animateProps = { opacity: 0, scale: 0.95, transition: { duration: 0.01 } };
      pointerEvents = 'none';
      break;
    case 'active-entering':
      initialProps = { opacity: 1, scale: 1 };
      animateProps = { opacity: 1, scale: 1, transition: { duration: 0.3 } };
      break;
    case 'active-entered':
      animateProps = { opacity: 1, scale: 1 };
      break;
    case 'active-exiting':
      animateProps = { opacity: 1, scale: 1, transition: { duration: 0.3 } };
      break;
    default:
      animateProps = { opacity: 1, scale: 1 };
  }

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
    console.log(`[Card] render index=${index}, compoundState=${compoundState}, pointerEvents=${pointerEvents}`);
  });

  return (
    <MotionDiv
      initial={initialProps}
      animate={animateProps}
      exit={exitProps}
      style={{
        height: height || '100%',
        ...(pointerEvents ? { pointerEvents } : {}),
      } as React.CSSProperties}
      onClick={handleCardClick}
      onAnimationComplete={() => {
        console.log(`[Card] onAnimationComplete index=${index}, compoundState=${compoundState}`);
        if (onAnimationComplete) onAnimationComplete();
      }}
    >
      <Paper
        radius={radius}
        p={0}
        w="100%"
        h={height || '100%'}
        style={{
          background: cardBg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          height: height || '100%',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: `${paddingY} ${paddingX} 0 ${paddingX}`,
            gap: theme.spacing.md,
            height: 'auto',
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
          {showCloseButton && (
            <motion.button
              onClick={handleClose}
              aria-label="Close"
              initial={{ opacity: closeButtonOpacity }}
              animate={{ opacity: closeButtonOpacity }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginLeft: '16px',
                borderRadius: '50%',
                cursor: closeButtonOpacity === 1 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                width: 36,
                height: 36,
                pointerEvents: closeButtonOpacity === 1 ? 'auto' : 'none',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.5')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              <IconX size={28} stroke={1} color="#016AE9" />
            </motion.button>
          )}
        </div>
        <div
          style={{
            padding: `0 ${paddingX} ${isMobile ? theme.spacing.lg : theme.spacing.lg} ${paddingX}`,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
            height: '100%',
          }}
        >
          {children}
        </div>
      </Paper>
    </MotionDiv>
  );
}; 