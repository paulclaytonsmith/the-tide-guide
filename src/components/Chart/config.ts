// Time settings
export const TIME_CONFIG = {
  daysToDisplay: 3,     // Number of days to show in the chart, including today
  hourlyInterval: 1,    // Hours between each tide prediction
  startHour: 21,       // Start at 9 PM yesterday (21:00)
} as const;

// Viewport and layout
export const VIEWPORT_WIDTHS = 3;  // How many viewport widths wide the chart should be

// Time axis settings
export const TIME_AXIS_CONFIG = {
  labelFrequency: 6,  // Hours between each label
  bottomPadding: 12,  // Padding below time axis in pixels
} as const;

// Animation settings
export const SPRING_CONFIG = { // for wave and labels
  stiffness: 15,    // Reduced from 50
  damping: 15,
  mass: 6,         // Increased from 2
  restSpeed: 0.001,
  restDelta: 0.001
} as const;

export const ANIMATION_CONFIG = {
  wave: {
    spring: SPRING_CONFIG,
    duration: {
      duration: 5,  // 5 seconds
      ease: [0.4, 0, 0.2, 1]  // Custom easing for smooth animation
    }
  },
  labels: {
    spring: SPRING_CONFIG,
    offset: 100, // Distance labels move from their initial position
    opacity: {
      duration: 0.1,
      ease: "easeOut",
      delay: 0.1,
    }
  },
  fadeIn: {
    duration: 0.5,
    ease: "easeOut",
    delay: 0.2  // Start after wave begins morphing
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

  // Curve smoothing
  smoothFactor: 3,     // Factor for Bezier curve calculation
  minHeightBuffer: 0.1, // Minimum buffer for height calculations
  
  // Default dimensions
  defaultDimensions: {
    width: 0 as number,
    height: 0 as number
  }
} as const; 