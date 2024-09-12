import { useReorderModifierGroupsMutation } from '@/api/catalogApi'
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
import { CatalogItemComputedAdminDto, CatalogModifierGroupAdminDto } from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

type GroupSheetReorderProps = WithSheetCallbacks<void> & {
  item: CatalogItemComputedAdminDto
  groups: CatalogModifierGroupAdminDto[]
  submitted?: () => void
}

export function GroupSheetReorder({ item, groups, submitted }: GroupSheetReorderProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  )
  const [sortedGroups, setSortedGroups] = useState<CatalogModifierGroupAdminDto[]>([])
  const [reorderModifierGroupsMutation, { isLoading }] = useReorderModifierGroupsMutation()

  useEffect(() => {
    setSortedGroups(
      [...groups].sort((a, b) => {
        const aOrdinal = item.modifierGroupOrdinals[a.id] ?? 9999
        const bOrdinal = item.modifierGroupOrdinals[b.id] ?? 9999
        if (aOrdinal === bOrdinal) {
          return a.name > b.name ? 1 : -1
        }
        return aOrdinal - bOrdinal
      })
    )
  }, [item, groups])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSortedGroups((oldSortedGroups) => {
        const oldIndex = oldSortedGroups.findIndex((group) => group.id === active.id)
        const newIndex = oldSortedGroups.findIndex((group) => group.id === over.id)
        return arrayMove(oldSortedGroups, oldIndex, newIndex)
      })
    }
  }

  const submitOrdinals = async () => {
    const ordinals: Record<string, number> = {}
    sortedGroups.forEach((group, index) => {
      ordinals[group.id] = index
    })
    await reorderModifierGroupsMutation({
      id: item.id,
      ordinals,
    }).unwrap()
    submitted && submitted()
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <div className="flex flex-col h-full space-y-4">
        <SheetHeader>
          <SheetTitle>Rearrange Modifier Groups</SheetTitle>
          <SheetDescription>Item: {item.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedGroups} strategy={verticalListSortingStrategy}>
              {sortedGroups.map((group) => (
                <SortableItem key={group.id} id={group.id}>
                  <div
                    className="p-2 text-xs"
                    style={{ background: '#fbfbfb', border: '1px solid #e2e2e2', borderRadius: 8 }}
                  >
                    {group.name}
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
