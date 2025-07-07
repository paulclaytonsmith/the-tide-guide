import React from 'react';
import { Box, Group, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Card } from './Card';

export const CardContainer: React.FC = () => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 48em)'); // 768px
  return (
    <Box
      style={{
        background: theme.colors.background?.[0] || '#f5f2e9',
        height: 'calc(var(--vh, 1vh) * 100)', // ✅ use real viewport height
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? theme.spacing.sm : theme.spacing.md,
      }}
    >
        <Card />
    </Box>
  );
}; 