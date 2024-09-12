import { useReorderCategoryItemsMutation } from '@/api/catalogApi'
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
} from '../../../admin-web-components'
import { CatalogCategoryComputedAdminDto, CatalogItemAdminDto } from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

interface ItemSheetReorderProps {
  category: CatalogCategoryComputedAdminDto
  items: CatalogItemAdminDto[]
  submitted?: () => void
}

export function ItemSheetReorder({ category, items, submitted }: ItemSheetReorderProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  )
  const [sortedItems, setSortedItems] = useState<CatalogItemAdminDto[]>([])
  const [reorderItemsMutation, { isLoading }] = useReorderCategoryItemsMutation()

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
  }, [category, items])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSortedItems((oldSortedItems) => {
        const oldIndex = oldSortedItems.findIndex((item) => item.id === active.id)
        const newIndex = oldSortedItems.findIndex((item) => item.id === over.id)
        return arrayMove(oldSortedItems, oldIndex, newIndex)
      })
    }
  }

  const submitOrdinals = async () => {
    const ordinals: Record<string, number> = {}
    sortedItems.forEach((item, index) => {
      ordinals[item.id] = index
    })
    await reorderItemsMutation({
      id: category.id,
      ordinals,
    }).unwrap()
    submitted && submitted()
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <div className="flex flex-col h-full space-y-4">
        <SheetHeader>
          <SheetTitle>Rearrange Items</SheetTitle>
          <SheetDescription>Category: {category.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-auto scrollbar-hide">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            autoScroll={{ threshold: { x: 0, y: 0.1 } }}
          >
            <SortableContext items={sortedItems} strategy={verticalListSortingStrategy}>
              {sortedItems.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <div
                    className="p-2 text-xs"
                    style={{ background: '#fbfbfb', border: '1px solid #e2e2e2', borderRadius: 8 }}
                  >
                    {item.name}
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
