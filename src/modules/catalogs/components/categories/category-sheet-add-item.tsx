import { useAddItemToCategoryMutation, useDeleteItemFromCategoryMutation } from '@/api/catalogApi'
import {
  Button,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DataTable,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  useToast,
} from '../../../admin-web-components'
import { CatalogCategoryAdminDto, CatalogItemAdminDto, MerchantAdminDto } from '../../../backend-admin-sdk'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CategorySheetAddItemProps {
  merchant: MerchantAdminDto
  category: CatalogCategoryAdminDto
  items: CatalogItemAdminDto[]
  allItems: CatalogItemAdminDto[]
}

export function CategorySheetAddItem({ merchant, category, items, allItems }: CategorySheetAddItemProps) {
  const [remainingItems, setRemainingItems] = useState<CatalogItemAdminDto[]>([])
  const [addItemMutation] = useAddItemToCategoryMutation()
  const [deleteItemMutation] = useDeleteItemFromCategoryMutation()
  const { toast } = useToast()

  useEffect(() => {
    const existingIds = items.map((i) => i.id)
    setRemainingItems(
      [...allItems]
        .filter((i) => !existingIds.includes(i.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [items, allItems])

  const submitAddItem = async (item: CatalogItemAdminDto) => {
    await addItemMutation({
      id: category.id,
      itemId: item.id,
    }).unwrap()
  }

  const handleDeleteItem = async (item: CatalogItemAdminDto) => {
    if (!confirm(`Delete "${item.name}" from "${category.name}"?`)) {
      return
    }

    try {
      await deleteItemMutation({
        id: category.id,
        itemId: item.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete item from category',
        variant: 'destructive',
      })
    }
  }

  const columns: ColumnDef<CatalogItemAdminDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      header: 'Price',
      accessorFn: (item) => `$${(item.price / 100).toFixed(2)}`,
    },
  ]

  if (merchant.menuProvider === 'NOSH') {
    columns.push({
      header: 'Actions',
      cell: ({ row: { original: item } }) => {
        return (
          <>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteItem(item)}>
              <X className="h-6 w-6" />
            </Button>
          </>
        )
      },
    })
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <div className="flex flex-col h-full space-y-4">
        <SheetHeader>
          <SheetTitle>Assigned Items</SheetTitle>
          <SheetDescription>Category: {category.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          {merchant.menuProvider === 'NOSH' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  Select an item
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search a item" />
                  <CommandList>
                    <CommandGroup>
                      {remainingItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.id} ${item.name}`}
                          onSelect={() => submitAddItem(item)}
                        >
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : null}
          <DataTable columns={columns} data={items} />
        </div>
      </div>
    </SheetContent>
  )
}
