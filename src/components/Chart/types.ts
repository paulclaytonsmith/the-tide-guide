interface BasePoint {
  time: Date;
  height: number;
}

export interface HourlyPoint extends BasePoint {
  type: "Hourly";
}

export interface ExtremumPoint extends BasePoint {
  type: "High" | "Low";
}

export type Point = HourlyPoint | ExtremumPoint; 