import { useEffect, useRef, useState, useMemo } from "react"
import { loadGoogleMaps } from "@/lib/google-maps"
import { useTypeout } from "@/hooks/useTypeout"
import "./Location.css"
import React from "react"

// Types
interface Location {
  name: string
  lat: number
  lng: number
}

interface LocationProps {
  onLocationSelect: (location: Location) => void
  isLoadingTides?: boolean
  tideError?: string | null
  stationId?: string
}

// Configuration
const TYPEOUT_CONFIG = {
  placeholder: {
    numChars: 1,
    delay: 20,
    initialDelay: 1500,
    scramble: true,
    scrambleAhead: 3
  },
  stats: {
    numChars: 1,
    delay: 15,  // Slightly faster
    initialDelay: 100,
    scramble: true,
    scrambleAhead: 2  // Slightly fewer scrambled chars
  }
} as const

// UI Text Constants
const UI_TEXT = {
  input: {
    placeholder: "Enter Location"
  },
  stats: {
    placeholder: "Search for areas near\nthe coastal USA",
    loading: "Loading tide data...",
    error: "No tide data available"
  }
} as const

// Add error boundary at the top of the file
class LocationErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Location] Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="location-container">
          <div className="location">
            <div className="location-input-wrapper">
              <input
                type="text"
                className="location-input"
                placeholder="Location search unavailable"
                disabled
              />
              <div className="input-underline" />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Location({ onLocationSelect, isLoadingTides = false, tideError, stationId }: LocationProps) {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [inputValue, setInputValue] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showStats, setShowStats] = useState(true)  // New state for controlling stats visibility
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isFirstMount = useRef(true)

  // Typeout effect for placeholder stats, only on first mount
  const { displayText: typeoutPlaceholder } = useTypeout(
    isFirstMount.current ? UI_TEXT.stats.placeholder : UI_TEXT.stats.placeholder,
    TYPEOUT_CONFIG.placeholder
  )

  // Set isFirstMount to false after first mount
  useEffect(() => {
    isFirstMount.current = false
  }, [])

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (window.google) {
        autocompleteService.current = new google.maps.places.AutocompleteService()
        const mapDiv = document.createElement('div')
        placesService.current = new google.maps.places.PlacesService(mapDiv)
      }
    })
  }, [])

  // Effect for initial setup and resize handling
  useEffect(() => {
    const updateWidth = () => {
      // Guard against component being unmounted
      if (!inputRef.current || !wrapperRef.current) return;
      
      try {
        // Only skip width update if dropdown is open AND has results
        if (showDropdown && predictions.length > 0) return
        
        // Create a temporary span to measure text width
        const span = document.createElement('span')
        
        // Defensive check for getComputedStyle
        let inputStyles: CSSStyleDeclaration;
        try {
          inputStyles = window.getComputedStyle(inputRef.current)
        } catch (e) {
          console.error('[Location] Error getting computed style:', e)
          return
        }
        
        // Set minimal required styles
        span.style.cssText = `
          visibility: hidden;
          position: absolute;
          white-space: pre;
          font: ${inputStyles.font};
          letter-spacing: ${inputStyles.letterSpacing};
        `
        
        // Use input value or placeholder
        const textToMeasure = inputValue || UI_TEXT.input.placeholder || ''
        span.textContent = textToMeasure
        
        // Measure in a try-catch block
        try {
          document.body.appendChild(span)
          const width = Math.ceil(span.getBoundingClientRect().width)
          document.body.removeChild(span)
          
          // Update width only if component is still mounted
          if (wrapperRef.current) {
            wrapperRef.current.style.width = `${width}px`
            wrapperRef.current.classList.add('initialized')
          }
        } catch (e) {
          console.error('[Location] Error measuring text:', e)
          if (document.body.contains(span)) {
            document.body.removeChild(span)
          }
        }
      } catch (e) {
        console.error('[Location] Error in updateWidth:', e)
      }
    }

    // Debounce the width update
    const timeoutId = setTimeout(updateWidth, 50)
    
    // Update on window resize with debounce
    let resizeTimeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeoutId)
      resizeTimeoutId = setTimeout(updateWidth, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
      clearTimeout(resizeTimeoutId)
    }
  }, [inputValue, showDropdown, predictions.length])

  const handleInput = async (value: string) => {
    setInputValue(value)
    setSelectedIndex(-1)
    setSelectedLocation(null) // Hide stats when typing

    if (!value.trim()) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    try {
      const results = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.current?.getPlacePredictions(
          {
            input: value,
            types: ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'natural_feature']
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results)
            } else {
              reject(new Error('Failed to get predictions'))
            }
          }
        )
      })

      setPredictions(results)
      setShowDropdown(true)
    } catch (error) {
      setPredictions([])
    }
  }

  const handleSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    try {
      const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.current?.getDetails(
          { placeId: prediction.place_id },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              resolve(place)
            } else {
              reject(new Error('Failed to get place details'))
            }
          }
        )
      })

      if (place.geometry?.location) {
        const location: Location = {
          name: prediction.description,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
        setSelectedLocation(location)
        onLocationSelect(location)
        setInputValue(prediction.description)
        setShowDropdown(false)
        setPredictions([])
        inputRef.current?.blur()
      }
    } catch (error) {
      // Silently handle error
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => {
          const next = prev + 1
          return next >= predictions.length ? prev : next
        })
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => {
          const next = prev - 1
          return next < 0 ? 0 : next
        })
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(predictions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowDropdown(false)
        break
    }
  }

  const formatCoordinates = (lat: number, lng: number) => {
    const latDeg = Math.floor(lat)
    const latMin = ((lat - latDeg) * 60).toFixed(1)
    const lngDeg = Math.floor(lng)
    const lngMin = ((lng - lngDeg) * 60).toFixed(1)
    
    return `${latDeg}° ${latMin} N ${lngDeg}° ${lngMin} W`
  }

  // Memoize the stats text to prevent unnecessary resets
  const statsText = useMemo(() => {
    if (!selectedLocation || !stationId) return ""
    
    // Pre-calculate the full text to ensure consistent length
    const coords = formatCoordinates(selectedLocation.lat, selectedLocation.lng)
    // Add zero-width space between characters to prevent iOS from detecting as phone number
    const formattedStationId = stationId.split('').join('\u200B')
    return coords + `\nStation ${formattedStationId}`
  }, [selectedLocation?.lat, selectedLocation?.lng, stationId])

  // Create a stable key that changes only when we want to restart the animation
  const typeoutKey = useMemo(() => {
    if (!selectedLocation || !stationId) return ""
    // Include a version number to force a fresh animation when switching between locations
    return `v1-${selectedLocation.lat}-${selectedLocation.lng}-${stationId}`
  }, [selectedLocation?.lat, selectedLocation?.lng, stationId])

  // Pass key to useTypeout to force reset only when location or station changes
  const { displayText: typeoutStats } = useTypeout(
    statsText,
    {
      ...TYPEOUT_CONFIG.stats,
      // Increase initial delay to ensure all data is ready
      initialDelay: 200
    },
    typeoutKey
  )
  
  // Modify the focus handler to be more defensive
  const handleFocus = () => {
    if (!selectedLocation) return;
    
    // First hide the stats component
    setShowStats(false)
    
    // Then clear other states after a short delay
    setTimeout(() => {
      setPredictions([])
      setShowDropdown(false)
      setSelectedLocation(null)
      setInputValue("")
      
      // Finally show the stats again
      setTimeout(() => {
        setShowStats(true)
      }, 100)
    }, 50)
  }

  // Wrap the stats text rendering in error boundary and add defensive checks
  const renderStats = () => {
    try {
      if (selectedLocation) {
        if (isLoadingTides) return UI_TEXT.stats.loading
        if (tideError) return UI_TEXT.stats.error
        
        // Only attempt typeout if we have valid data
        if (typeoutStats && typeof typeoutStats === 'string') {
          return typeoutStats.split('\n').map((line, index) => (
            <React.Fragment key={`${typeoutKey}-${index}`}>
              {index > 0 && <br />}
              {line}
            </React.Fragment>
          ))
        }
        return null
      }
      
      if (!inputValue && typeoutPlaceholder && typeof typeoutPlaceholder === 'string') {
        return typeoutPlaceholder.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {index > 0 && <br />}
            {line}
          </React.Fragment>
        ))
      }
      
      return null
    } catch (error) {
      console.error('[Location] Error rendering stats:', error)
      return null
    }
  }

  // Wrap the entire component in error boundary
  return (
    <LocationErrorBoundary>
      <div className="location-container">
        <div className="location">
          <div className="location-input-wrapper" ref={wrapperRef}>
            <input
              ref={inputRef}
              type="text"
              className="location-input"
              placeholder={UI_TEXT.input.placeholder}
              value={inputValue}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
            />
            <div className="input-underline" />
            {showDropdown && predictions.length > 0 && (
              <div className="location-dropdown">
                <ul className="location-list">
                  {predictions.map((prediction, index) => (
                    <li
                      key={prediction.place_id}
                      className={`location-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSelect(prediction)}
                    >
                      {prediction.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {showStats && (
            <p className="location-stats">
              <span className={`location-stats-text ${selectedLocation && tideError ? 'error' : ''}`}>
                {renderStats()}
              </span>
            </p>
          )}
        </div>
      </div>
    </LocationErrorBoundary>
  )
} 