import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationSearch } from "@/components/LocationSearch"
import { TideChart } from "@/components/TideChart"
import { getTidePredictions } from "@/lib/noaa"
import { useState } from "react"

interface Location {
  name: string
  lat: number
  lng: number
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tideData, setTideData] = useState<Awaited<ReturnType<typeof getTidePredictions>>>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location)
    setIsLoading(true)
    setError(null)

    try {
      const data = await getTidePredictions(location.lat, location.lng)
      if (!data) {
        setError("No tide stations found within 10 miles of this location.")
      }
      setTideData(data)
    } catch (err) {
      setError("Failed to fetch tide data. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 p-6 z-10">
        <div className="flex flex-col gap-4 w-[320px]">
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">The tide for</CardTitle>
            </CardHeader>
            <CardContent className="pt-35">
              <LocationSearch onLocationSelect={handleLocationSelect} />
            </CardContent>
          </Card>

          {isLoading && (
            <div className="text-sm text-muted-foreground">
              Loading tide data...
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 overflow-x-auto">
        {tideData && <TideChart data={tideData} />}
      </div>
    </div>
  )
}

export default App
