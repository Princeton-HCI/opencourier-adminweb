import { useAddCategoryToCatalogMutation, useDeleteCategoryFromCatalogMutation } from '@/api/catalogApi'
import {
  Button,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DataTable,
  Icons,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  useToast,
} from '../../../admin-web-components'
import { CatalogAdminDto, CatalogCategoryAdminDto } from '../../../backend-admin-sdk'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CatalogSheetAddCategoryProps {
  catalog: CatalogAdminDto
  categories: CatalogCategoryAdminDto[]
  allCategories: CatalogCategoryAdminDto[]
}

export function CatalogSheetAddCategory({ catalog, categories, allCategories }: CatalogSheetAddCategoryProps) {
  const [remainingCategories, setRemainingCategories] = useState<CatalogCategoryAdminDto[]>([])
  const [sortedCategories, setSortedCategories] = useState<CatalogCategoryAdminDto[]>([])
  const [addCategoryMutation, { isLoading }] = useAddCategoryToCatalogMutation()
  const [deleteCategoryMutation] = useDeleteCategoryFromCatalogMutation()
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
    setSortedCategories(
      [...categories].sort((a, b) => {
        return a.name > b.name ? 1 : -1
      })
    )
  }, [categories, allCategories])

  const submitAddCategory = async (category: CatalogCategoryAdminDto) => {
    await addCategoryMutation({
      id: catalog.id,
      categoryId: category.id,
    }).unwrap()
  }

  const handleDeleteCategory = async (category: CatalogCategoryAdminDto) => {
    if (!confirm(`Delete "${category.name}" from "${catalog.name}"?`)) {
      return
    }

    try {
      await deleteCategoryMutation({
        id: catalog.id,
        categoryId: category.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete category from catalog',
        variant: 'destructive',
      })
    }
  }

  const columns: ColumnDef<CatalogCategoryAdminDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      header: 'Actions',
      cell: ({ row: { original: category } }) => {
        return (
          <>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteCategory(category)}>
              <X className="h-6 w-6" />
            </Button>
          </>
        )
      },
    },
  ]

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <div className="flex flex-col h-full space-y-4">
        <SheetHeader>
          <SheetTitle>Categories in Catalog</SheetTitle>
          <SheetDescription>Catalog: {catalog.name}</SheetDescription>
        </SheetHeader>
        {!isLoading ? (
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
                        onSelect={() => submitAddCategory(category)}
                      >
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        <DataTable columns={columns} data={sortedCategories} />
      </div>
    </SheetContent>
  )
}
