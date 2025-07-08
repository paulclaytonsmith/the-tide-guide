import React from 'react';
import { Box, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Card } from './Card';

export const CardContainer: React.FC = () => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 48em)'); // 768px

  // Figma: 32px gap and padding, 3x2 grid desktop; 16px gap/padding, column mobile
  const gridGap = isMobile ? 16 : 16;
  const gridPadding = isMobile ? 16 : 32;
  const cardHeight = isMobile ? 359 : undefined;

  return (
    <Box
      style={{
        background: '#f5f2e9',
        minHeight: isMobile ? '100vh' : undefined,
        height: isMobile ? undefined : '100vh',
        width: '100vw',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        alignItems: 'stretch',
      }}
    >
      {isMobile ? (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: gridGap,
            padding: gridPadding,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Box key={i} style={{ width: '100%', height: cardHeight }}>
              <Card height={cardHeight} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: gridGap,
            padding: gridPadding,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Card key={i} />
          ))}
        </Box>
      )}
    </Box>
  );
}; 