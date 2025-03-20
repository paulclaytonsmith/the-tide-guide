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
export const ANIMATION_CONFIG = {
  wave: {
    spring: {
      stiffness: 75,    // Keep the same for same overall speed
      damping: 15,     // Reduced from 20 for more sloshing
      mass: 3.5,         // Keep the same to maintain physics
      restSpeed: 0.001,
      restDelta: 0.001
    }
  },
  labels: {
    stagger: { // controls the delay between the labels appearing
      staggerScale: 3000, // Higher = faster sequence
    },
    heightText: {
      initial: { opacity: 0 },
      enter: (x: number) => ({ 
        opacity: 1,
        transition: {
          duration: 0.3,
          delay: 2.25 + (x / ANIMATION_CONFIG.labels.stagger.staggerScale)
        }
      }),
      exit: { opacity: 0 }
    },
    marker: {
      initial: { opacity: 0, scale: 0 },
      enter: (x: number) => ({ 
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          delay: 1.75 + (x / ANIMATION_CONFIG.labels.stagger.staggerScale),
          ease: [0.34, 1.56, 0.64, 1]
        }
      }),
      exit: { opacity: 0, scale: 0 }
    }
  },
  fadeIn: { // controls grid and time axis on first render of chart
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
  labelOffset: 6,     // Distance between marker and label in pixels

  // Curve smoothing
  smoothFactor: 3,     // Factor for Bezier curve calculation
  minHeightBuffer: 0.1, // Minimum buffer for height calculations
  
  // Default dimensions
  defaultDimensions: {
    width: 0 as number,
    height: 0 as number
  }
} as const; 