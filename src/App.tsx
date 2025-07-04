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
  const [tideData, setTideData] = React.useState<TideData | null>(null)
  const [isLoadingTides, setIsLoadingTides] = React.useState(false)
  const [tideError, setTideError] = React.useState<string | null>(null)

  const handleLocationSelect = async (location: LocationData) => {
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
      <h1>Hello World</h1>
      {/* <Location 
        onLocationSelect={handleLocationSelect}
        isLoadingTides={isLoadingTides}
        tideError={tideError}
        stationId={tideData?.stationId}
      />
      <Chart 
        tideData={tideData?.predictions || []}
      /> */}
    </div>
  )
}

export default App
