import { CatalogCompleteAdminDto } from '../../../backend-admin-sdk'
import { CatalogListCategories } from '@/modules/catalogs/components/catalog-list-categories'
import { CatalogListItems } from '@/modules/catalogs/components/catalog-list-items'
import { CatalogListModifierGroups } from '@/modules/catalogs/components/catalog-list-modifier-groups'
import { CatalogListModifiers } from '@/modules/catalogs/components/catalog-list-modifiers'
import { CatalogListSchedule } from '@/modules/catalogs/components/catalog-list-schedule'
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '../../../admin-web-components'

interface CatalogCardManagerProps {
  list: CatalogCompleteAdminDto
}

export function CatalogCardManager({ list }: CatalogCardManagerProps) {
  return (
    <Card className="my-4 pt-4">
      <CardContent className="grid gap-6">
        <Tabs className="overflow-hidden" defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories">Catalog Categories</TabsTrigger>
            <TabsTrigger value="items">Catalog Items</TabsTrigger>
            <TabsTrigger value="modifierGroups">Modifier Groups</TabsTrigger>
            <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="categories">
            <CatalogListCategories
              catalog={list.catalog}
              merchant={list.merchant}
              categories={list.categories}
              items={list.items}
              allItems={list.allItems}
            ></CatalogListCategories>
          </TabsContent>
          <TabsContent value="items">
            <CatalogListItems
              catalog={list.catalog}
              merchant={list.merchant}
              items={list.items}
              modifierGroups={list.modifierGroups}
              categories={list.categories}
            ></CatalogListItems>
          </TabsContent>
          <TabsContent value="modifierGroups">
            <CatalogListModifierGroups
              catalog={list.catalog}
              merchant={list.merchant}
              modifierGroups={list.modifierGroups}
              items={list.items}
              modifiers={list.modifiers}
            ></CatalogListModifierGroups>
          </TabsContent>
          <TabsContent value="modifiers">
            <CatalogListModifiers
              catalog={list.catalog}
              merchant={list.merchant}
              allModifiers={list.modifiers}
              allModifierGroups={list.modifierGroups}
            ></CatalogListModifiers>
          </TabsContent>
          <TabsContent value="schedule">
            <CatalogListSchedule
              catalog={list.catalog}
              merchant={list.merchant}
              schedule={list.schedule}
            ></CatalogListSchedule>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
