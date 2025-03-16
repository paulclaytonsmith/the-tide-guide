import { useState, useEffect, useRef } from 'react'

interface TypeoutOptions {
  numChars?: number
  delay?: number
  initialDelay?: number  // Delay before starting the typeout effect
  scramble?: boolean  // Whether to show scrambled characters ahead of the typing
  scrambleAhead?: number  // Number of scrambled characters to show ahead
}

// Characters to use for scrambling (alphanumeric and some special characters)
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'

export function useTypeout(
  text: string, 
  { 
    numChars = 1, 
    delay = 100, 
    initialDelay = 0, 
    scramble = false,
    scrambleAhead = 1
  }: TypeoutOptions = {},
  key?: string // Add optional key parameter
) {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const previousKey = useRef(key)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentLengthRef = useRef(0)

  // Reset function to clean up all timers and state
  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current)
    setDisplayText("")
    currentLengthRef.current = 0
    setIsTyping(false)
  }

  useEffect(() => {
    // Only reset if key changes
    if (key !== previousKey.current) {
      reset()
      previousKey.current = key
    }

    if (!text) {
      reset()
      return
    }

    // Don't restart if we're already at the target text
    if (displayText === text) {
      return
    }

    setIsTyping(true)
    
    initialTimeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        currentLengthRef.current = Math.min(currentLengthRef.current + numChars, text.length)
        
        let newText = text.slice(0, currentLengthRef.current)
        
        if (scramble && currentLengthRef.current < text.length) {
          const remainingLength = text.length - currentLengthRef.current
          const scrambleLength = Math.min(scrambleAhead, remainingLength)
          const scrambled = Array(scrambleLength)
            .fill(0)
            .map(() => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)])
            .join('')
            
          newText += scrambled
        }
        
        setDisplayText(newText)
        
        if (currentLengthRef.current >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setIsTyping(false)
        }
      }, delay)
    }, initialDelay)

    return reset
  }, [text, numChars, delay, initialDelay, scramble, scrambleAhead, key])

  return { displayText, isTyping }
} 