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
  chartDrawing: { // controls the initial slide up of the chart drawing
    initial: {
      y: 600
    },
    animate: {
      y: 0,
      transition: {
        duration: 1,
        ease: [0.4, 0.5, 0.2, 1], // smooth easeOut
        delay: 0.2 // slight delay to let wave animation start first
      }
    }
  },
  tooltip: {
    showDelay: 200,    // Delay before showing tooltip (ms)
    fadeDuration: 150,  // Duration of fade animation (ms)
    rateDelay: 333,    // Delay before showing flow rate (ms)
    arrow: {
      duration: 0.3,    // Duration of arrow animation (s)
      delay: 0.25,      // Delay before arrow animation starts (s)
      offset: 8,        // Initial offset for arrow movement (px)
      ease: "easeOut"   // Easing function for arrow animation
    }
  },
  labels: {
    stagger: { // controls the delay between the labels appearing
      staggerScale: 2500, // Higher = faster sequence
    },
    heightText: {
      initial: { opacity: 0 },
      enter: (x: number) => ({ 
        opacity: 1,
        transition: {
          duration: 0.5,
          delay: 1.75 + (x / ANIMATION_CONFIG.labels.stagger.staggerScale)
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
          duration: 0.25,
          delay: 1.5 + (x / ANIMATION_CONFIG.labels.stagger.staggerScale),
          ease: [.75, 0, .75, 1.25]
        }
      }),
      exit: { opacity: 0, scale: 0 }
    }
  },
  fadeIn: { // controls grid and time axis on first render of chart
    initial: {
      opacity: 1,
      y: 400 // start 200px below final position
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.5,
        ease: [0.4, 0.5, 0.2, 1] // smooth easeOut
      }
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
  markerHoverScale: 1.5, // Scale factor for marker hover state
  markerHoverOffset: -0.25, // Offset factor to keep marker centered during hover
  labelOffset: 6,     // Distance between marker and label in pixels
  hourlyMarkerThreshold: 0.3, // Hide hourly markers within this many hours of high/low points

  // Curve smoothing
  smoothFactor: 3,     // Factor for Bezier curve calculation
  minHeightBuffer: 0.1, // Minimum buffer for height calculations
  
  // Default dimensions
  defaultDimensions: {
    width: 0 as number,
    height: 0 as number
  }
} as const;

// Breakpoints
export const BREAKPOINTS = {
  mobile: 768,  // Matches index.css media query
} as const;

// Initial tide settings
export const TIDE_CONFIG = {
  mean: 2.5,    // Center point - aligned with typical live data
  range: () => {
    if (typeof window === 'undefined') return 0.9;  // SSR fallback
    return window.innerWidth < BREAKPOINTS.mobile
      ? 0.5   // Smaller range for mobile
      : 0.9;  // Larger range for desktop
  }
} as const; 