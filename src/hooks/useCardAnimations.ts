import { useMemo, useRef, useEffect, useState } from 'react';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { CardCompoundState, AnimationConfig } from '../state/types';
import { ANIMATION_TIMING } from '../utils/animationTiming';

// Interface for storing measured dimensions
interface CardDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Hook to measure card dimensions
const useCardMeasurements = (index: number | undefined, isMobile: boolean, compoundState: CardCompoundState) => {
  const [measurements, setMeasurements] = useState<CardDimensions | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index === undefined || !cardRef.current) return;

    const measureCard = () => {
      const card = cardRef.current;
      if (!card) return;

      // Only measure when card is in thumbnail state
      if (!compoundState.startsWith('thumbnail-entered')) return;

      const rect = card.getBoundingClientRect();
      const container = card.closest('[data-card-container]') as HTMLElement;
      
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      
      // Calculate position relative to container
      const top = rect.top - containerRect.top;
      const left = rect.left - containerRect.left;
      
      setMeasurements({
        top,
        left,
        width: rect.width,
        height: rect.height,
      });
    };

    // Measure after a short delay to ensure layout is complete
    const timeoutId = setTimeout(measureCard, 100);
    
    // Also measure on window resize
    window.addEventListener('resize', measureCard);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureCard);
    };
  }, [index, isMobile, compoundState]);

  return { measurements, cardRef };
};

