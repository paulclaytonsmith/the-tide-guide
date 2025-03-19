import { TIME_CONFIG } from '../components/Chart/config';
import type { TideData } from './noaa';

// Typical tide ranges in feet
const TYPICAL_TIDE = {
  mean: 2,      // Center point
  range: 1.5,   // Plus/minus from mean
};

// Helper function to calculate tide height at any time
function getTideHeight(time: Date, startDate: Date): number {
  const hoursSinceStart = (time.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const angle = (hoursSinceStart % 12) / 12 * Math.PI * 2; // Complete cycle every 12 hours
  return TYPICAL_TIDE.mean + (TYPICAL_TIDE.range * Math.sin(angle));
}

export function generateInitialTideData(): TideData {
  // Get today at midnight in local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate start time (9 PM yesterday)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(TIME_CONFIG.startHour, 0, 0, 0);
  
  // Calculate end time (midnight N days from now)
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + TIME_CONFIG.daysToDisplay);
  endDate.setHours(0, 0, 0, 0);

  // Calculate total duration and points needed
  const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const hourlyPoints = Math.ceil(totalHours); // One point per hour
  const highLowPointsPer24h = 4; // 2 highs and 2 lows per 24 hours
  const totalHighLowPoints = Math.ceil((totalHours / 24) * highLowPointsPer24h);
  
  // We don't subtract 1 anymore since we'll handle overlaps explicitly
  const totalPoints = hourlyPoints + totalHighLowPoints;

  console.log('Point calculation:', {
    totalHours,
    hourlyPoints,
    totalHighLowPoints,
    totalPoints,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  // Calculate time interval between points
  const timeInterval = (endDate.getTime() - startDate.getTime()) / totalPoints;
  
  const predictions: TideData['predictions'] = [];
  const pointTypes = new Map<string, { time: Date, type: string }>();
  
  // Generate evenly distributed points
  // Changed <= to < to avoid generating an extra point
  for (let i = 0; i < totalPoints; i++) {
    const time = new Date(startDate.getTime() + (i * timeInterval));
    const hoursSinceStart = (time.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const angle = (hoursSinceStart % 12) / 12 * Math.PI * 2;
    const height = getTideHeight(time, startDate);
    
    // Determine if this is a high/low point
    const normalizedAngle = angle % (Math.PI * 2);
    const angleThreshold = 0.1;
    
    let type: "High" | "Low" | "Hourly" = "Hourly";
    
    // Check if this point is on an exact hour
    const isExactHour = time.getMinutes() === 0;
    
    // Determine if this should be a high/low point
    const isHighPoint = Math.abs(normalizedAngle) < angleThreshold || 
                       Math.abs(normalizedAngle - Math.PI) < angleThreshold;
    const isLowPoint = Math.abs(normalizedAngle - Math.PI/2) < angleThreshold || 
                      Math.abs(normalizedAngle - 3*Math.PI/2) < angleThreshold;
    
    // If it's on an exact hour and is also a high/low point,
    // we'll treat it as a high/low point to maintain the tide pattern
    if (isHighPoint) {
      type = "High";
    } else if (isLowPoint) {
      type = "Low";
    }
    
    // Only add the point if we haven't already added one at this exact time
    const timeKey = time.getTime().toString();
    if (!pointTypes.has(timeKey)) {
      pointTypes.set(timeKey, { time, type });
      predictions.push({
        time,
        height,
        type
      });
    }
  }

  // Analyze point distribution
  const hourlyCount = Array.from(pointTypes.values()).filter(p => p.type === "Hourly").length;
  const highCount = Array.from(pointTypes.values()).filter(p => p.type === "High").length;
  const lowCount = Array.from(pointTypes.values()).filter(p => p.type === "Low").length;

  console.log('Point distribution:', {
    total: predictions.length,
    hourly: hourlyCount,
    high: highCount,
    low: lowCount,
    expectedTotal: totalPoints
  });

  // Check for points that occur on exact hours
  const exactHourPoints = Array.from(pointTypes.entries())
    .filter(([_, data]) => {
      const minutes = data.time.getMinutes();
      return minutes === 0 && data.type !== "Hourly";
    });

  if (exactHourPoints.length > 0) {
    console.log('High/Low points on exact hours:', exactHourPoints.map(([_, data]) => ({
      time: data.time.toISOString(),
      type: data.type
    })));
  }

  // Sort points by time (should already be sorted, but just to be safe)
  predictions.sort((a, b) => a.time.getTime() - b.time.getTime());

  return {
    stationName: "Initial Wave",
    stationId: "INIT",
    predictions
  };
} 