import { useEffect, useRef, useState } from "react"
import { loadGoogleMaps } from "@/lib/google-maps"
import "./Location.css"

const INPUT_PLACEHOLDER = "Enter Location"
const PLACEHOLDER_STATS = "Search for places near the coastal USA"
const LOADING_STATS = "Loading tide data..."


interface Location {
  name: string
  lat: number
  lng: number
}

interface LocationProps {
  onLocationSelect: (location: Location) => void
}

export function Location({ onLocationSelect }: LocationProps) {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [inputValue, setInputValue] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

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
      if (inputRef.current && wrapperRef.current) {
        // Create a temporary span to measure text width
        const span = document.createElement('span')
        // Copy all relevant styles that could affect text width
        const inputStyles = window.getComputedStyle(inputRef.current)
        
        span.style.font = inputStyles.font
        span.style.letterSpacing = inputStyles.letterSpacing
        span.style.visibility = 'hidden'
        span.style.position = 'absolute'
        span.style.whiteSpace = 'pre'
        
        // Use input value or placeholder
        const textToMeasure = inputValue || INPUT_PLACEHOLDER || ''
        span.textContent = textToMeasure
        
        document.body.appendChild(span)
        const width = Math.ceil(span.getBoundingClientRect().width)
        document.body.removeChild(span)
        
        // Use exact measured width without padding
        wrapperRef.current.style.width = `${width}px`
        wrapperRef.current.classList.add('initialized')
      }
    }

    // Initial update with a small delay to ensure styles are loaded
    const initialTimeoutId = setTimeout(() => {
      updateWidth()
    }, 100)  // Increased delay to ensure styles are loaded
    
    // Update on window resize
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
      clearTimeout(initialTimeoutId)
    }
  }, [inputValue])

  const handleInput = async (value: string) => {
    setInputValue(value)
    setSelectedIndex(-1)
    setSelectedLocation(null) // Hide stats when typing

    if (!value.trim()) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)

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
    } finally {
      setIsLoading(false)
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
      // Error handling for place details
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

  return (
    <div className="location-container">
      <div className="location">
        <div className="location-input-wrapper" ref={wrapperRef}>
          <input
            ref={inputRef}
            type="text"
            className="location-input"
            placeholder={INPUT_PLACEHOLDER}
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowDropdown(true)}
          />
          {showDropdown && predictions.length > 0 && (
            <div className="location-dropdown">
              <ul className="location-list">
                {predictions.map((prediction, index) => (
                  <li
                    key={prediction.place_id}
                    className={`location-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSelect(prediction)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                  >
                    {prediction.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="location-stats">
          <span className="location-stats-text">
            {selectedLocation ? formatCoordinates(selectedLocation.lat, selectedLocation.lng) :
             isLoading ? LOADING_STATS :
             !inputValue ? PLACEHOLDER_STATS : null}
          </span>
        </div>
      </div>
    </div>
  )
} 