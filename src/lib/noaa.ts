interface Station {
  id: string
  name: string
  lat: number
  lng: number
  distance: number
}

const DAYS_TO_DISPLAY = 3; // Number of days to show in the chart, including today

interface TidePrediction {
  t: string  // time
  v: string  // height
  type: "H" | "L" | null  // high, low, or hourly (null)
}

interface TidePredictions {
  predictions: TidePrediction[]
}

export interface TideData {
  stationName: string
  stationId: string
  predictions: Array<{
    time: Date
    height: number
    type: "High" | "Low" | "Hourly"
  }>
}

async function findNearestStation(lat: number, lon: number): Promise<Station | null> {
  const url = new URL("https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json")
  url.searchParams.set("type", "tidepredictions")

  try {
    // First, get all stations
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json() as { stations: Array<{
      id: string
      name: string
      lat: string
      lng: string
    }> }

    // Find the closest station
    let closest = null
    let minDistance = Infinity

    for (const station of data.stations) {
      const stationLat = parseFloat(station.lat)
      const stationLng = parseFloat(station.lng)
      const distance = getDistance(lat, lon, stationLat, stationLng)
      if (distance < minDistance) {
        minDistance = distance
        closest = {
          id: station.id,
          name: station.name,
          lat: stationLat,
          lng: stationLng,
          distance
        }
      }
    }

    // Only return if within 50 miles
    if (closest && minDistance <= 50) {
      return closest
    }

    return null
  } catch (error) {
    console.error("Error finding nearest station:", error)
    return null
  }
}

// Calculate distance between two points in miles using haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180
}

async function fetchTidePredictions(stationId: string): Promise<TidePrediction[] | null> {
  // Get today at midnight in local time
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Calculate yesterday and end date
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 1)  // Go to yesterday
  
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + DAYS_TO_DISPLAY)

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Fetch both high/low and hourly predictions
  const fetchPredictions = async (interval: "hilo" | "h") => {
    const url = new URL("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter")
    url.searchParams.set("product", "predictions")
    url.searchParams.set("application", "tide_near")
    url.searchParams.set("begin_date", formatDate(startDate))
    url.searchParams.set("end_date", formatDate(endDate))
    url.searchParams.set("datum", "MLLW")
    url.searchParams.set("station", stationId)
    url.searchParams.set("time_zone", "lst_ldt")
    url.searchParams.set("units", "english")
    url.searchParams.set("interval", interval)
    url.searchParams.set("format", "json")

    try {
      const response = await fetch(url.toString())
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json() as TidePredictions
      return data.predictions || null
    } catch (error) {
      console.error(`Error fetching ${interval} predictions:`, error)
      return null
    }
  }

  try {
    // Fetch both types of predictions concurrently
    const [hiloData, hourlyData] = await Promise.all([
      fetchPredictions("hilo"),
      fetchPredictions("h")
    ])

    if (!hiloData || !hourlyData) return null

    // Get 6 PM timestamps for filtering
    const startTimestamp = new Date(startDate)
    startTimestamp.setHours(18, 0, 0, 0)
    const endTimestamp = new Date(endDate)
    endTimestamp.setHours(18, 0, 0, 0)

    // Combine predictions and filter to our desired time range
    return [...hiloData, ...hourlyData]
      .sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())
      .filter(prediction => {
        const predTime = new Date(prediction.t)
        return predTime >= startTimestamp && predTime <= endTimestamp
      })
  } catch (error) {
    console.error("Error fetching predictions:", error)
    return null
  }
}

export async function getTidePredictions(lat: number, lon: number): Promise<TideData | null> {
  const station = await findNearestStation(lat, lon)
  if (!station) return null

  const predictions = await fetchTidePredictions(station.id)
  if (!predictions) return null

  return {
    stationName: station.name,
    stationId: station.id,
    predictions: predictions.map(p => ({
      time: new Date(p.t),
      height: parseFloat(p.v),
      type: p.type === "H" ? "High" : p.type === "L" ? "Low" : "Hourly"
    }))
  }
} 