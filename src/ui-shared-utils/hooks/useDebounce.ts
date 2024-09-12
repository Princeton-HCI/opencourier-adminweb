import { useEffect, useState } from 'react'

const DEBOUNCE_DELAY = 500

export const useDebouncedValue = <T>(value: T, delay: number = DEBOUNCE_DELAY): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
