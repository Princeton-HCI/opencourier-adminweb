import { useReorderItemModifiersMutation } from '@/api/catalogApi'
import { SortableItem } from '@/components/sortable-item'
import { DndContext, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  Button,
  Icons,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  WithSheetCallbacks,
} from '../../../admin-web-components'
import { CatalogItemModifierAdminDto, CatalogModifierGroupComputedAdminDto } from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

type GroupSheetReorderProps = WithSheetCallbacks<void> & {
  group: CatalogModifierGroupComputedAdminDto
  modifiers: CatalogItemModifierAdminDto[]
  submitted?: () => void
}

export function ModifierSheetReorder({ group, modifiers, submitted }: GroupSheetReorderProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  )
  const [sortedModifiers, setSortedModifiers] = useState<CatalogItemModifierAdminDto[]>([])
  const [reorderModifiersMutation, { isLoading }] = useReorderItemModifiersMutation()

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSortedModifiers((oldSortedModifiers) => {
        const oldIndex = oldSortedModifiers.findIndex((modifier) => modifier.id === active.id)
        const newIndex = oldSortedModifiers.findIndex((modifier) => modifier.id === over.id)
        return arrayMove(oldSortedModifiers, oldIndex, newIndex)
      })
    }
  }

  const submitOrdinals = async () => {
    const ordinals: Record<string, number> = {}
    sortedModifiers.forEach((modifier, index) => {
      ordinals[modifier.id] = index
    })
    await reorderModifiersMutation({
      id: group.id,
      ordinals,
    }).unwrap()
    submitted && submitted()
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <div className="flex flex-col h-full space-y-4">
        <SheetHeader>
          <SheetTitle>Rearrange Modifiers</SheetTitle>
          <SheetDescription>Group: {group.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedModifiers} strategy={verticalListSortingStrategy}>
              {sortedModifiers.map((modifier) => (
                <SortableItem key={modifier.id} id={modifier.id}>
                  <div
                    className="p-2 text-xs"
                    style={{ background: '#fbfbfb', border: '1px solid #e2e2e2', borderRadius: 8 }}
                  >
                    {modifier.name}
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <SheetFooter>
          <Button variant="default" onClick={() => submitOrdinals()} disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  )
}
