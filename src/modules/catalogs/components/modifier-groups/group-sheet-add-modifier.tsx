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

interface GroupSheetAddModifierProps {
  merchant: MerchantAdminDto
  group: CatalogModifierGroupAdminDto
  modifiers: CatalogItemModifierAdminDto[]
  allModifiers: CatalogItemModifierAdminDto[]
}

export function GroupSheetAddModifier({ merchant, group, modifiers, allModifiers }: GroupSheetAddModifierProps) {
  const [remainingModifiers, setRemainingModifiers] = useState<CatalogItemModifierAdminDto[]>([])
  const [addModifierMutation] = useAddModifierToGroupMutation()
  const [deleteModifierMutation] = useDeleteModifierFromGroupMutation()
  const { toast } = useToast()

  useEffect(() => {
    const existingIds = modifiers.map((m) => m.id)
    setRemainingModifiers(
      [...allModifiers]
        .filter((m) => !existingIds.includes(m.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [modifiers, allModifiers])

  const submitAddModifier = async (modifier: CatalogItemModifierAdminDto) => {
    await addModifierMutation({
      id: group.id,
      modifierId: modifier.id,
    }).unwrap()
  }

  const handleDeleteModifier = async (modifier: CatalogItemModifierAdminDto) => {
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

  const columns: ColumnDef<CatalogItemModifierAdminDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
  ]

  if (merchant.menuProvider === 'NOSH') {
    columns.push({
      header: 'Actions',
      cell: ({ row: { original: modifier } }) => {
        return (
          <>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteModifier(modifier)}>
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
          <SheetTitle>Assigned Modifiers</SheetTitle>
          <SheetDescription>Group: {group.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          {merchant.menuProvider === 'NOSH' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  Select a modifier
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search a modifier" />
                  <CommandList>
                    <CommandGroup>
                      {remainingModifiers.map((modifier) => (
                        <CommandItem
                          key={modifier.id}
                          value={`${modifier.id} ${modifier.name}`}
                          onSelect={() => submitAddModifier(modifier)}
                        >
                          {modifier.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : null}
          <DataTable columns={columns} data={modifiers} />
        </div>
      </div>
    </SheetContent>
  )
}
