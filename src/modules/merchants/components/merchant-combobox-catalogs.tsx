import { useGetMerchantCatalogsQuery } from '@/api/catalogApi'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import {
  Button,
  Command,
  CommandGroup,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../admin-web-components'
import { CatalogAdminDto } from '../../../backend-admin-sdk'
import { cn } from '../../../ui-shared-utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

type MerchantComboboxCatalogsProps = {
  catalog: CatalogAdminDto
  merchantId: string
  groupId: string
}
export function MerchantComboboxCatalogs({ catalog, groupId, merchantId }: MerchantComboboxCatalogsProps) {
  const [open, setOpen] = useState<boolean>(false)
  const { data } = useGetMerchantCatalogsQuery({ merchantId: catalog.merchantId })
  const { goToCatalogDetails } = useAdminPageNavigator()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[190px] justify-between">
          {catalog.name}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {data?.map((c) => (
              <CommandItem
                key={c.id}
                value={c.id}
                onSelect={() => goToCatalogDetails(groupId, merchantId, c.id).then(() => setOpen(false))}
              >
                <Check className={cn('mr-2 h-4 w-4', c.id === catalog.id ? 'opacity-100' : 'opacity-0')} />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
