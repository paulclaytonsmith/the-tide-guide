export interface Point {
  time: Date;
  height: number;
  type: "High" | "Low" | "Hourly";
} 