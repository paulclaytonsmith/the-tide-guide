import React from 'react';
import { Paper, useMantineTheme, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';

interface CardProps {
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title = 'Bolinas, CA, USA', onClose, children }) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: 48em)`); // 768px

  // Figma-based values from theme
  const radius = isMobile ? theme.radius.md : theme.radius.lg;
  const paddingY = isMobile ? theme.spacing.lg : theme.spacing.xl; // 30px (mobile) / 36px (desktop)
  const paddingX = isMobile ? theme.spacing.md : theme.spacing.xl; // 24px (mobile) / 36px (desktop)
  const headerFontSize = theme.fontSizes.lg; // 32px
  const cardBg = theme.colors.card?.[0] || '#fff';
  const textColor = theme.colors.ink?.[0] || '#232732';

  return (
    <Paper
      radius={radius}
      p={0}
      w="100%"
      h="100%"
      style={{
        background: cardBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: `${paddingY} ${paddingX} 0 ${paddingX}`,
          gap: theme.spacing.md,
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
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            marginLeft: '16px', // or theme.spacing.md
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            width: 36,
            height: 36,
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.5')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          <IconX size={28} stroke={1} color="#016AE9" />
        </button>
      </div>
      <div
        style={{
          padding: `0 ${paddingX} ${isMobile ? theme.spacing.lg : theme.spacing.lg} ${paddingX}`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
        }}
      >
        {children}
      </div>
    </Paper>
  );
}; 