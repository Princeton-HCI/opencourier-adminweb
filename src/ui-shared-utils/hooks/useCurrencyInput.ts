import { KeyboardEvent, useCallback } from 'react'

const VALID_FIRST = /^[1-9]{1}$/
const VALID_NEXT = /^[0-9]{1}$/

type UseCurrencyInputArgs = {
  onValueChange: (value: number) => void
  value: number
  max?: number
}

export function useCurrencyInput({ max = Number.MAX_SAFE_INTEGER, value, onValueChange }: UseCurrencyInputArgs) {
  const valueAbsTrunc = Math.trunc(Math.abs(value))

  if (value !== valueAbsTrunc || !Number.isFinite(value) || Number.isNaN(value)) {
    throw new Error(`invalid value property`)
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>): void => {
      const { key } = e

      // Check if the key is not a number and not a backspace
      if ((value === 0 && !VALID_FIRST.test(key)) || (value !== 0 && !VALID_NEXT.test(key) && key !== 'Backspace')) {
        return
      }

      let nextValue: number

      if (key !== 'Backspace') {
        const nextValueString: string = value === 0 ? key : `${value.toString()}${key}`
        nextValue = Number.parseInt(nextValueString, 10)
      } else {
        const nextValueString = value.toString().slice(0, -1)
        nextValue = nextValueString === '' ? 0 : Number.parseInt(nextValueString, 10)
      }

      if (nextValue > max) {
        return
      }

      onValueChange(nextValue)
    },
    [max, onValueChange, value]
  )

  const formattedValue = (value / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return {
    handleKeyDown,
    formattedValue,
  }
}
