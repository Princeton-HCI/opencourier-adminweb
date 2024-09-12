import { useDeleteItemModifierMutation } from '@/api/catalogApi'
import { CardListActions } from '@/components/card-list-actions'
import { ModifierSheetAddGroup } from '@/modules/catalogs/components/modifiers/modifier-sheet-add-group'
import { ModifierSheetAddChildGroup } from '@/modules/catalogs/components/modifiers/modifier-sheet-add-child-group'
import { ModifierSheetForm } from '@/modules/catalogs/components/modifiers/modifier-sheet-form'
import { Card, CardHeader, CardTitle, DropdownMenuItem, Icons, Sheet, useToast } from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogItemModifierComputedAdminDto,
  CatalogModifierGroupAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

interface ModifierListCardProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  modifier: CatalogItemModifierComputedAdminDto
  allModifierGroups: CatalogModifierGroupAdminDto[]
  allModifiers: CatalogItemModifierComputedAdminDto[]
}

export function ModifierListCard({
  catalog,
  merchant,
  modifier,
  allModifierGroups,
  allModifiers,
}: ModifierListCardProps) {
  const [selectedModifier, setSelectedModifier] = useState<boolean>(false)
  const [addGroup, setAddGroup] = useState<boolean>(false)
  const [addChildGroup, setAddChildGroup] = useState<boolean>(false)
  const [sortedGroups, setSortedGroups] = useState<CatalogModifierGroupAdminDto[]>([])
  const [sortedChildGroups, setSortedChildGroups] = useState<CatalogModifierGroupAdminDto[]>([])
  const [deleteItemModifier, { isLoading }] = useDeleteItemModifierMutation()
  const { toast } = useToast()

  useEffect(() => {
    setSortedGroups(
      allModifierGroups
        .filter((group) => modifier.modifierGroupIds.includes(group.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
    setSortedChildGroups(
      allModifierGroups
        .filter((group) => modifier.childModifierGroupIds.includes(group.id)) // ToDo
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [modifier, allModifierGroups])

  const handleDeleteModifier = async () => {
    if (!confirm(`Are you sure you want to delete "${modifier.name}"? This action is irreversible`)) {
      return
    }

    try {
      await deleteItemModifier({
        id: modifier.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete modifier',
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
              {modifier.name}
              {sortedGroups.length ? (
                <div className="text-sm font-normal mt-1">
                  <b>Modifier Groups:</b> {sortedGroups.map((c) => c.name).join(', ')}
                </div>
              ) : null}
              {sortedChildGroups.length ? (
                <div className="text-sm font-normal mt-1">
                  <b>Child Modifier Groups:</b> {sortedChildGroups.map((c) => c.name).join(', ')}
                </div>
              ) : null}
            </div>
            <div className="grow-0 space-x-2 flex flex-col md:flex-row items-end">
              {merchant.menuProvider === 'NOSH' ? (
                <>
                  {isLoading ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <CardListActions>
                      <DropdownMenuItem onClick={() => setSelectedModifier(true)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAddGroup(true)}>Assign to groups</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAddChildGroup(true)}>Assign child groups</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteModifier()}>Delete</DropdownMenuItem>
                    </CardListActions>
                  )}
                </>
              ) : null}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      {selectedModifier ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setSelectedModifier(false)}>
          <ModifierSheetForm
            catalog={catalog}
            merchant={merchant}
            modifier={modifier}
            submitted={() => setSelectedModifier(false)}
          ></ModifierSheetForm>
        </Sheet>
      ) : null}
      {addGroup ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setAddGroup(false)}>
          <ModifierSheetAddGroup
            merchant={merchant}
            modifier={modifier}
            groups={sortedGroups}
            allGroups={allModifierGroups}
          ></ModifierSheetAddGroup>
        </Sheet>
      ) : null}
      {addChildGroup ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setAddChildGroup(false)}>
          <ModifierSheetAddChildGroup
            merchant={merchant}
            modifier={modifier}
            parentGroups={sortedGroups}
            childGroups={sortedChildGroups}
            allGroups={allModifierGroups}
            allModifiers={allModifiers}
          ></ModifierSheetAddChildGroup>
        </Sheet>
      ) : null}
    </>
  )
}
