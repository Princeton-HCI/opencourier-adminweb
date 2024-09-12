import { ItemListCard } from '@/modules/catalogs/components/items/item-list-card'
import { ItemWithModifierGroup } from '@/modules/catalogs/types'
import { Button, Sheet } from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogCategoryAdminDto,
  CatalogItemComputedAdminDto,
  CatalogModifierGroupAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'
import { ItemSheetCreateForm } from './items/item-sheet-create-form'

interface CatalogListItemsProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  items: CatalogItemComputedAdminDto[]
  modifierGroups: CatalogModifierGroupAdminDto[]
  categories: CatalogCategoryAdminDto[]
}

export function CatalogListItems({ catalog, merchant, items, modifierGroups, categories }: CatalogListItemsProps) {
  const [sortedItems, setSortedItems] = useState<ItemWithModifierGroup[]>([])
  const [createItem, setCreateItem] = useState<boolean>(false)

  useEffect(() => {
    const groupsById: Record<string, CatalogModifierGroupAdminDto> = {}
    modifierGroups.forEach((group) => (groupsById[group.id] = group))

    const groupsForItem: Record<string, CatalogModifierGroupAdminDto[]> = {}
    items.forEach((item) => {
      const groupsForCurrentItem: CatalogModifierGroupAdminDto[] = []

      item.modifierGroupIds.forEach((groupId) => {
        const currentGroups = groupsById[groupId]
        if (!currentGroups) {
          return
        }
        groupsForCurrentItem.push(currentGroups)
      })

      groupsForItem[item.id] = groupsForCurrentItem
    })

    const newSortedItems = [...items].sort((a, b) => {
      return a.name > b.name ? 1 : -1
    })
    setSortedItems(
      newSortedItems.map((item) => ({
        item: item,
        modifierGroups: groupsForItem[item.id] ?? [],
      }))
    )
  }, [items, modifierGroups])

  return (
    <>
      {sortedItems.map((summary) => (
        <ItemListCard
          key={`item-${summary.item.id}`}
          catalog={catalog}
          merchant={merchant}
          summary={summary}
          allModifierGroups={modifierGroups}
          allCategories={categories}
        ></ItemListCard>
      ))}
      {createItem ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setCreateItem(false)}>
          <ItemSheetCreateForm
            catalogId={catalog.id}
            categories={categories}
            submitted={() => setCreateItem(false)}
          ></ItemSheetCreateForm>
        </Sheet>
      ) : null}
      {merchant.menuProvider === 'NOSH' ? (
        <Button variant="outline" onClick={() => setCreateItem(true)}>
          Create new
        </Button>
      ) : null}
    </>
  )
}
