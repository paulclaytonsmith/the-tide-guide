import React from 'react';
import { Paper, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export const Card: React.FC = () => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: 48em)`); // 768px
  return (
    <Paper
      radius={theme.radius.lg}
      p="xl"
      w="100%"
      h="100%"
      style={{
        background: theme.colors.card?.[0] || '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Card content goes here */}
    </Paper>
  );
}; 