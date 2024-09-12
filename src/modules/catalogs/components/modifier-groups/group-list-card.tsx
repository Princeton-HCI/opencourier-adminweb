import { useDeleteModifierGroupMutation } from '@/api/catalogApi'
import { CardListActions } from '@/components/card-list-actions'
import { GroupSheetAddItem } from '@/modules/catalogs/components/modifier-groups/group-sheet-add-item'
import { GroupSheetAddModifier } from '@/modules/catalogs/components/modifier-groups/group-sheet-add-modifier'
import { GroupSheetForm } from '@/modules/catalogs/components/modifier-groups/group-sheet-form'
import { ModifierSheetForm } from '@/modules/catalogs/components/modifiers/modifier-sheet-form'
import { ModifierSheetReorder } from '@/modules/catalogs/components/modifiers/ModifierSheetReorder'
import { ModifiersWithGroup } from '@/modules/catalogs/types'
import {
  Card,
  CardHeader,
  CardTitle,
  DropdownMenuItem,
  Icons,
  Sheet,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogItemComputedAdminDto,
  CatalogItemModifierAdminDto,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface GroupListCardProps {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  summary: ModifiersWithGroup
  allItems: CatalogItemComputedAdminDto[]
  allModifiers: CatalogItemModifierAdminDto[]
}

export function GroupListCard({
  catalog,
  merchant,
  summary: { group, modifiers },
  allItems,
  allModifiers,
}: GroupListCardProps) {
  const [sortedItems, setSortedItems] = useState<CatalogItemComputedAdminDto[]>([])
  const [selectedModifier, setSelectedModifier] = useState<CatalogItemModifierAdminDto | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<boolean>(false)
  const [addItem, setAddItem] = useState<boolean>(false)
  const [addModifier, setAddModifier] = useState<boolean>(false)
  const [reorderModifiers, setReorderModifiers] = useState<boolean>(false)
  const [sortedModifiers, setSortedModifiers] = useState<CatalogItemModifierAdminDto[]>([])
  const [deleteModifierGroup, { isLoading }] = useDeleteModifierGroupMutation()
  const { toast } = useToast()

  useEffect(() => {
    setSortedModifiers(
      [...modifiers].sort((a, b) => {
        const aOrdinal = group.modifierOrdinals[a.id] ?? 9999
        const bOrdinal = group.modifierOrdinals[b.id] ?? 9999
        if (aOrdinal === bOrdinal) {
          return a.name > b.name ? 1 : -1
        }
        return aOrdinal - bOrdinal
      })
    )
  }, [group, modifiers])

  useEffect(() => {
    setSortedItems(
      allItems
        .filter((item) => item.modifierGroupIds.includes(group.id))
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
    )
  }, [group, allItems])

  const handleDeleteGroup = async () => {
    if (!confirm(`Are you sure you want to delete "${group.name}"? This action is irreversible`)) {
      return
    }

    try {
      await deleteModifierGroup({
        id: group.id,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to delete group',
        variant: 'destructive',
      })
    }
  }

  const satisfiesMinimumSelection =
    group.minimumSelection === 0 ||
    group.maximumPerModifier === 0 ||
    group.minimumSelection <= group.maximumPerModifier * sortedModifiers.length

  return (
    <>
      <Card className="my-4">
        <CardHeader>
          <CardTitle className="flex flex-row place-content-between items-center">
            <div className="grow text-base md:text-xl">
              <div className="flex flex-row items-center">
                {group.name}
                {!satisfiesMinimumSelection ? (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="text-yellow-500 ml-2  " />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Modifier selection cannot meet the minimum selection requirement. The modifier group will be
                          excluded from the catalog.
                          <br />
                          Consider assigning additional modifiers, lowering the minimum selection or increasing the
                          maximum per modifier criteria.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
              </div>
              {sortedItems.length ? (
                <div className="text-sm font-normal mt-1">
                  <b>Items:</b> {sortedItems.map((i) => i.name).join(', ')}
                </div>
              ) : null}
              {sortedModifiers.length ? (
                <div className="text-sm font-normal mt-1">
                  <b>Modifiers:</b> {sortedModifiers.map((m) => m.name).join(', ')}
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
                      <DropdownMenuItem onClick={() => setSelectedGroup(true)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAddItem(true)}>Assign to items</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAddModifier(true)}>Assign modifiers</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReorderModifiers(true)}>Rearrange modifiers</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteGroup()}>Delete</DropdownMenuItem>
                    </CardListActions>
                  )}
                </>
              ) : null}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      {reorderModifiers ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setReorderModifiers(false)}>
          <ModifierSheetReorder
            group={group}
            modifiers={sortedModifiers}
            submitted={() => setReorderModifiers(false)}
          ></ModifierSheetReorder>
        </Sheet>
      ) : null}
      {selectedModifier ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setSelectedModifier(null)}>
          <ModifierSheetForm
            catalog={catalog}
            merchant={merchant}
            modifier={selectedModifier}
            submitted={() => setSelectedModifier(null)}
          ></ModifierSheetForm>
        </Sheet>
      ) : null}
      {selectedGroup ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setSelectedGroup(false)}>
          <GroupSheetForm catalog={catalog} group={group} submitted={() => setSelectedGroup(false)}></GroupSheetForm>
        </Sheet>
      ) : null}
      {addItem ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setAddItem(false)}>
          <GroupSheetAddItem
            merchant={merchant}
            group={group}
            items={sortedItems}
            allItems={allItems}
          ></GroupSheetAddItem>
        </Sheet>
      ) : null}
      {addModifier ? (
        <Sheet open={true} onOpenChange={(isOpen) => !isOpen && setAddModifier(false)}>
          <GroupSheetAddModifier
            merchant={merchant}
            group={group}
            modifiers={sortedModifiers}
            allModifiers={allModifiers}
          ></GroupSheetAddModifier>
        </Sheet>
      ) : null}
    </>
  )
}
