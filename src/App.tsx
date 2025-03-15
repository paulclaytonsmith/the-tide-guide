import { useState } from 'react'
import { Location } from './components/Location'

interface Location {
  name: string
  lat: number
  lng: number
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    console.log('Selected location:', location)
  }

  return (
    <div className="app">
      <Location 
        onLocationSelect={handleLocationSelect}
      />
    </div>
  )
}

export default App
