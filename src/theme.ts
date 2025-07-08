/*
INSTRUCTIONS: Translating Figma Design Tokens to Mantine Theme (theme.ts)

1. COLORS
- Identify all color tokens in Figma (backgrounds, text, accents, borders, chart elements, etc.).
- Assign each color a semantic name (e.g., background, card, ink, accent, chartTick).
- Add each color as a 10-step array using makeColorArray for Mantine's color system.
- Map Figma color variables (e.g., Light Ink, Light Primary) to theme color keys.

2. TYPOGRAPHY
- Extract font families, weights, and sizes from Figma for headings, body, and special text.
- Set fontFamily and headings.fontFamily to match Figma's primary font stack.
- Map Figma font sizes to theme.fontSizes (use string values with 'px').
- Set heading sizes and weights in theme.headings.sizes.

3. RADII
- Extract border radius values for cards, buttons, markers, etc.
- Add each radius as a string with 'px' units in the radii object.
- Pass the radii object to theme.radius for custom radii.

4. SPACING
- Extract spacing (padding, margin, gaps) from Figma.
- Map to theme.spacing as string values with 'px'.

5. BREAKPOINTS
- Identify mobile and desktop breakpoints in Figma.
- Set theme.breakpoints to match these breakpoints (in 'em' units).

6. COMPONENT OVERRIDES
- For unique component styles (e.g., Card, Button), use the theme.components key or the styles prop on Mantine components.
- Use semantic color and spacing keys for consistency.

7. GENERAL
- Always use semantic names for colors and tokens, not raw hex codes in components.
- Keep this comment block updated as the design system evolves.
*/
import { createTheme, MantineThemeOverride } from '@mantine/core';

// Color palette extracted from Figma
const colors = {
  background: '#f5f2e9', // App background
  card: '#ffffff',       // Card/Tile background
  ink: '#232732',        // Primary text
  inkSecondary: '#3d455a', // Secondary text
  accent: '#00e884',     // Accent (rate, positive values)
  chartTick: '#a7a7a7',  // Chart ticks
  hiLo: '#07232f',       // Hi/Lo marker text
  white: '#ffffff',
  blue: '#016AE9',
  // Figma variables
  lightInk: '#000000',
  lightPrimary: '#ffffff',
  lightSecondary: '#AEB3BE',
  darkInk: '#ffffff',
  lightAction: '#0F77F0',
};

// Helper to create a 10-step color array for Mantine
const makeColorArray = (color: string) => Array(10).fill(color) as [string, string, string, string, string, string, string, string, string, string];

// Font families
const fontFamily = `'Founders Grotesk Condensed', 'Noto Sans', 'Segoe UI', Arial, sans-serif`;

// Font sizes (Mantine expects string values with units)
const fontSizes = {
  xs: '12px',
  sm: '16px', // body, axis
  md: '24px',
  lg: '32px', // headers, location
  xl: '40px',
};

// Radii (Mantine expects string values with units)
const radii = {
  xs: '5px',    // buttons, small elements
  sm: '13px',   // markers
  md: '24px',   // mobile card
  lg: '36px',   // desktop card
  xl: '100px',  // pill/home indicator
};

// Spacing (Mantine expects string values with units)
const spacing = {
  xs: '4px',
  sm: '10px',
  md: '16px',
  lg: '30px',
  xl: '36px',
};

// Breakpoints (Mantine default + custom for mobile/desktop)
const breakpoints = {
  xs: '0em',    // 0px
  sm: '30em',   // 480px
  md: '48em',   // 768px
  lg: '64em',   // 1024px
  xl: '90em',   // 1440px
};

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'accent',
  colors: {
    accent: makeColorArray(colors.accent),
    background: makeColorArray(colors.background),
    card: makeColorArray(colors.card),
    ink: makeColorArray(colors.ink),
    inkSecondary: makeColorArray(colors.inkSecondary),
    hiLo: makeColorArray(colors.hiLo),
    chartTick: makeColorArray(colors.chartTick),
    white: makeColorArray(colors.white),
    // Figma variables
    lightInk: makeColorArray(colors.lightInk),
    lightPrimary: makeColorArray(colors.lightPrimary),
    lightSecondary: makeColorArray(colors.lightSecondary),
    darkInk: makeColorArray(colors.darkInk),
    lightAction: makeColorArray(colors.lightAction),
  },
  fontFamily,
  headings: {
    fontFamily,
    fontWeight: '700',
    sizes: {
      h1: { fontSize: fontSizes.lg, fontWeight: '700' },
      h2: { fontSize: fontSizes.md, fontWeight: '700' },
      h3: { fontSize: fontSizes.sm, fontWeight: '700' },
    },
  },
  fontSizes,
  radius: radii, // pass the radii object for custom radii
  spacing,
  breakpoints,
  // You can add more component overrides here as needed
}); 