import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationSearch } from "@/components/LocationSearch"
import { TideTable } from "@/components/TideTable"
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
    <div className="min-h-screen bg-background p-6">
      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-4">
          <Card className="w-[320px]">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">The Tide Near</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LocationSearch onLocationSelect={handleLocationSelect} />
            </CardContent>
          </Card>

          {selectedLocation && (
            <div className="text-sm px-4">
              <p className="font-medium">{selectedLocation.name}</p>
              <p className="text-muted-foreground">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1">
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
          {tideData && <TideTable data={tideData} />}
        </div>
      </div>
    </div>
  )
}

export default App
