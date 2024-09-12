import {
  CatalogItemCustomerDtoInventoryStatusEnum,
  CatalogModifierGroupCustomerDto,
  CatalogCompleteCustomerDto,
  CatalogItemModifierCustomerDto,
} from '@/backend-customer-sdk'

export interface ModifierItem {
  id: string
  name: string
  price?: number
  pointsPrice?: number
  inventoryStatus?: CatalogItemCustomerDtoInventoryStatusEnum
  ordinal?: number
  // Additional fields
  type: 'row' | 'sectionHeader'
  group?: CatalogModifierGroupCustomerDto
  deselectOnNewSelection?: boolean
  isRequired?: boolean
}

export interface CategoryItem {
  id: string
  name: string
  description?: string
  images?: string[]
  inventoryStatus?: CatalogItemCustomerDtoInventoryStatusEnum
  price?: number
  pointsPrice?: number
  ordinal?: number
  // Additional fields
  type: 'row' | 'sectionHeader'
  itemOrdinals?: Record<string, number>
  modifierItems?: ModifierItem[]
  categoryId?: string
  redeemableUsingNoshPoints?: boolean
}

export interface Menu {
  categoryItems: CategoryItem[]
  categoryHeaders: CategoryItem[]
}

function modifierGroupToSectionHeader(modifierGroup: CatalogModifierGroupCustomerDto): ModifierItem {
  return {
    id: modifierGroup.id,
    name: modifierGroup.name,
    group: modifierGroup,
    type: 'sectionHeader',
  }
}

function modifierToRow(
  modifierGroup: CatalogModifierGroupCustomerDto,
  modifier: CatalogItemModifierCustomerDto
): ModifierItem {
  return {
    id: modifier.id,
    name: modifier.name,
    price: modifier.price,
    pointsPrice: modifier.pointsPrice,
    inventoryStatus: modifier.inventoryStatus,
    group: modifierGroup,
    deselectOnNewSelection: isRadioSelection(modifierGroup),
    type: 'row',
    isRequired: isRequired(modifierGroup),
  }
}

export const catalogToFlashListArray = (catalog: CatalogCompleteCustomerDto): Menu => {
  const categoryItems: CategoryItem[] = []
  const categoryHeaders: CategoryItem[] = []

  const existingCategories = new Set()

  catalog.catalogs.forEach((activeCatalog) => {
    const catalogCategories = activeCatalog.categoryIds

    categoryItems.push(
      ...catalogCategories.reduce((categoryAcc: CategoryItem[], categoryId) => {
        if (existingCategories.has(categoryId)) {
          return categoryAcc
        } else {
          existingCategories.add(categoryId)
        }

        const category = catalog.categories[categoryId]
        if (!category) {
          throw Error(`Failed to find category with id ${categoryId} in the catalog`)
        }

        const categoryItemIds = category.itemIds

        const items = categoryItemIds.reduce((itemAcc: CategoryItem[], itemId) => {
          const catalogItem = catalog.items[itemId]
          if (!catalogItem) {
            throw Error(`Failed to find item with id ${itemId} in the catalog`)
          }

          if (catalogItem.inventoryStatus === 'NOT_FOR_SALE') {
            return itemAcc
          }

          const modifierItems = catalogItem.modifierGroupIds.reduce((modifierItemsAcc: ModifierItem[], groupId) => {
            const group = catalog.modifierGroups[groupId]
            if (!group) {
              throw Error(`Failed to find modifier group with id ${groupId} in the catalog`)
            }
            const modifierIds = group.modifierIds

            if (group.maximumSelection == 0 && group.minimumSelection == 0) {
              group.maximumSelection = group.modifierIds.length
            }

            if (group.minimumSelection > group.maximumSelection) {
              group.maximumSelection = group.minimumSelection
            }

            // TODO DRY
            const modifiers = modifierIds.reduce((acc: ModifierItem[], modifierId) => {
              const modifier = catalog.modifiers[modifierId]
              if (!modifier) {
                throw Error(`Failed to find modifier with id ${modifierId} in the catalog`)
              }

              if (modifier.inventoryStatus === 'NOT_FOR_SALE') {
                return acc
              }

              acc.push(modifierToRow(group, modifier))
              return acc
            }, [])

            const modifierHeader: ModifierItem = modifierGroupToSectionHeader(group)

            modifierItemsAcc.push(modifierHeader, ...modifiers)
            return modifierItemsAcc
          }, [])

          itemAcc.push({ ...catalogItem, categoryId: categoryId, type: 'row', modifierItems })
          return itemAcc
        }, [])

        const categoryHeader: CategoryItem = {
          id: categoryId,
          name: category.name,
          type: 'sectionHeader',
          categoryId,
        }
        categoryAcc.push(categoryHeader, ...items)

        return categoryAcc
      }, [])
    )
  })
  categoryHeaders.push(...categoryItems.filter((category) => category.type === 'sectionHeader'))

  return {
    categoryItems: categoryItems,
    categoryHeaders: [{ id: 'all', name: 'All', type: 'sectionHeader' }, ...categoryHeaders],
  }
}

