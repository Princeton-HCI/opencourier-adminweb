import { cn, useCurrencyInput } from '../../../ui-shared-utils';
import React from 'react'

export interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange: (value: number) => void
  value: number
  max?: number
}

const CurrencyInput = ({
  className = '',
  max = Number.MAX_SAFE_INTEGER,
  onValueChange,
  value,
  disabled,
}: CurrencyInputProps) => {
  const { formattedValue, handleKeyDown } = useCurrencyInput({ value, onValueChange, max })

  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      inputMode="numeric"
      onKeyDown={handleKeyDown}
      value={formattedValue}
      disabled={disabled}
    />
  )
}

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
