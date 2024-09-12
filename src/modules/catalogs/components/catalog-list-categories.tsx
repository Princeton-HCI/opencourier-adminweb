import { CategoryListCard } from '@/modules/catalogs/components/categories/category-list-card'
import { CategorySheetForm } from '@/modules/catalogs/components/categories/category-sheet-form'
import { CategoryWithItems } from '@/modules/catalogs/types'
import { Button, Sheet } from '../../../admin-web-components'
import {
  CatalogCategoryComputedAdminDto,
  CatalogComputedAdminDto,
  CatalogItemAdminDto,
  CatalogItemComputedAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

interface CatalogListCategoriesProps {
  catalog: CatalogComputedAdminDto
  merchant: MerchantAdminDto
  categories: CatalogCategoryComputedAdminDto[]
  items: CatalogItemComputedAdminDto[]
  allItems: CatalogItemAdminDto[]
}

export function CatalogListCategories({ catalog, merchant, categories, items, allItems }: CatalogListCategoriesProps) {
  const [categoriesWithItems, setCategoriesWithItems] = useState<CategoryWithItems[]>([])
  const [createCategory, setCreateCategory] = useState<boolean>(false)

  useEffect(() => {
    const itemsByCategory: Record<string, CatalogItemComputedAdminDto[]> = {}
    items.forEach((item) => {
      item.categoryIds.forEach((categoryId) => {
        let currentItems = itemsByCategory[categoryId]

        if (!currentItems) {
          currentItems = []
          itemsByCategory[categoryId] = currentItems
        }

        currentItems.push(item)
      })
    })
    const sortedCategories = [...categories].sort((a, b) => {
      const aOrdinal = catalog.categoryOrdinals[a.id] ?? 9999
      const bOrdinal = catalog.categoryOrdinals[b.id] ?? 9999
      if (aOrdinal === bOrdinal) {
        return a.name > b.name ? 1 : -1
      }
      return aOrdinal - bOrdinal
    })
    setCategoriesWithItems(
      sortedCategories.map((category) => ({
        category: category,
        items: itemsByCategory[category.id] ?? [],
      }))
    )
  }, [categories, items])

  return (
    <>
      {categoriesWithItems.map((summary) => (
        <CategoryListCard
          key={`category-${summary.category.id}`}
          catalog={catalog}
          merchant={merchant}
          summary={summary}
          allItems={allItems}
        ></CategoryListCard>
      ))}
      {createCategory ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setCreateCategory(false)}>
          <CategorySheetForm catalog={catalog} submitted={() => setCreateCategory(false)}></CategorySheetForm>
        </Sheet>
      ) : null}
      {merchant.menuProvider === 'NOSH' ? (
        <Button variant="outline" onClick={() => setCreateCategory(true)}>
          Create new
        </Button>
      ) : null}
    </>
  )
}
