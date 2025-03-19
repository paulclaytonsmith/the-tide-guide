// Viewport and layout
export const VIEWPORT_WIDTHS = 3;  // How many viewport widths wide the chart should be

// Time axis settings
export const TIME_AXIS_CONFIG = {
  labelFrequency: 6,  // Hours between each label
  bottomPadding: 12,  // Padding below time axis in pixels
} as const;

// Animation settings
export const ANIMATION_CONFIG = {
  labels: {
    motion: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // Bouncy easing with overshoot
      delay: 0.1,
      initialY: -20,
    },
    opacity: {
      duration: 0.1,
      ease: "easeOut",
      delay: 0.1,
    },
    container: {
      duration: 0.2,
      ease: "easeInOut",
    }
  }
} as const;

// Chart drawing settings
export const CHART_CONFIG = {
  // Range settings
  rangeMultiplier: 2,  // Extends range in both directions
  
  // Spacing and offsets
  topOffset: 24,       // Offset from top of chart in pixels
  bottomOffset: 0.3,   // Offset from bottom as percentage of height
  
  // Visual settings
  waveOpacity: 1,    // Opacity of the wave path
  
  // Point markers
  markerSize: 8,      // Size of high/low point markers in pixels
  markerBorder: 3,     // Border width of markers in pixels
  labelOffset: 12,     // Distance between marker and label in pixels
} as const; 