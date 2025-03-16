import { useState } from 'react'
import { Location } from './components/Location'
import { getTidePredictions, type TideData } from '@/lib/noaa'
import { Chart } from './components/Chart/Chart'
import styled from 'styled-components'

interface Location {
  name: string
  lat: number
  lng: number
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F6F5FA;
  gap: 48px;
`;

const sampleTimeLabels = [
  { label: "Tuesday 3/11 12 AM", isDate: true },
  { label: "6 AM" },
  { label: "12 PM" },
  { label: "6 PM" },
  { label: "Wednesday 3/12 12 AM", isDate: true },
  { label: "6 AM" }
];

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
    <AppContainer>
      <Location 
        onLocationSelect={handleLocationSelect}
        isLoadingTides={isLoadingTides}
        tideError={tideError}
        stationId={tideData?.stationId}
      />
      <Chart 
        timeLabels={sampleTimeLabels}
        columns={12}
        rows={8}
      />
    </AppContainer>
  )
}

export default App
