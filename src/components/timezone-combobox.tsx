import React, { useEffect, useState } from 'react'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '../admin-web-components'
import { Check } from 'lucide-react'
import { cn, timezones } from '../ui-shared-utils'
import { uniq } from 'lodash'

interface TimezoneComboboxProps {
  defaultValue?: string
  setSelected: (details: string) => void
}

export const TimezoneCombobox = ({ defaultValue, setSelected }: TimezoneComboboxProps) => {
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    setValue(defaultValue ?? '')
  }, [defaultValue])

  const handleSelect = (timezone: string) => {
    setValue(timezone)
    setSelected(timezone)
  }

  let timezonesUtc: string[] = []
  timezones.forEach((t) => {
    timezonesUtc.push(...t.utc)
  })
  timezonesUtc = uniq(timezonesUtc).sort()

  return (
    <Command>
      <CommandInput placeholder="Search a timezone" />
      <CommandList>
        <CommandGroup>
          {timezonesUtc.map((timezoneItem) => (
            <CommandItem key={timezoneItem} value={timezoneItem} onSelect={() => handleSelect(timezoneItem)}>
              <Check className={cn('mr-2 h-4 w-4', timezoneItem === value ? 'opacity-100' : 'opacity-0')} />
              {timezoneItem}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
