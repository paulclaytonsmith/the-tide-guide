import { TideData } from "@/lib/noaa"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface TideTableProps {
  data: TideData
}

export function TideTable({ data }: TideTableProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatHeight = (height: number) => {
    return `${height.toFixed(1)} ft`
  }

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Tide Predictions for {data.stationName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Time</th>
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-left py-2 font-medium">Height</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.predictions.map((prediction, index) => (
                <tr key={index}>
                  <td className="py-2">{formatTime(prediction.time)}</td>
                  <td className="py-2">{prediction.type}</td>
                  <td className="py-2">{formatHeight(prediction.height)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 