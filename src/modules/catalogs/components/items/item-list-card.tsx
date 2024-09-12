import { useDeleteCatalogItemMutation } from '@/api/catalogApi'
import { CardListActions } from '@/components/card-list-actions'
import { ItemSheetAddCategory } from '@/modules/catalogs/components/items/item-sheet-add-category'
import { ItemSheetAddGroup } from '@/modules/catalogs/components/items/item-sheet-add-group'
import { ItemSheetForm } from '@/modules/catalogs/components/items/item-sheet-form'
import { ItemSheetImages } from '@/modules/catalogs/components/items/item-sheet-images'
import { ItemWithModifierGroup } from '@/modules/catalogs/types'
import { Card, CardHeader, CardTitle, DropdownMenuItem, Icons, Sheet, useToast } from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogCategoryAdminDto,
  CatalogModifierGroupAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'
import { GroupSheetReorder } from '@/modules/catalogs/components/modifier-groups/GroupSheetReorder'

interface ItemListCardProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  summary: ItemWithModifierGroup
  allCategories: CatalogCategoryAdminDto[]
  allModifierGroups: CatalogModifierGroupAdminDto[]
}

export function ItemListCard({
  catalog,
  merchant,
  summary: { item, modifierGroups },
  allCategories,
  allModifierGroups,
}: ItemListCardProps) {
  const [selectedItem, setSelectedItem] = useState<boolean>(false)
  const [viewImages, setViewImages] = useState<boolean>(false)
  const [addCategory, setAddCategory] = useState<boolean>(false)
  const [addModifierGroup, setAddModifierGroup] = useState<boolean>(false)
  const [reorderModifierGroups, setReorderModifierGroups] = useState<boolean>(false)
  const [sortedCategories, setSortedCategories] = useState<CatalogCategoryAdminDto[]>([])
  const [sortedModifierGroups, setSortedModifierGroups] = useState<CatalogModifierGroupAdminDto[]>([])
  const [deleteCatalogItem, { isLoading }] = useDeleteCatalogItemMutation()
  const { toast } = useToast()

  useEffect(() => {
    setSortedCategories(
      [...allCategories]
        .filter((category) => item.categoryIds.includes(category.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [item, allCategories])

  useEffect(() => {
    setSortedModifierGroups(
      [...modifierGroups].sort((a, b) => {
        const aOrdinal = item.modifierGroupOrdinals[a.id] ?? 9999
        const bOrdinal = item.modifierGroupOrdinals[b.id] ?? 9999
        if (aOrdinal === bOrdinal) {
          return a.name > b.name ? 1 : -1
        }
        return aOrdinal - bOrdinal
      })
    )
  }, [modifierGroups])

  const handleDeleteItem = async () => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action is irreversible`)) {
      return
    }

    try {
      await deleteCatalogItem({
        id: item.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete item',
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
              {item.name}
              {sortedCategories.length ? (
                <div className="text-sm font-normal mt-1">
                  <b>Categories:</b> {sortedCategories.map((c) => c.name).join(', ')}
                </div>
              ) : null}
              {sortedModifierGroups.length ? (
                <div className="text-sm font-normal mt-1">
                  <b>Modifier Groups:</b> {sortedModifierGroups.map((g) => g.name).join(', ')}
                </div>
              ) : null}
            </div>
            <div className="grow-0 space-x-2 flex flex-col md:flex-row items-end">
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <CardListActions>
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => setSelectedItem(true)}>Edit</DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onClick={() => setViewImages(true)}>View images</DropdownMenuItem>
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => setAddCategory(true)}>Assign to categories</DropdownMenuItem>
                  ) : null}
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => setAddModifierGroup(true)}>Assign modifiers</DropdownMenuItem>
                  ) : null}
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => setReorderModifierGroups(true)}>
                      Rearrange modifiers
                    </DropdownMenuItem>
                  ) : null}
                  {merchant.menuProvider === 'NOSH' ? (
                    <DropdownMenuItem onClick={() => handleDeleteItem()}>Delete</DropdownMenuItem>
                  ) : null}
                </CardListActions>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      {reorderModifierGroups ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setReorderModifierGroups(false)}>
          <GroupSheetReorder
            item={item}
            groups={sortedModifierGroups}
            submitted={() => setReorderModifierGroups(false)}
          ></GroupSheetReorder>
        </Sheet>
      ) : null}
      {selectedItem ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setSelectedItem(false)}>
          <ItemSheetForm
            catalog={catalog}
            merchant={merchant}
            item={item}
            submitted={() => setSelectedItem(false)}
          ></ItemSheetForm>
        </Sheet>
      ) : null}
      {viewImages ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setViewImages(false)}>
          <ItemSheetImages merchant={merchant} item={item}></ItemSheetImages>
        </Sheet>
      ) : null}
      {addCategory ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setAddCategory(false)}>
          <ItemSheetAddCategory
            merchant={merchant}
            item={item}
            categories={sortedCategories}
            allCategories={allCategories}
          ></ItemSheetAddCategory>
        </Sheet>
      ) : null}
      {addModifierGroup ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setAddModifierGroup(false)}>
          <ItemSheetAddGroup
            merchant={merchant}
            item={item}
            modifierGroups={sortedModifierGroups}
            allModifierGroups={allModifierGroups}
          ></ItemSheetAddGroup>
        </Sheet>
      ) : null}
    </>
  )
}
