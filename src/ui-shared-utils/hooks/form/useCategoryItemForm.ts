import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CartModifierGroupCustomerDto } from '@/backend-customer-sdk'
import { CartModifierGroupValue } from '@/shared-types'

const formSchema = z.object({
  comment: z.string(),
  quantity: z.number().positive(),
  modifierGroups: z.any(),
})

export interface ModifierFormValue {
  quantity: number
  childModifierGroups?: ModifierGroupsFormValues
}
export type ModifierGroupsFormValues = Partial<{
  [groupId: string]: Partial<{
    [modifierId: string]: ModifierFormValue
  }>
}>

export interface CategoryItemFormValues {
  comment: string
  quantity: number
  modifierGroups?: ModifierGroupsFormValues | undefined
}

export const getModifierGroupsFormValuesFromCart = (cartModifierGroups: CartModifierGroupCustomerDto[]) => {
  return cartModifierGroups.reduce((acc: ModifierGroupsFormValues, group) => {
    acc[group.catalogModifierGroupId] = group.modifiers.reduce(
      (modifierAcc: { [modifierId: string]: ModifierFormValue }, modifier) => {
        modifierAcc[modifier.catalogModifierId] = {
          quantity: modifier.quantity,
          childModifierGroups: modifier.childModifierGroups
            ? getModifierGroupsFormValuesFromCart(modifier.childModifierGroups)
            : ({} as ModifierGroupsFormValues),
        }
        return modifierAcc
      },
      {}
    )
    return acc
  }, {})
}

export const generateModifierGroupsOutputFromFormValues = (modifierGroups: ModifierGroupsFormValues) => {
  return Object.entries(modifierGroups).reduce((acc: CartModifierGroupValue[], [modifierGroupId, groupModifiers]) => {
    const modifiers = Object.entries(groupModifiers ?? {})
      .map(([modifierId, value]) => ({
        modifierId,
        quantity: value?.quantity ?? 0,
        childModifierGroups: value?.childModifierGroups
          ? generateModifierGroupsOutputFromFormValues(value.childModifierGroups)
          : [],
      }))
      .filter((m) => m.quantity > 0)

    if (modifiers.length > 0) {
      acc.push({
        modifierGroupId,
        modifiers,
      })
    }
    return acc
  }, [])
}

export function useCategoryItemForm(defaultValues: CategoryItemFormValues) {
  return useForm<CategoryItemFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues,
  })
}
