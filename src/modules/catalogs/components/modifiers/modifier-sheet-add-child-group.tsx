import { useAddChildGroupToModifierMutation, useDeleteChildGroupFromModifierMutation } from '@/api/catalogApi'
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
import {
  CatalogItemModifierComputedAdminDto,
  CatalogModifierGroupAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { canAddGroupToItemModifier } from '../../../shared-types'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ModifierSheetAddChildGroupProps {
  merchant: MerchantAdminDto
  modifier: CatalogItemModifierComputedAdminDto
  parentGroups: CatalogModifierGroupAdminDto[]
  childGroups: CatalogModifierGroupAdminDto[]
  allGroups: CatalogModifierGroupAdminDto[]
  allModifiers: CatalogItemModifierComputedAdminDto[]
}

export function ModifierSheetAddChildGroup({
  merchant,
  modifier,
  parentGroups,
  childGroups,
  allGroups,
  allModifiers,
}: ModifierSheetAddChildGroupProps) {
  const [remainingGroups, setRemainingGroups] = useState<CatalogModifierGroupAdminDto[]>([])
  const [addChildGroupMutation] = useAddChildGroupToModifierMutation()
  const [deleteChildGroupMutation] = useDeleteChildGroupFromModifierMutation()
  const { toast } = useToast()

  useEffect(() => {
    const existingIds = childGroups.map((g) => g.id)
    const parentIds = parentGroups.map((g) => g.id)
    setRemainingGroups(
      [...allGroups]
        .filter((g) => !existingIds.includes(g.id) && !parentIds.includes(g.id))
        .filter((g) => canAddGroupToItemModifier(g.id, modifier.id, allModifiers))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [parentGroups, childGroups, allGroups])

  const submitAddModifier = async (group: CatalogModifierGroupAdminDto) => {
    if (!canAddGroupToItemModifier(group.id, modifier.id, allModifiers)) {
      toast({
        title: 'Submit failed',
        description: 'Cannot add child group to modifier',
        variant: 'destructive',
      })
      return
    }

    try {
      await addChildGroupMutation({
        id: modifier.id,
        modifierGroupId: group.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to add child group to modifier',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteModifier = async (group: CatalogModifierGroupAdminDto) => {
    if (!confirm(`Delete "${modifier.name}" from "${group.name}"?`)) {
      return
    }

    try {
      await deleteChildGroupMutation({
        id: modifier.id,
        modifierGroupId: group.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete child group from modifier',
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
          <SheetTitle>Assigned Child Groups</SheetTitle>
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
          <DataTable columns={columns} data={childGroups} />
        </div>
      </div>
    </SheetContent>
  )
}
