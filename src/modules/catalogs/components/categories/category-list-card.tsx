import { useDeleteCatalogCategoryMutation } from '@/api/catalogApi'
import { CardListActions } from '@/components/card-list-actions'
import { CategorySheetAddItem } from '@/modules/catalogs/components/categories/category-sheet-add-item'
import { CategorySheetForm } from '@/modules/catalogs/components/categories/category-sheet-form'
import { ItemSheetReorder } from '@/modules/catalogs/components/items/item-sheet-reorder'
import { CategoryWithItems } from '@/modules/catalogs/types'
import { Card, CardHeader, CardTitle, DropdownMenuItem, Icons, Sheet, useToast } from '../../../admin-web-components'
import { CatalogAdminDto, CatalogItemAdminDto, MerchantAdminDto } from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

interface CategoryListCardProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  summary: CategoryWithItems
  allItems: CatalogItemAdminDto[]
}

export function CategoryListCard({ catalog, merchant, summary: { category, items }, allItems }: CategoryListCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<boolean>(false)
  const [addItem, setAddItem] = useState<boolean>(false)
  const [reorderItems, setReorderItems] = useState<boolean>(false)
  const [sortedItems, setSortedItems] = useState<CatalogItemAdminDto[]>([])
  const [deleteCatalogCategory, { isLoading }] = useDeleteCatalogCategoryMutation()
  const { toast } = useToast()

  useEffect(() => {
    setSortedItems(
      [...items].sort((a, b) => {
        const aOrdinal = category.itemOrdinals[a.id] ?? 9999
        const bOrdinal = category.itemOrdinals[b.id] ?? 9999
        if (aOrdinal === bOrdinal) {
          return a.name > b.name ? 1 : -1
        }
        return aOrdinal - bOrdinal
      })
    )
  }, [items])

  const handleDeleteCategory = async () => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action is irreversible`)) {
      return
    }

    try {
      await deleteCatalogCategory({
        id: category.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card className="my-4">
        <CardHeader>
          <CardTitle className="flex flex-row place-content-between items-center">
            <div className="grow text-base md:text-xl">
              {category.name}
              {items.length ? (
                <div className="text-sm font-normal mt-1">
                  <b>Items:</b> {sortedItems.map((i) => i.name).join(', ')}
                </div>
              ) : null}
            </div>
            <div className="grow-0 space-x-2 flex flex-col md:flex-row items-end">
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <CardListActions>
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => setSelectedCategory(true)}>Edit</DropdownMenuItem>
                  ) : null}
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => setAddItem(true)}>Assign items</DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onClick={() => setReorderItems(true)}>Rearrange items</DropdownMenuItem>
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => handleDeleteCategory()}>Delete</DropdownMenuItem>
                  ) : null}
                </CardListActions>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      {reorderItems ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setReorderItems(false)}>
          <ItemSheetReorder
            category={category}
            items={sortedItems}
            submitted={() => setReorderItems(false)}
          ></ItemSheetReorder>
        </Sheet>
      ) : null}
      {selectedCategory ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setSelectedCategory(false)}>
          <CategorySheetForm
            catalog={catalog}
            category={category}
            submitted={() => setSelectedCategory(false)}
          ></CategorySheetForm>
        </Sheet>
      ) : null}
      {addItem ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setAddItem(false)}>
          <CategorySheetAddItem
            merchant={merchant}
            category={category}
            items={sortedItems}
            allItems={allItems}
          ></CategorySheetAddItem>
        </Sheet>
      ) : null}
    </>
  )
}
