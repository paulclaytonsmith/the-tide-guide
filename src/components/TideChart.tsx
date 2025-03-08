import { TideData } from "@/lib/noaa"
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts"

interface TideChartProps {
  data: TideData
}

export function TideChart({ data }: TideChartProps) {
  // Create interpolated data points between high and low tides
  const chartData = []
  const predictions = [...data.predictions].sort((a, b) => a.time.getTime() - b.time.getTime())
  
  for (let i = 0; i < predictions.length - 1; i++) {
    const current = predictions[i]
    const next = predictions[i + 1]
    const timeDiff = next.time.getTime() - current.time.getTime()
    const heightDiff = next.height - current.height
    
    // Add points between each high/low tide for smoother curve
    for (let j = 0; j <= 4; j++) {
      const time = new Date(current.time.getTime() + (timeDiff * j) / 4)
      const height = current.height + (heightDiff * j) / 4
      chartData.push({
        time,
        height: parseFloat(height.toFixed(2))
      })
    }
  }
  
  // Add the last point
  if (predictions.length > 0) {
    const last = predictions[predictions.length - 1]
    chartData.push({
      time: last.time,
      height: last.height
    })
  }

  // Find max height for chart domain
  const maxHeight = Math.ceil(Math.max(...chartData.map(d => d.height)))
  const minHeight = Math.floor(Math.min(...chartData.map(d => d.height)))

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[60vh]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <YAxis 
            hide 
            domain={[-10, maxHeight]}
          />
          <Area
            type="basis"
            dataKey="height"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="hsl(var(--chart-1))"
            fillOpacity={1}
            isAnimationActive={true}
            animationDuration={750}
            animationBegin={0}
            animationEasing="ease-out"
            baseValue={-10}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
} 