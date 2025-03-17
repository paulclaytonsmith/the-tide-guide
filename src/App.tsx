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

  // Generate time labels for the chart
  const generateTimeLabels = () => {
    if (!tideData) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const labels = [];

    // Generate labels for each 6-hour interval, extending to day+4
    for (let time = new Date(yesterday); time <= new Date(today.getTime() + (96 * 60 * 60 * 1000)); time.setHours(time.getHours() + 6)) {
      const isMidnight = time.getHours() === 0;
      labels.push({
        label: isMidnight 
          ? `${time.toLocaleDateString('en-US', { weekday: 'long' })} ${time.getMonth() + 1}/${time.getDate()}\n${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDate: isMidnight
      });
    }

    return labels;
  };

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
          timeLabels={generateTimeLabels()}
          tideData={tideData.predictions.map(p => ({
            time: new Date(p.time),
            height: p.height,
            type: p.type
          }))}
        />
      )}
    </div>
  )
}

export default App
