import { useState, useEffect } from 'react'

interface TypeoutOptions {
  numChars?: number
  delay?: number
}

export function useTypeout(text: string, { numChars = 1, delay = 100 }: TypeoutOptions = {}) {
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayText("")
      return
    }

    setIsTyping(true)
    setDisplayText("")  // Reset when text changes
    
    let currentLength = 0
    const intervalId = setInterval(() => {
      currentLength = Math.min(currentLength + numChars, text.length)
      setDisplayText(text.slice(0, currentLength))
      
      if (currentLength >= text.length) {
        clearInterval(intervalId)
        setIsTyping(false)
      }
    }, delay)

    return () => clearInterval(intervalId)
  }, [text, numChars, delay])

  return { displayText, isTyping }
} 