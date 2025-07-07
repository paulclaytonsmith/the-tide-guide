import React from 'react'
import { CardContainer } from './components/CardContainer'
import { Location } from './components/Location'
import { getTidePredictions, type TideData } from '@/lib/noaa'
import { Chart } from './components/Chart'
import '@mantine/core/styles.css'
import { MantineProvider, Button, AppShell } from '@mantine/core'
import { theme } from './theme'

interface LocationData {
  name: string
  lat: number
  lng: number
}

function useViewportHeightFix() {
  React.useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);
}


function App() {
  const [tideData, setTideData] = React.useState<TideData | null>(null)
  const [isLoadingTides, setIsLoadingTides] = React.useState(false)
  const [tideError, setTideError] = React.useState<string | null>(null)
  useViewportHeightFix();

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
    <MantineProvider theme={theme}>
      <AppShell
        style={{
          height: 'calc(var(--vh, 1vh) * 100)',
        }}
>
        {/* Your main content here */}
        <CardContainer />
      </AppShell>
    </MantineProvider>
  )
}

export default App
