interface Station {
  id: string
  name: string
  lat: number
  lng: number
  distance: number
}

interface TidePrediction {
  t: string  // time
  v: string  // height
  type: "H" | "L" | null  // high or low tide or null
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
    type?: "High" | "Low"  // Make type optional
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
  
  // Calculate dates
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 3)

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  try {
    // First get the hourly data
    const hourlyUrl = new URL("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter")
    hourlyUrl.searchParams.set("product", "predictions")
    hourlyUrl.searchParams.set("application", "tide_near")
    hourlyUrl.searchParams.set("begin_date", formatDate(today))
    hourlyUrl.searchParams.set("end_date", formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)))
    hourlyUrl.searchParams.set("datum", "MLLW")
    hourlyUrl.searchParams.set("station", stationId)
    hourlyUrl.searchParams.set("time_zone", "lst_ldt")
    hourlyUrl.searchParams.set("units", "english")
    hourlyUrl.searchParams.set("interval", "60")
    hourlyUrl.searchParams.set("format", "json")

    // Then get the hilo data
    const hiloUrl = new URL("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter")
    hiloUrl.searchParams.set("product", "predictions")
    hiloUrl.searchParams.set("application", "tide_near")
    hiloUrl.searchParams.set("begin_date", formatDate(yesterday))
    hiloUrl.searchParams.set("end_date", formatDate(endDate))
    hiloUrl.searchParams.set("datum", "MLLW")
    hiloUrl.searchParams.set("station", stationId)
    hiloUrl.searchParams.set("time_zone", "lst_ldt")
    hiloUrl.searchParams.set("units", "english")
    hiloUrl.searchParams.set("interval", "hilo")
    hiloUrl.searchParams.set("format", "json")

    const [hourlyResponse, hiloResponse] = await Promise.all([
      fetch(hourlyUrl.toString()),
      fetch(hiloUrl.toString())
    ])

    if (!hourlyResponse.ok || !hiloResponse.ok) {
      throw new Error(`HTTP error! status: ${hourlyResponse.status} or ${hiloResponse.status}`)
    }

    const hourlyData = await hourlyResponse.json() as TidePredictions
    const hiloData = await hiloResponse.json() as TidePredictions

    // Transform hourly data to have type: null
    const hourlyPredictions = (hourlyData.predictions || []).map(p => ({
      t: p.t,
      v: p.v,
      type: null as any  // Force type to be null for hourly points
    }))

    // Keep the type for hilo data
    const hiloPredictions = hiloData.predictions || []

    // Combine the datasets
    const combinedPredictions = [
      ...hiloPredictions,
      ...hourlyPredictions
    ] as TidePrediction[]

    return combinedPredictions
  } catch (error) {
    console.error("Error fetching tide predictions:", error)
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
      type: p.type === "H" ? "High" : 
            p.type === "L" ? "Low" : 
            undefined  // For hourly points where type is null
    }))
  }
} 