export const useCardAnimations = (compoundState: CardCompoundState, index?: number, pendingActiveIndex?: number | null): AnimationConfig => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 48em)');
  const { measurements, cardRef } = useCardMeasurements(index, isMobile, compoundState);

  return useMemo(() => {
    let initialProps: any = undefined;
    let animateProps: any = undefined;
    let exitProps: any = undefined;
    let pointerEvents: React.CSSProperties['pointerEvents'] = undefined;
    let showCloseButton = false;
    let closeButtonOpacity = 0;
    let cardBg = theme.colors.card?.[0] || '#fff';

    // Calculate container dimensions and padding
    const gridGap = isMobile ? 16 : 16;
    const gridPadding = isMobile ? 16 : 32;

    // Calculate the full container size (respecting padding)
    const getFullContainerStyle = () => {
      if (isMobile) {
        // On mobile, use viewport height instead of container height
        return {
          top: gridPadding,
          left: gridPadding,
          width: `calc(100% - ${gridPadding * 2}px)`,
          height: `calc(100vh - ${gridPadding * 2}px)`,
        };
      }
      return {
        top: gridPadding,
        left: gridPadding,
        width: `calc(100% - ${gridPadding * 2}px)`,
        height: `calc(100% - ${gridPadding * 2}px)`,
      };
    };

    // Get measured thumbnail dimensions or fallback to calculated ones
    const getThumbnailStyle = () => {
      // For mobile, prioritize calculated dimensions over measured ones
      // since the measured dimensions appear to be incorrect for mobile layout
      if (isMobile) {
        if (index !== undefined) {
          const cardHeight = 359;
          const cardWidth = `calc(100% - ${gridPadding * 2}px)`;
          const cardTop = `calc(${gridPadding}px + ${index} * (${cardHeight}px + ${gridGap}px))`;
          
          const mobileThumbnailStyle = {
            top: cardTop,
            left: gridPadding,
            width: cardWidth,
            height: cardHeight,
          };
          
          return mobileThumbnailStyle;
        }
      }
      
      // For desktop or when measurements are available and we're not on mobile
      if (measurements && !isMobile) {
        return {
          top: measurements.top,
          left: measurements.left,
          width: measurements.width,
          height: measurements.height,
        };
      }
      
      // Fallback to calculated dimensions if measurements aren't available yet
      if (index !== undefined) {
        if (isMobile) {
          const cardHeight = 359;
          const cardWidth = `calc(100% - ${gridPadding * 2}px)`;
          const cardTop = `calc(${gridPadding}px + ${index} * (${cardHeight}px + ${gridGap}px))`;
          
          const mobileThumbnailStyle = {
            top: cardTop,
            left: gridPadding,
            width: cardWidth,
            height: cardHeight,
          };
          
          return mobileThumbnailStyle;
        } else {
          const row = Math.floor(index / 3);
          const col = index % 3;
          
          const cardWidth = `calc((100% - ${gridPadding * 2}px - ${gridGap * 2}px) / 3)`;
          const cardHeightValue = `calc((100% - ${gridPadding * 2}px - ${gridGap}px) / 2)`;
          
          const cardTop = `calc(${gridPadding}px + ${row} * (${cardHeightValue} + ${gridGap}px))`;
          const cardLeft = `calc(${gridPadding}px + ${col} * (${cardWidth} + ${gridGap}px))`;
          
          const desktopThumbnailStyle = {
            top: cardTop,
            left: cardLeft,
            width: cardWidth,
            height: cardHeightValue,
          };
          
          return desktopThumbnailStyle;
        }
      }
      
      return null;
    };

    const thumbnailStyle = getThumbnailStyle();
    const fullStyle = getFullContainerStyle();

    switch (compoundState) {
      case 'thumbnail-entered':
        if (thumbnailStyle) {
          initialProps = { 
            opacity: 1, 
            scale: 1,
            top: thumbnailStyle.top,
            left: thumbnailStyle.left,
            width: thumbnailStyle.width,
            height: thumbnailStyle.height,
          };
          animateProps = { 
            opacity: 1, 
            scale: 1,
            top: thumbnailStyle.top,
            left: thumbnailStyle.left,
            width: thumbnailStyle.width,
            height: thumbnailStyle.height,
            transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
          };
        } else {
          animateProps = { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
          };
        }
        exitProps = { 
          opacity: 0, 
          scale: 0.95, 
          transition: { duration: ANIMATION_TIMING.CARD_EXIT_FAST } 
        };
        break;

      case 'thumbnail-exiting':
        if (thumbnailStyle) {
          animateProps = { 
            opacity: 0, 
            scale: 0.95,
            top: thumbnailStyle.top,
            left: thumbnailStyle.left,
            width: thumbnailStyle.width,
            height: thumbnailStyle.height,
            transition: { duration: ANIMATION_TIMING.CARD_EXIT } 
          };
        } else {
          animateProps = { 
            opacity: 0, 
            scale: 0.95, 
            transition: { duration: ANIMATION_TIMING.CARD_EXIT } 
          };
        }
        pointerEvents = 'none';
        break;

      case 'thumbnail-entering':
        if (thumbnailStyle) {
          animateProps = { 
            opacity: 1, 
            scale: 1,
            top: thumbnailStyle.top,
            left: thumbnailStyle.left,
            width: thumbnailStyle.width,
            height: thumbnailStyle.height,
            transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
          };
        } else {
          animateProps = { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
          };
        }
        break;

      case 'thumbnail-exited':
        if (thumbnailStyle) {
          animateProps = { 
            opacity: 0, 
            scale: 0.95,
            top: thumbnailStyle.top,
            left: thumbnailStyle.left,
            width: thumbnailStyle.width,
            height: thumbnailStyle.height,
            transition: { duration: ANIMATION_TIMING.CARD_EXIT_INSTANT } 
          };
        } else {
          animateProps = { 
            opacity: 0, 
            scale: 0.95, 
            transition: { duration: ANIMATION_TIMING.CARD_EXIT_INSTANT } 
          };
        }
        pointerEvents = 'none';
        break;

      case 'active-entering':
        if (thumbnailStyle) {
          initialProps = { 
            opacity: 1, 
            scale: 1,
            top: thumbnailStyle.top,
            left: thumbnailStyle.left,
            width: thumbnailStyle.width,
            height: thumbnailStyle.height,
          };
          animateProps = { 
            opacity: 1, 
            scale: 1,
            top: fullStyle.top,
            left: fullStyle.left,
            width: fullStyle.width,
            height: fullStyle.height,
            transition: { 
              duration: ANIMATION_TIMING.CARD_ENTER,
              ease: 'easeInOut'
            } 
          };
        } else {
          initialProps = { opacity: 1, scale: 1 };
          animateProps = { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: ANIMATION_TIMING.CARD_ENTER } 
          };
        }
        cardBg = '#ffe066'; // yellow
        break;

      case 'active-entered':
        animateProps = { 
          opacity: 1, 
          scale: 1,
          top: fullStyle.top,
          left: fullStyle.left,
          width: fullStyle.width,
          height: fullStyle.height,
        };
        showCloseButton = true;
        closeButtonOpacity = 1;
        cardBg = '#00e884'; // green/accent
        break;

      case 'active-exiting':
        if (thumbnailStyle) {
          animateProps = { 
            opacity: 1, 
            scale: 1,
            top: thumbnailStyle.top,
            left: thumbnailStyle.left,
            width: thumbnailStyle.width,
            height: thumbnailStyle.height,
            transition: { 
              duration: ANIMATION_TIMING.CARD_EXIT,
              ease: 'easeInOut'
            } 
          };
        } else {
          animateProps = { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: ANIMATION_TIMING.CARD_EXIT } 
          };
        }
        showCloseButton = true;
        closeButtonOpacity = 0;
        break;

      default:
        animateProps = { opacity: 1, scale: 1 };
    }

    const result = {
      initialProps,
      animateProps,
      exitProps,
      pointerEvents,
      showCloseButton,
      closeButtonOpacity,
      cardBg,
      cardRef, // Expose the ref for measurement
    };

    return result;
  }, [compoundState, theme.colors.card, index, isMobile, pendingActiveIndex, measurements]);
}; 