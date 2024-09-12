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

interface ItemSheetAddGroupProps {
  merchant: MerchantAdminDto
  item: CatalogItemAdminDto
  modifierGroups: CatalogModifierGroupAdminDto[]
  allModifierGroups: CatalogModifierGroupAdminDto[]
}

export function ItemSheetAddGroup({ merchant, item, modifierGroups, allModifierGroups }: ItemSheetAddGroupProps) {
  const [remainingModifierGroups, setRemainingModifierGroups] = useState<CatalogModifierGroupAdminDto[]>([])
  const [addGroupMutation] = useAddModifierGroupToItemMutation()
  const [deleteGroupMutation] = useDeleteModifierGroupFromItemMutation()
  const { toast } = useToast()

  useEffect(() => {
    const existingIds = modifierGroups.map((m) => m.id)
    setRemainingModifierGroups(
      [...allModifierGroups]
        .filter((g) => !existingIds.includes(g.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [modifierGroups, allModifierGroups])

  const submitAddGroup = async (group: CatalogModifierGroupAdminDto) => {
    await addGroupMutation({
      id: item.id,
      groupId: group.id,
    }).unwrap()
  }

  const handleDeleteGroup = async (group: CatalogModifierGroupAdminDto) => {
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

  const columns: ColumnDef<CatalogModifierGroupAdminDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
  ]

  if (merchant.menuProvider === 'NOSH') {
    columns.push({
      header: 'Actions',
      cell: ({ row: { original: group } }) => {
        return (
          <>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteGroup(group)}>
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
          <SheetTitle>Assigned Modifier Groups</SheetTitle>
          <SheetDescription>Item: {item.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          {merchant.menuProvider === 'NOSH' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  Select a modifier group
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search a modifier group" />
                  <CommandList>
                    <CommandGroup>
                      {remainingModifierGroups.map((group) => (
                        <CommandItem
                          key={group.id}
                          value={`${group.id} ${group.name}`}
                          onSelect={() => submitAddGroup(group)}
                        >
                          {group.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : null}
          <DataTable columns={columns} data={modifierGroups} />
        </div>
      </div>
    </SheetContent>
  )
}
