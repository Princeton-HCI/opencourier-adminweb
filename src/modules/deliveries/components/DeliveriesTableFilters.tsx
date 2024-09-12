import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../admin-web-components'
import { debounce } from 'lodash'
import { SearchIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface DeliveriesFilters {
  search?: string
  state?: string
}

type DeliveriesTableFiltersProps = {
  onFiltersChange: (newFilters: Partial<DeliveriesFilters>) => void
}

export function DeliveriesTableFilters(props: DeliveriesTableFiltersProps) {
  const [idSearch, setIdSearch] = useState<string | null>(null)

  const clearFilters = () => {
    setIdSearch(null)
    setSearchKey(Date.now())
  }

  useEffect(() => {
    props.onFiltersChange({
      search: idSearch || undefined,
    })
  }, [idSearch])

  const [searchKey, setSearchKey] = useState(Date.now())

  return (
    <div className="flex justify-between items-center my-6">
      <div className="w-full flex gap-2 flex-wrap">
        <Select
          defaultValue="all"
          onValueChange={(value) => props.onFiltersChange({ state: value as 'active' | 'completed' | 'canceled' })}
        >
          <SelectTrigger className="min-w-[120px] max-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center relative">
          <SearchIcon className="pointer-events-none w-4 h-4 text-input left-2 absolute top-1/2 -translate-y-1/2" />
          <Input
            key={searchKey}
            placeholder="Search by ID, customer, merchant..."
            onChange={debounce((event) => setIdSearch(event.target.value), 400)}
            className="max-w-[280px] pl-8"
          />
        </div>
        {/* 
        <SearchFilterCombobox
          isLoading={customerLoading}
          items={customerSearchData || []}
          selectedItem={customer}
          onItemSelect={setCustomer}
          onNewSearchString={setCustomerSearchString}
          itemStringifier={customerFullName}
          searchInputPlaceholder="Search customers..."
          emptySearchResultsPlaceholder="No customers found."
          title="Filter by customer"
        /> */}
        {/* 
        <SearchFilterCombobox
          isLoading={merchantLoading}
          items={merchantSearchData || []}
          selectedItem={merchant}
          onItemSelect={setMerchant}
          onNewSearchString={setMerchantSearchString}
          itemStringifier={(m: MerchantSearchAdminDto) => m.name}
          searchInputPlaceholder="Search merchants..."
          emptySearchResultsPlaceholder="No merchants found."
          title="Filter by merchant"
        /> */}

        <Button variant="ghost" type="button" onClick={clearFilters}>
          <X />
          Clear
        </Button>
      </div>
    </div>
  )
}
