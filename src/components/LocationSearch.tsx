import { useEffect, useRef, useState } from "react"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { loadGoogleMaps } from "@/lib/google-maps"

interface Location {
  name: string
  lat: number
  lng: number
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [inputValue, setInputValue] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (window.google) {
        autocompleteService.current = new google.maps.places.AutocompleteService()
        const mapDiv = document.createElement('div')
        placesService.current = new google.maps.places.PlacesService(mapDiv)
      }
    })
  }, [])

  const handleInput = (value: string) => {
    setInputValue(value)
    setSelectedIndex(-1)

    if (!value.trim()) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    autocompleteService.current?.getPlacePredictions(
      {
        input: value,
        types: ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'natural_feature']
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results)
          setShowDropdown(true)
        } else {
          setPredictions([])
          setShowDropdown(false)
        }
      }
    )
  }

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    placesService.current?.getDetails(
      { placeId: prediction.place_id },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location: Location = {
            name: prediction.description,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }
          onLocationSelect(location)
          setInputValue(prediction.description)
          setShowDropdown(false)
          setPredictions([])
          inputRef.current?.blur()
        }
      }
    )
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

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Location"
        value={inputValue}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full"
      />
      {showDropdown && predictions.length > 0 && (
        <div className="mt-2">
          <Card className="w-full border shadow-md">
            <ul className="py-2 bg-card divide-y divide-border">
              {predictions.map((prediction, index) => (
                <li
                  key={prediction.place_id}
                  className={`px-4 py-2 cursor-pointer transition-colors font-normal ${
                    index === selectedIndex 
                      ? "bg-primary/90 text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => handleSelect(prediction)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {prediction.description}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
} 