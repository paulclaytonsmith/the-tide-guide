import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationSearch } from "@/components/LocationSearch"
import { TideChart } from "@/components/TideChart"
import { getTidePredictions } from "@/lib/noaa"
import { Waves } from "lucide-react"
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
        setError("No NOAA tide stations found within 10 miles of this location.")
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
            <CardHeader className="space-y-0 pt-8 pb-4">
              <div className="flex items-center justify-between px-4">
                <CardTitle className="text-sm text-muted-foreground font-normal">The tides for</CardTitle>
                <Waves className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <LocationSearch onLocationSelect={handleLocationSelect} />
                {isLoading && (
                  <div className="text-sm text-muted-foreground px-4">
                    Loading tide data...
                  </div>
                )}
                {error && (
                  <div className="text-sm text-destructive px-4">
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="absolute inset-0 overflow-x-auto">
        {tideData && <TideChart data={tideData} />}
      </div>
    </div>
  )
}

export default App
