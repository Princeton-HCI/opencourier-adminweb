import { Button } from '../atoms/Button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../molecules/Command'
import { Icons } from '../atoms/Icons'
import { cn } from '../../../ui-shared-utils'
import { debounce } from 'lodash'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../atoms/Popover'

interface ObjectWithId {
  id: string
}

interface SearchFilterComboboxProps<T extends ObjectWithId> {
  emptySearchResultsPlaceholder: string
  isLoading?: boolean
  itemStringifier: (item: T) => string // TODO this should be a custom renderer
  items: T[]
  onItemSelect: (item: T | null) => void
  onNewSearchString: (searchString: string) => void
  searchInputPlaceholder: string
  selectedItem: T | null
  title: string
}

export function SearchFilterCombobox<T extends ObjectWithId>({
  isLoading,
  itemStringifier,
  items,
  onItemSelect,
  onNewSearchString,
  searchInputPlaceholder,
  emptySearchResultsPlaceholder,
  selectedItem,
  title,
}: SearchFilterComboboxProps<T>) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [searchKey, setSearchKey] = useState(Date.now())
  const [debouncedSearchString, setDebouncedSearchString] = useState('')

  const debounceSearchString = debounce((search: string) => setDebouncedSearchString(search), 500)

  const itemById = (id: string) => {
    return items.find((item) => item.id === id) || null
  }

  useEffect(() => {
    debounceSearchString(searchString)
  }, [searchString])

  useEffect(() => {
    onNewSearchString(debouncedSearchString)
  }, [debouncedSearchString])

  useEffect(() => {
    if (!searchOpen) {
      setSearchString('')
      setSearchKey(Date.now())
    }
  }, [searchOpen])

  return (
    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={searchOpen} className="w-[300px] justify-between">
          {selectedItem ? itemStringifier(selectedItem) : title}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            key={searchKey}
            placeholder={searchInputPlaceholder}
            onValueChange={setSearchString}
          ></CommandInput>
          {isLoading && <Icons.spinner className="absolute right-0 mt-4 mr-4 h-4 w-4 animate-spin" />}
          <CommandList>
            <CommandEmpty>{emptySearchResultsPlaceholder}</CommandEmpty>
            <CommandGroup>
              {items.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={(currentValue) => {
                    onItemSelect(itemById(currentValue))
                    setSearchOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', selectedItem?.id === c.id ? 'opacity-100' : 'opacity-0')} />
                  {itemStringifier(c)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
