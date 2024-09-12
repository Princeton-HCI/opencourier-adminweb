import { useAddModifierGroupToItemMutation, useDeleteModifierGroupFromItemMutation } from '@/api/catalogApi'
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
import { CatalogItemAdminDto, CatalogModifierGroupAdminDto, MerchantAdminDto } from '../../../backend-admin-sdk'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GroupSheetAddItemProps {
  merchant: MerchantAdminDto
  group: CatalogModifierGroupAdminDto
  items: CatalogItemAdminDto[]
  allItems: CatalogItemAdminDto[]
}

export function GroupSheetAddItem({ merchant, group, items, allItems }: GroupSheetAddItemProps) {
  const [remainingItems, setRemainingItems] = useState<CatalogItemAdminDto[]>([])
  const [addGroupMutation] = useAddModifierGroupToItemMutation()
  const [deleteGroupMutation] = useDeleteModifierGroupFromItemMutation()
  const { toast } = useToast()

  useEffect(() => {
    const existingIds = items.map((m) => m.id)
    setRemainingItems(
      [...allItems]
        .filter((m) => !existingIds.includes(m.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [items, allItems])

  const submitAddGroup = async (item: CatalogItemAdminDto) => {
    await addGroupMutation({
      id: item.id,
      groupId: group.id,
    }).unwrap()
  }

  const handleDeleteGroup = async (item: CatalogItemAdminDto) => {
    if (!confirm(`Delete "${group.name}" from "${item.name}"?`)) {
      return
    }

    try {
      await deleteGroupMutation({
        id: item.id,
        groupId: group.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete modifier from group',
        variant: 'destructive',
      })
    }
  }

  const columns: ColumnDef<CatalogItemAdminDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
  ]

  if (merchant.menuProvider === 'NOSH') {
    columns.push({
      header: 'Actions',
      cell: ({ row: { original: item } }) => {
        return (
          <>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteGroup(item)}>
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
          <SheetDescription>Group: {group.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          {merchant.menuProvider === 'NOSH' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  Select a item
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
                          onSelect={() => submitAddGroup(item)}
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
