import { TideData } from "@/lib/noaa"
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip } from "recharts"
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
      time: p.time,
      height: p.height,
      type: p.type
    }))

  // Find max height for chart domain
  const maxHeight = Math.ceil(Math.max(...chartData.map(d => d.height)))
  const minHeight = Math.floor(Math.min(...chartData.map(d => d.height)))

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div ref={containerRef} className="absolute bottom-0 left-0 right-0 h-[100vh] pt-[200px]">
      <div className="h-full w-[200vw]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ top: 30, right: 0, bottom: 0, left: 0 }}
          >
            <YAxis 
              hide 
              domain={[-10, maxHeight]}
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