import { useAddModifierToGroupMutation, useDeleteModifierFromGroupMutation } from '@/api/catalogApi'
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
import { CatalogItemModifierAdminDto, CatalogModifierGroupAdminDto, MerchantAdminDto } from '../../../backend-admin-sdk'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ModifierSheetAddGroupProps {
  merchant: MerchantAdminDto
  modifier: CatalogItemModifierAdminDto
  groups: CatalogModifierGroupAdminDto[]
  allGroups: CatalogModifierGroupAdminDto[]
}

export function ModifierSheetAddGroup({ merchant, modifier, groups, allGroups }: ModifierSheetAddGroupProps) {
  const [remainingGroups, setRemainingGroups] = useState<CatalogModifierGroupAdminDto[]>([])
  const [addModifierMutation] = useAddModifierToGroupMutation()
  const [deleteModifierMutation] = useDeleteModifierFromGroupMutation()
  const { toast } = useToast()

  useEffect(() => {
    const existingIds = groups.map((g) => g.id)
    setRemainingGroups(
      [...allGroups]
        .filter((g) => !existingIds.includes(g.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [groups, allGroups])

  const submitAddModifier = async (group: CatalogModifierGroupAdminDto) => {
    try {
      await addModifierMutation({
        id: group.id,
        modifierId: modifier.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to add modifier to group',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteModifier = async (group: CatalogModifierGroupAdminDto) => {
    if (!confirm(`Delete "${modifier.name}" from "${group.name}"?`)) {
      return
    }

    try {
      await deleteModifierMutation({
        id: group.id,
        modifierId: modifier.id,
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
      cell: ({ row: { original } }) => {
        return (
          <>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteModifier(original)}>
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
          <SheetDescription>Modifier: {modifier.name}</SheetDescription>
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
                      {remainingGroups.map((group) => (
                        <CommandItem
                          key={group.id}
                          value={`${group.id} ${group.name}`}
                          onSelect={() => submitAddModifier(group)}
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
          <DataTable columns={columns} data={groups} />
        </div>
      </div>
    </SheetContent>
  )
}
