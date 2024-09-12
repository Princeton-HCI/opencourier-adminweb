export interface DisplayModifierGroup {
  id: string
  type: 'group'
  depth: number
  name: string
}
export interface DisplayModifier {
  id: string
  type: 'modifier'
  depth: number
  name: string
  price: number
  quantity: number
}

export type DisplayModifierOrGroup = DisplayModifier | DisplayModifierGroup

type Modifier = { id: string; name: string; price: number; quantity: number; childModifierGroups?: ModifierGroup[] }
type ModifierGroup = { catalogModifierGroupId: string; name: string; modifiers: Modifier[] }

export const flattenModifiers = (modifierGroup: ModifierGroup, depth: number): DisplayModifierOrGroup[] => {
  const result: DisplayModifierOrGroup[] = []
  result.push({
    type: 'group',
    id: modifierGroup.catalogModifierGroupId,
    name: modifierGroup.name,
    depth,
  })
  result.push(
    ...modifierGroup.modifiers
      .map((modifier) => {
        const modifierResult: DisplayModifierOrGroup[] = []
        modifierResult.push({
          depth,
          id: modifier.id,
          type: 'modifier',
          name: modifier.name,
          price: modifier.price,
          quantity: modifier.quantity,
        })
        if (modifier.childModifierGroups?.length) {
          modifierResult.push(
            ...modifier.childModifierGroups
              .map((childModifierGroup) => flattenModifiers(childModifierGroup, depth + 1))
              .flat()
          )
        }
        return modifierResult
      })
      .flat()
  )
  return result
}
