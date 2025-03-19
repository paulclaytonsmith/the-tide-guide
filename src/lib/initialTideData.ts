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
  const hourlyPoints = Math.floor(totalHours) + 1; // Add 1 to include both start and end points
  
  console.log('Point calculation:', {
    totalHours,
    hourlyPoints,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  // Calculate time interval between points (should be 1 hour)
  const timeInterval = (endDate.getTime() - startDate.getTime()) / (hourlyPoints - 1); // Subtract 1 since we're including both endpoints
  
  const predictions: TideData['predictions'] = [];
  
  // Generate hourly points
  for (let i = 0; i < hourlyPoints; i++) {
    const time = new Date(startDate.getTime() + (i * timeInterval));
    const height = getTideHeight(time, startDate);
    
    predictions.push({
      time,
      height,
      type: "Hourly"
    });
  }

  // Sort points by time (should already be sorted, but just to be safe)
  predictions.sort((a, b) => a.time.getTime() - b.time.getTime());

  return {
    stationName: "Initial Wave",
    stationId: "INIT",
    predictions
  };
} 