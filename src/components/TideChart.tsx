import { TideData } from "@/lib/noaa"
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts"
import { useEffect, useRef } from "react"

interface TideChartProps {
  data: TideData
}

interface LabelProps {
  x: number
  y: number
  value: number
}

export function TideChart({ data }: TideChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to middle when data changes
    if (containerRef.current) {
      const scrollAmount = containerRef.current.scrollWidth / 4
      containerRef.current.scrollLeft = scrollAmount
    }
  }, [data])

  // Sort predictions by time
  const chartData = [...data.predictions]
    .sort((a, b) => a.time.getTime() - b.time.getTime())
    .map(p => ({
      time: p.time.getTime(),
      height: p.height,
      type: p.type
    }))

  // Find max height for chart domain
  const maxHeight = Math.ceil(Math.max(...chartData.map(d => d.height)))
  const minHeight = Math.floor(Math.min(...chartData.map(d => d.height)))

  const formatTime = (time: Date | number) => {
    const date = time instanceof Date ? time : new Date(time)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Generate ticks for every hour
  const generateHourlyTicks = () => {
    const startTime = new Date(chartData[0].time)
    const endTime = new Date(chartData[chartData.length - 1].time)
    
    // Round to the next hour for start
    const firstHour = new Date(startTime)
    firstHour.setMinutes(0, 0, 0)
    if (firstHour < startTime) {
      firstHour.setHours(firstHour.getHours() + 1)
    }

    // Round to the previous hour for end
    const lastHour = new Date(endTime)
    lastHour.setMinutes(0, 0, 0)

    const ticks = []
    const currentHour = new Date(firstHour)
    
    while (currentHour <= lastHour) {
      ticks.push(currentHour.getTime())
      currentHour.setHours(currentHour.getHours() + 1)
    }
    
    return ticks
  }

  // Update the time format to only show hour
  const formatAxisTime = (time: Date) => {
    const weekday = time.toLocaleDateString('en-US', { weekday: 'short' })
    const date = time.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
    const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    return [`${weekday} ${date}`, timeStr]
  }

  return (
    <div ref={containerRef} className="absolute bottom-0 left-0 right-0 h-[100vh] pt-[200px] bg-background">
      <div className="relative h-full w-[200vw]">
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 -mt-1" 
          style={{ backgroundColor: "hsl(var(--chart-1))" }}
        />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ top: 30, right: 0, bottom: 0, left: 0 }}
          >
            <YAxis 
              hide 
              domain={[-10, maxHeight]}
            />
            <XAxis
              dataKey="time"
              height={60}
              scale="time"
              type="number"
              domain={[chartData[0].time, chartData[chartData.length - 1].time]}
              ticks={generateHourlyTicks()}
              tick={(props) => {
                const { x, y, payload } = props
                const date = new Date(payload.value)
                const [dateStr, timeStr] = formatAxisTime(date)
                return (
                  <g transform={`translate(${x},${y + 10})`}>
                    <text
                      x={0}
                      y={0}
                      dy={0}
                      textAnchor="start"
                      fill="white"
                      fontSize={12}
                    >
                      {dateStr}
                    </text>
                    <text
                      x={0}
                      y={0}
                      dy={20}
                      textAnchor="start"
                      fill="white"
                      fontSize={12}
                    >
                      {timeStr}
                    </text>
                  </g>
                )
              }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="text-sm font-medium">
                        {formatTime(data.time)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.type} tide • {data.height.toFixed(1)}'
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
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
              dot={{ r: 4, fill: "white", stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
              label={{
                position: "top",
                fill: "hsl(var(--foreground))",
                fontSize: 12,
                formatter: (value: number) => `${value.toFixed(1)}'`,
                dy: -15,
                allowDuplicatedCategory: true
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 