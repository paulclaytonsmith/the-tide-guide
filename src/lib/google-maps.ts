import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = 'AIzaSyDIR1P4WP-ydz6ybIxqKTQQwQQI_0yxRog'

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places"]
})

let loadPromise: Promise<typeof google> | null = null

export async function loadGoogleMaps(): Promise<void> {
  if (!loadPromise) {
    loadPromise = loader.load()
  }
  
  await loadPromise
}

// Add the callback property to the window object
declare global {
  interface Window {
    __googleMapsCallback?: () => void
  }
}