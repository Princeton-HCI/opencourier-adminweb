import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../admin-web-components';
import { cn, countryCodes } from '../ui-shared-utils';
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CountryComboboxProps {
  defaultValue?: string
  setSelected: (details: { name: string; code: string; dialCode: string }) => void
}

export const CountryCombobox = ({ defaultValue, setSelected }: CountryComboboxProps) => {
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    setValue(defaultValue ?? '')
  }, [defaultValue])

  const handleSelect = (country: { name: string; code: string; dialCode: string }) => {
    setValue(country['code'])
    setSelected(country)
  }

  return (
    <Command>
      <CommandInput placeholder="Search a country" />
      <CommandList>
        <CommandGroup>
          {countryCodes.map((countryItem) => (
            <CommandItem
              key={`countryCode-${countryItem.code}`}
              value={countryItem.name}
              onSelect={() => handleSelect(countryItem)}
            >
              <Check className={cn('mr-2 h-4 w-4', countryItem['code'] === value ? 'opacity-100' : 'opacity-0')} />
              {countryItem.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
