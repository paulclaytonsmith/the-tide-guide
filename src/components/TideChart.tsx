import { TideData } from "@/lib/noaa"
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts"
import { useEffect, useRef, useState, useCallback } from "react"

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
  const contentRef = useRef<HTMLDivElement>(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sort predictions by time
  const chartData = [...data.predictions]
    .sort((a, b) => a.time.getTime() - b.time.getTime())
    .map(p => ({
      time: p.time.getTime(),
      height: p.height,
      type: p.type
    }))

  // Get today at midnight in local time
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get yesterday at midnight
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Find yesterday's tides
  const yesterdayTides = chartData.filter(d => {
    const date = new Date(d.time)
    return date >= yesterday && date < today
  })

  // Get the last tide from yesterday
  const yesterdayLastTide = yesterdayTides.length > 0 ? yesterdayTides[yesterdayTides.length - 1] : null

  // Filter data to start from yesterday's last tide
  const filteredChartData = yesterdayLastTide 
    ? chartData.filter(d => d.time >= yesterdayLastTide.time)
    : chartData

  // Find max height for chart domain
  const maxHeight = Math.ceil(Math.max(...filteredChartData.map(d => d.height)))
  const minHeight = Math.floor(Math.min(...filteredChartData.map(d => d.height)))

  // Generate ticks for every 6 hours aligned to 12AM
  const generateHourlyTicks = () => {
    const startTime = new Date(yesterday)
    const endTime = new Date(today.getTime() + (48 * 60 * 60 * 1000)) // Day after tomorrow midnight
    
    // Round to the next 6-hour mark
    const firstTick = new Date(startTime)
    firstTick.setMinutes(0, 0, 0)
    const currentHour = firstTick.getHours()
    const hoursToNext = (6 - (currentHour % 6)) % 6
    firstTick.setHours(currentHour + hoursToNext)

    const ticks = []
    const currentTime = new Date(firstTick)
    
    while (currentTime <= endTime) {
      ticks.push(currentTime.getTime())
      currentTime.setHours(currentTime.getHours() + 6)
    }
    
    return ticks
  }

  const renderTick = (props: any) => {
    const { x, y, payload } = props
    const date = new Date(payload.value)
    const isMidnight = date.getHours() === 0
    const isTodayMidnight = isMidnight && date.getDate() === today.getDate()

    const dateStr = isMidnight
      ? `${date.toLocaleDateString('en-US', { weekday: 'long' })} ${date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}`
      : '\u00A0'
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })

    return (
      <g 
        transform={`translate(${x},${y + 10})`}
        data-midnight={isTodayMidnight ? "true" : undefined}
        style={{ position: 'relative' }}
      >
        <foreignObject x={0} y={0} width={200} height={50} style={{ overflow: 'visible' }}>
          <div style={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            width: '200px',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ 
              color: 'white',
              fontSize: '12px',
              lineHeight: '20px'
            }}>
              {dateStr}
            </div>
            <div style={{ 
              color: 'white',
              fontSize: '12px',
              lineHeight: '20px',
              opacity: 0.5
            }}>
              {time}
            </div>
          </div>
        </foreignObject>
      </g>
    )
  }

  return (
    <div ref={containerRef} className="absolute bottom-0 left-0 right-0 h-[100vh] pt-[200px] bg-background overflow-x-auto">
      <div className="relative h-full">
        <div 
          ref={contentRef}
          className="relative h-full w-[200vw]" 
          style={{ 
            transform: `translateX(-${windowWidth * 0.605}px)`
          }}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 h-28 -mt-1" 
            style={{ backgroundColor: "hsl(var(--chart-1))" }}
          />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={filteredChartData}
              margin={{ top: 30, right: 0, bottom: 40, left: 0 }}
              style={{ overflow: 'visible' }}
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
                domain={[
                  yesterday.getTime() - (1000 * 60 * 5), // 5 min buffer before yesterday midnight
                  today.getTime() + (48 * 60 * 60 * 1000) + (1000 * 60 * 5) // Day after tomorrow midnight + 5 min buffer
                ]}
                interval="preserveStart"
                ticks={generateHourlyTicks()}
                tick={renderTick}
                tickLine={false}
                axisLine={false}
                padding={{ left: 0, right: 0 }}
                allowDataOverflow={true}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    const date = new Date(data.time)
                    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-sm font-medium">
                          {data.type} Tide
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {time}
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
    </div>
  )
} 