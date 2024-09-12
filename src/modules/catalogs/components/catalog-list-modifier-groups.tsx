import { GroupListCard } from '@/modules/catalogs/components/modifier-groups/group-list-card'
import { GroupSheetForm } from '@/modules/catalogs/components/modifier-groups/group-sheet-form'
import { ModifiersWithGroup } from '@/modules/catalogs/types'
import { Button, Sheet } from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogItemComputedAdminDto,
  CatalogModifierGroupComputedAdminDto,
  CatalogItemModifierComputedAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

interface CatalogListModifierGroupsProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  items: CatalogItemComputedAdminDto[]
  modifierGroups: CatalogModifierGroupComputedAdminDto[]
  modifiers: CatalogItemModifierComputedAdminDto[]
}

export function CatalogListModifierGroups({
  catalog,
  merchant,
  items,
  modifierGroups,
  modifiers,
}: CatalogListModifierGroupsProps) {
  const [groupsWithModifiers, setGroupsWithModifiers] = useState<ModifiersWithGroup[]>([])
  const [createGroup, setCreateGroup] = useState<boolean>(false)

  useEffect(() => {
    const modifiersByGroup: Record<string, CatalogItemModifierComputedAdminDto[]> = {}
    modifiers.forEach((modifier) => {
      modifier.modifierGroupIds.forEach((groupId) => {
        let currentModifiers = modifiersByGroup[groupId]

        if (!currentModifiers) {
          currentModifiers = []
          modifiersByGroup[groupId] = currentModifiers
        }

        currentModifiers.push(modifier)
      })
    })
    const sortedGroups = [...modifierGroups].sort((a, b) => {
      return a.name > b.name ? 1 : -1
    })
    setGroupsWithModifiers(
      sortedGroups.map((group) => ({
        group: group,
        modifiers: modifiersByGroup[group.id] ?? [],
      }))
    )
  }, [modifierGroups, modifiers])

  return (
    <>
      {groupsWithModifiers.map((summary) => (
        <GroupListCard
          key={`group-${summary.group.id}`}
          catalog={catalog}
          merchant={merchant}
          summary={summary}
          allItems={items}
          allModifiers={modifiers}
        ></GroupListCard>
      ))}
      {createGroup ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setCreateGroup(false)}>
          <GroupSheetForm catalog={catalog} submitted={() => setCreateGroup(false)}></GroupSheetForm>
        </Sheet>
      ) : null}
      {merchant.menuProvider === 'NOSH' ? (
        <Button variant="outline" onClick={() => setCreateGroup(true)}>
          Create new
        </Button>
      ) : null}
    </>
  )
}
