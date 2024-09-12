import { useReorderCategoriesMutation } from '@/api/catalogApi'
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
import { CatalogCategoryAdminDto, CatalogComputedAdminDto } from '../../../backend-admin-sdk'
import { useEffect, useState } from 'react'

type CategorySheetReorderProps = WithSheetCallbacks<void> & {
  catalog: CatalogComputedAdminDto
  categories: CatalogCategoryAdminDto[]
}

export function CategorySheetReorder({ catalog, categories, onSettled }: CategorySheetReorderProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  )
  const [sortedCategories, setSortedCategories] = useState<CatalogCategoryAdminDto[]>([])
  const [reorderCategoriesMutation, { isLoading }] = useReorderCategoriesMutation()

  useEffect(() => {
    setSortedCategories(
      [...categories].sort((a, b) => {
        const aOrdinal = catalog.categoryOrdinals[a.id] ?? 9999
        const bOrdinal = catalog.categoryOrdinals[b.id] ?? 9999
        if (aOrdinal === bOrdinal) {
          return a.name > b.name ? 1 : -1
        }
        return aOrdinal - bOrdinal
      })
    )
  }, [catalog, categories])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSortedCategories((oldSortedCategories) => {
        const oldIndex = oldSortedCategories.findIndex((category) => category.id === active.id)
        const newIndex = oldSortedCategories.findIndex((category) => category.id === over.id)
        return arrayMove(oldSortedCategories, oldIndex, newIndex)
      })
    }
  }

  const submitOrdinals = async () => {
    const ordinals: Record<string, number> = {}
    sortedCategories.forEach((category, index) => {
      ordinals[category.id] = index
    })
    await reorderCategoriesMutation({
      id: catalog.id,
      ordinals,
    }).unwrap()
    onSettled?.()
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <div className="flex flex-col h-full space-y-4">
        <SheetHeader>
          <SheetTitle>Rearrange Categories</SheetTitle>
          <SheetDescription>Catalog: {catalog.name}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 overflow-y-scroll scrollbar-hide">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedCategories} strategy={verticalListSortingStrategy}>
              {sortedCategories.map((category) => (
                <SortableItem key={category.id} id={category.id}>
                  <div
                    className="p-2 text-xs"
                    style={{ background: '#fbfbfb', border: '1px solid #e2e2e2', borderRadius: 8 }}
                  >
                    {category.name}
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
