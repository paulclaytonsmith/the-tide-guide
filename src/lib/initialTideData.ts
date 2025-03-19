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

// Helper function to find exact high/low points
function findExactHighLowPoints(startDate: Date, endDate: Date): Array<{
  time: Date;
  height: number;
  type: "High" | "Low";
}> {
  const points: Array<{ time: Date; height: number; type: "High" | "Low" }> = [];
  
  // Check every 15 minutes for more precise high/low points
  const interval = 15; // minutes
  const totalMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  
  let prevHeight = getTideHeight(startDate, startDate);
  let prevSlope = 0;
  
  for (let minute = interval; minute <= totalMinutes; minute += interval) {
    const time = new Date(startDate.getTime() + minute * 60 * 1000);
    const height = getTideHeight(time, startDate);
    const slope = height - prevHeight;
    
    // If slope changes sign, we've found a peak or trough
    if (prevSlope !== 0 && ((prevSlope > 0 && slope < 0) || (prevSlope < 0 && slope > 0))) {
      // Use previous point as it's closer to the exact peak/trough
      const peakTime = new Date(time.getTime() - (interval * 60 * 1000 / 2));
      const peakHeight = getTideHeight(peakTime, startDate);
      points.push({
        time: peakTime,
        height: peakHeight,
        type: prevSlope > 0 ? "High" : "Low"
      });
    }
    
    prevHeight = height;
    prevSlope = slope;
  }
  
  return points;
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

  // Generate hourly points
  const hourlyPoints: TideData['predictions'] = [];
  const totalHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  
  for (let hour = 0; hour <= totalHours; hour++) {
    const time = new Date(startDate);
    time.setHours(time.getHours() + hour);
    
    hourlyPoints.push({
      time,
      height: getTideHeight(time, startDate),
      type: "Hourly"
    });
  }

  // Find exact high/low points
  const highLowPoints = findExactHighLowPoints(startDate, endDate);

  // Combine and sort all points
  const predictions = [...hourlyPoints, ...highLowPoints]
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  return {
    stationName: "Initial Wave",
    stationId: "INIT",
    predictions
  };
} 