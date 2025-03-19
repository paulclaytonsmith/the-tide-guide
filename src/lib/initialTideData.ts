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

// Add memoization for initial data to prevent regeneration
let cachedData: TideData | null = null;
let cachedTimestamp: number | null = null;

export function generateInitialTideData(): TideData {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // Return cached data if it's from the same day
  if (cachedData && cachedTimestamp === today.getTime()) {
    return cachedData;
  }

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

  const result: TideData = {
    stationName: "Initial Wave",
    stationId: "INIT",
    predictions
  };

  // Cache the result
  cachedData = result;
  cachedTimestamp = today.getTime();
  return result;
}

// Create a shared types file for common interfaces
// src/types/tide.ts
export interface BasePoint {
  time: Date;
  height: number;
}

export interface TidePoint extends BasePoint {
  type: "High" | "Low" | "Hourly";
}

export interface HourlyPoint extends BasePoint {
  type: "Hourly";
} 