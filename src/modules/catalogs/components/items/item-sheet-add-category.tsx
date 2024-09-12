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

interface ItemSheetAddCategoryProps {
  merchant: MerchantAdminDto
  item: CatalogItemAdminDto
  categories: CatalogCategoryAdminDto[]
  allCategories: CatalogCategoryAdminDto[]
}

export function ItemSheetAddCategory({ merchant, item, categories, allCategories }: ItemSheetAddCategoryProps) {
  const [remainingCategories, setRemainingCategories] = useState<CatalogCategoryAdminDto[]>([])
  const [addItemMutation] = useAddItemToCategoryMutation()
  const [deleteItemMutation] = useDeleteItemFromCategoryMutation()
  const { toast } = useToast()

  useEffect(() => {
    const existingIds = categories.map((c) => c.id)
    setRemainingCategories(
      [...allCategories]
        .filter((c) => !existingIds.includes(c.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [categories, allCategories])

  const submitAddItem = async (category: CatalogCategoryAdminDto) => {
    await addItemMutation({
      id: category.id,
      itemId: item.id,
    }).unwrap()
  }

  const handleDeleteItem = async (category: CatalogCategoryAdminDto) => {
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

  const columns: ColumnDef<CatalogCategoryAdminDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
  ]

  if (merchant.menuProvider === 'NOSH') {
    columns.push({
      header: 'Actions',
      cell: ({ row: { original: category } }) => {
        return (
          <>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteItem(category)}>
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
          <SheetTitle>Assigned Categories</SheetTitle>
          <SheetDescription>Item: {item.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          {merchant.menuProvider === 'NOSH' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  Select a category
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search a category" />
                  <CommandList>
                    <CommandGroup>
                      {remainingCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={`${category.id} ${category.name}`}
                          onSelect={() => submitAddItem(category)}
                        >
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : null}
          <DataTable columns={columns} data={categories} />
        </div>
      </div>
    </SheetContent>
  )
}
