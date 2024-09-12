import { ModifierListCard } from '@/modules/catalogs/components/modifiers/modifier-list-card'
import { ModifierSheetForm } from '@/modules/catalogs/components/modifiers/modifier-sheet-form'
import { Button, Sheet } from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogItemModifierComputedAdminDto,
  CatalogModifierGroupAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

interface CatalogListModifiersProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  allModifiers: CatalogItemModifierComputedAdminDto[]
  allModifierGroups: CatalogModifierGroupAdminDto[]
}

export function CatalogListModifiers({
  catalog,
  merchant,
  allModifiers,
  allModifierGroups,
}: CatalogListModifiersProps) {
  const [sortedModifiers, setSortedModifiers] = useState<CatalogItemModifierComputedAdminDto[]>([])
  const [createModifier, setCreateModifier] = useState<boolean>(false)

  useEffect(() => {
    setSortedModifiers(
      [...allModifiers].sort((a, b) => {
        return a.name > b.name ? 1 : -1
      })
    )
  }, [allModifiers])

  return (
    <>
      {sortedModifiers.map((modifier) => (
        <ModifierListCard
          key={`modifier-${modifier.id}`}
          catalog={catalog}
          merchant={merchant}
          modifier={modifier}
          allModifierGroups={allModifierGroups}
          allModifiers={allModifiers}
        ></ModifierListCard>
      ))}
      {createModifier ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setCreateModifier(false)}>
          <ModifierSheetForm
            catalog={catalog}
            merchant={merchant}
            submitted={() => setCreateModifier(false)}
          ></ModifierSheetForm>
        </Sheet>
      ) : null}
      {merchant.menuProvider === 'NOSH' ? (
        <Button variant="outline" onClick={() => setCreateModifier(true)}>
          Create new
        </Button>
      ) : null}
    </>
  )
}
