import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationSearch } from "@/components/LocationSearch"
import { useState } from "react"

interface Location {
  name: string
  lat: number
  lng: number
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="w-[320px]">
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">The Tide Near</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <LocationSearch onLocationSelect={setSelectedLocation} />
        </CardContent>
      </Card>

      {selectedLocation && (
        <div className="fixed bottom-6 left-6 text-sm">
          <p className="font-medium">{selectedLocation.name}</p>
          <p className="text-muted-foreground">
            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}

export default App
