import {
  CatalogModifierGroupAdminDto,
  CatalogModifierGroupComputedAdminDto,
  CatalogItemModifierAdminDto,
  CatalogCategoryComputedAdminDto,
  CatalogItemAdminDto,
  CatalogItemComputedAdminDto,
  CatalogItemUpdateAdminInputAvailabilityEnum,
  CatalogItemModifierUpdateAdminInputAvailabilityEnum,
  CatalogAdminDtoFulfillmentModesEnum,
} from '../../../backend-admin-sdk'

export interface CatalogFormValues {
  name: string
  description: string
  enabled: boolean
  fulfillmentModes?: CatalogAdminDtoFulfillmentModesEnum[]
}

export interface CatalogCategoryFormValues {
  name: string
  description: string
}

export interface CatalogItemFormValues {
  name: string
  description: string
  price: number
  availability: CatalogItemUpdateAdminInputAvailabilityEnum
}

export interface ModifierGroupFormValues {
  name: string
  description: string
  maximumSelection: number
  minimumSelection: number
  maximumPerModifier: number
}

export interface ItemModifierFormValues {
  name: string
  description: string
  price: number
  availability: CatalogItemModifierUpdateAdminInputAvailabilityEnum
}

export interface ItemCreateFormValues {
  name: string
  category: string
  description: string
  price: number
  availability: CatalogItemUpdateAdminInputAvailabilityEnum
}

export interface ItemWithModifierGroup {
  item: CatalogItemComputedAdminDto
  modifierGroups: CatalogModifierGroupAdminDto[]
}

export interface ModifiersWithGroup {
  group: CatalogModifierGroupComputedAdminDto
  modifiers: CatalogItemModifierAdminDto[]
}

export interface CategoryWithItems {
  category: CatalogCategoryComputedAdminDto
  items: CatalogItemAdminDto[]
}

export interface CatalogScheduleFormValues {
  enabled: boolean
}
