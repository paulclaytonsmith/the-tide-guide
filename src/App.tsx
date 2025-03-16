import React from 'react'
import { Location } from './components/Location'
import { getTidePredictions, type TideData } from '@/lib/noaa'
import { Chart } from './components/Chart'
import './styles/app.css'

interface LocationData {
  name: string
  lat: number
  lng: number
}

function App() {
  const [selectedLocation, setSelectedLocation] = React.useState<LocationData | null>(null)
  const [tideData, setTideData] = React.useState<TideData | null>(null)
  const [isLoadingTides, setIsLoadingTides] = React.useState(false)
  const [tideError, setTideError] = React.useState<string | null>(null)

  const handleLocationSelect = async (location: LocationData) => {
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
      setTideError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoadingTides(false)
    }
  }

  return (
    <div className="app-container">
      <Location 
        onLocationSelect={handleLocationSelect}
        isLoadingTides={isLoadingTides}
        tideError={tideError}
        stationId={tideData?.stationId}
      />
      {tideData && (
        <Chart 
          timeLabels={tideData.predictions.map(p => ({ 
            label: p.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))}
          columns={tideData.predictions.length}
          rows={8}
        />
      )}
    </div>
  )
}

export default App
