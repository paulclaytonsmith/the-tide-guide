import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('Google Maps API key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.')
}

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places"]
})

let loadPromise: Promise<typeof google> | null = null

export async function loadGoogleMaps(): Promise<void> {
  if (!loadPromise) {
    loadPromise = loader.load()
      .then((google) => {
        return google
      })
      .catch((error) => {
        console.error('Failed to load Google Maps:', error)
        throw error
      })
  }
  
  await loadPromise
}

// Add the callback property to the window object
declare global {
  interface Window {
    __googleMapsCallback?: () => void
  }
}