export function modifierGroupToFlashListArray(
  modifierGroupIds: string[],
  completeCatalog: CatalogCompleteCustomerDto
): ModifierItem[] {
  const list: ModifierItem[] = []
  list.push(
    ...modifierGroupIds
      .map((modifierGroupId) => {
        const singleGroupItems: ModifierItem[] = []
        const modifierGroup = completeCatalog.modifierGroups[modifierGroupId]

        if (!modifierGroup) {
          throw new Error(`Modifier group ${modifierGroupId} not found in catalog`)
        }

        // TODO check availability?

        singleGroupItems.push(modifierGroupToSectionHeader(modifierGroup))

        singleGroupItems.push(
          ...modifierGroup.modifierIds
            .map((modifierId) => {
              const modifier = completeCatalog.modifiers[modifierId]
              if (!modifier) {
                throw new Error(`Modifier group ${modifierGroupId} not found in catalog`)
              }
              return modifier
            })
            .map((modifier) => modifierToRow(modifierGroup, modifier))
        )
        return singleGroupItems
      })
      .flat()
  )

  return list
}

export const isRequired = (group: { minimumSelection: number }) => {
  return group.minimumSelection >= 1
}

export const isRadioSelection = (group: { minimumSelection: number; maximumSelection: number }) => {
  return group.minimumSelection === 1 && group.maximumSelection === 1
}

export function isButtonDisabled(
  value: number,
  modifierFormValues: number[],
  group: {
    minimumSelection: number
    maximumSelection: number
    maximumPerModifier: number
  }
) {
  const totalSelected = modifierFormValues.reduce((acc, num) => acc + num, 0)

  return isRadioSelection(group)
    ? totalSelected === group.maximumSelection && !value && group.minimumSelection == 0
    : totalSelected === group.maximumSelection && !value
}

export function isIncrementDisabled(
  value: number,
  modifierFormValues: number[],
  group: {
    minimumSelection: number
    maximumSelection: number
    maximumPerModifier: number
  }
) {
  const totalSelected = modifierFormValues.reduce((acc, num) => acc + num, 0)
  const maximumSelection = group.maximumSelection
  const maximumPerModifier = group.maximumPerModifier

  const isAtPerModifierMax = maximumPerModifier !== 0 && value >= maximumPerModifier
  const isAtTotalGroupMaximum = maximumSelection !== 0 && totalSelected >= maximumSelection
  return isAtPerModifierMax || isAtTotalGroupMaximum
}

interface MaxMinMessage {
  key: string
  translation: string
  params?: Record<string, any>
}

/**
 * Generates a description message for the modifier header based on the minimum, maximum, and maximum per modifier selection settings of a modifier group.
 * This method considers settings that may be synchronized from the menu integration or manually configured on the admin-web.
 *
 * The description message helps provide clarity to users about the modifier group's constraints and options, aiding in decision-making during menu customization or order placement.
 */
export function getMaxMinMessage(group: CatalogModifierGroupCustomerDto | undefined): MaxMinMessage {
  if (group?.minimumSelection === 0 && group.maximumSelection === 1) {
    return {
      key: 'OPTIONAL_SELECT_1',
      translation: 'Optional. Select 1',
    }
  } else if (
    group?.minimumSelection &&
    group.minimumSelection > 1 &&
    group.maximumSelection &&
    group.maximumSelection > 1
  ) {
    if (group.minimumSelection == group.maximumSelection) {
      return {
        key: 'REQUIRED_SELECT_AT_LEAST_UP_TO',
        translation: `Required. Select ${group.minimumSelection}`,
        params: {
          minimumSelection: group.minimumSelection,
          maximumSelection: group.maximumSelection,
        },
      }
    }
    return {
      key: 'REQUIRED_SELECT_AT_LEAST_UP_TO',
      translation: `Required. Select at least ${group.minimumSelection} and up to ${group.maximumSelection}`,
      params: {
        minimumSelection: group.minimumSelection,
        maximumSelection: group.maximumSelection,
      },
    }
  } else if (group?.minimumSelection === 1 && group.maximumSelection && group.maximumSelection > 1) {
    return {
      key: 'REQUIRED_SELECT_UP_TO',
      translation: `Required. Select up to ${group.maximumSelection}`,
      params: {
        maximumSelection: group.maximumSelection,
      },
    }
  } else if (group?.minimumSelection === 1 && group.maximumSelection === 1) {
    return {
      key: 'REQUIRED_SELECT_1',
      translation: 'Required. Select 1',
    }
  } else if (group?.minimumSelection === 0 && group.maximumSelection && group.maximumSelection > 1) {
    return {
      key: 'OPTIONAL_SELECT_UP_TO',
      translation: `Optional. Select up to ${group.maximumSelection}`,
      params: {
        maximumSelection: group.maximumSelection,
      },
    }
  }
  return {
    key: 'SELECT_OPTIONS',
    translation: 'Select options',
  }
}
