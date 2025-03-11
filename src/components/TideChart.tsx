import { TideData } from "@/lib/noaa"
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts"
import { useEffect, useRef, useState } from "react"

interface TideChartProps {
  data: TideData
}

export function TideChart({ data }: TideChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      
      // Force a re-render when switching between mobile and desktop breakpoints
      if ((width < 640 && window.innerWidth >= 640) || 
          (width >= 640 && window.innerWidth < 640)) {
        setWindowWidth(window.innerWidth)
      }
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

  // Get three days after today at midnight
  const threeDaysAfter = new Date(today)
  threeDaysAfter.setDate(threeDaysAfter.getDate() + 3)

  // Get two days after today at midnight (for filtering main data)
  const twoDaysAfter = new Date(today)
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2)

  // Find yesterday's tides
  const yesterdayTides = chartData.filter(d => {
    const date = new Date(d.time)
    return date >= yesterday && date < today
  })

  // Get the second to last tide from yesterday
  const yesterdaySecondLastTide = yesterdayTides.length > 1 ? yesterdayTides[yesterdayTides.length - 2] : yesterdayTides[0]

  // Find the first two tides of three days after
  const threeDaysAfterTides = chartData.filter(d => {
    const date = new Date(d.time)
    return date.getTime() >= threeDaysAfter.getTime() && date.getTime() < threeDaysAfter.getTime() + (24 * 60 * 60 * 1000)
  }).slice(0, 2)

  // Filter data to start from yesterday's second to last tide and go up to day +2
  const filteredChartData = yesterdaySecondLastTide 
    ? chartData.filter(d => {
        const date = new Date(d.time)
        return d.time >= yesterdaySecondLastTide.time && date.getTime() < twoDaysAfter.getTime() + (24 * 60 * 60 * 1000)
      })
    : chartData.filter(d => {
        const date = new Date(d.time)
        return date.getTime() < twoDaysAfter.getTime() + (24 * 60 * 60 * 1000)
      })

  // Add the first two tides of day +3
  filteredChartData.push(...threeDaysAfterTides)

  // Find max height for chart domain
  const maxHeight = Math.ceil(Math.max(...filteredChartData.map(d => d.height)))

  // Generate ticks for every 6 hours aligned to 12AM
  const generateHourlyTicks = () => {
    const startTime = new Date(yesterday)
    const endTime = new Date(today.getTime() + (72 * 60 * 60 * 1000))
    
    const firstTick = new Date(startTime)
    firstTick.setMinutes(0, 0, 0)
    const currentHour = firstTick.getHours()
    const hoursToNext = (6 - (currentHour % 6)) % 6
    firstTick.setHours(currentHour + hoursToNext)

    const ticks = []
    const currentTime = new Date(firstTick)
    
    while (currentTime <= endTime) {
      ticks.push(currentTime.getTime())
      currentTime.setHours(currentTime.getHours() + (window.innerWidth < 640 ? 12 : 6))
    }
    
    return ticks
  }

  const renderTick = (props: any) => {
    const { x, y, payload } = props
    const date = new Date(payload.value)
    const hour = date.getHours()
    const minute = date.getMinutes()
    const isMidnight = hour === 0 && minute === 0

    const dateStr = isMidnight
      ? `${date.toLocaleDateString('en-US', { weekday: 'long' })} ${date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}`
      : '\u00A0'
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })

    const isMobile = window.innerWidth < 640
    const fontSize = isMobile ? '12px' : '12px'
    
    // Adjust the y-positions based on device
    const firstLineY = isMobile ? 12 : 15
    const secondLineY = isMobile ? 30 : 33

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={firstLineY}
          textAnchor="start"
          fill="white"
          style={{
            fontSize,
          }}
        >
          {dateStr}
        </text>
        <text
          x={0}
          y={secondLineY}
          textAnchor="start"
          fill="white"
          style={{
            fontSize,
            opacity: 0.5
          }}
        >
          {time}
        </text>
      </g>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="fixed bottom-0 left-0 right-0 h-[70vh] md:h-[100vh] pt-[140px] sm:pt-[160px] md:pt-[200px] bg-background overflow-x-auto overscroll-none"
    >
      <div className="relative h-full">
        <div 
          ref={contentRef}
          className="relative h-full sm:w-[275vw] w-[500vw]" 
          style={{ 
            transform: `translateX(-${windowWidth * (window.innerWidth < 640 ? 1.13 : 0.63)}px)`
          }}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 h-28 -mt-1" 
            style={{ backgroundColor: "hsl(var(--chart-1))" }}
          />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={filteredChartData}
              margin={{ 
                top: 30, 
                right: 0, 
                bottom: window.innerWidth < 640 ? 10 : 30, 
                left: 0 
              }}
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
                  yesterday.getTime() - (1000 * 60 * 5), // 5 min buffer before day -1 midnight
                  today.getTime() + (72 * 60 * 60 * 1000) + (1000 * 60 * 5) // Day +3 midnight + 5 min buffer
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
                    const day = date.toLocaleDateString('en-US', { weekday: 'short' })
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-sm font-medium">
                          {data.type} Tide
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {time}
                        </div>
                        <div className="text-xs text-muted-foreground/40  mt-2">
                          {day} {dateStr}
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
                dot={(props): React.ReactElement<SVGElement> => {
                  if (!props || !props.payload) {
                    return (
                      <circle
                        key="empty"
                        cx={0}
                        cy={0}
                        r={0}
                      />
                    );
                  }
                  
                  // High/Low points - always shown, bigger on hover
                  if (props.payload.type) {
                    return (
                      <circle
                        key={`dot-${props.payload.time}`}
                        cx={props.cx}
                        cy={props.cy}
                        r={props.active ? 6 : 4}  // Bigger radius on hover
                        fill="white"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={props.active ? 3 : 2}  // Thicker stroke on hover
                      />
                    );
                  }
                  
                  // Hourly points - only show on hover
                  if (props.active) {
                    return (
                      <circle
                        key={`dot-${props.payload.time}`}
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="white"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                      />
                    );
                  }

                  // No dot for non-hovered hourly points
                  return null;
                }}
                label={{
                  position: "top",
                  fill: "hsl(var(--foreground))",
                  fontSize: 12,
                  formatter: (value: number, entry: any) => {
                    if (!entry || !entry.payload || !entry.payload.type) return null;
                    return `${value.toFixed(1)}'`;
                  },
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