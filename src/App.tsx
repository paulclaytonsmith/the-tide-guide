import { useState } from 'react'
import { Location } from './components/Location'
import { getTidePredictions, type TideData } from '@/lib/noaa'

interface Location {
  name: string
  lat: number
  lng: number
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [tideData, setTideData] = useState<TideData | null>(null)
  const [isLoadingTides, setIsLoadingTides] = useState(false)
  const [tideError, setTideError] = useState<string | null>(null)

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location)
    setIsLoadingTides(true)
    setTideError(null)
    
    try {
      const data = await getTidePredictions(location.lat, location.lng)
      if (!data) {
        setTideError("No tide data available for this location")
      } else {
        setTideData(data)
      }
    } catch (error) {
      setTideError("Failed to load tide data")
    } finally {
      setIsLoadingTides(false)
    }
  }

  return (
    <div className="app">
      <Location 
        onLocationSelect={handleLocationSelect}
        isLoadingTides={isLoadingTides}
        tideError={tideError}
        stationId={tideData?.stationId}
      />
    </div>
  )
}

export default App
