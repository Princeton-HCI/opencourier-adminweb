import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModifierGroupFormValues } from '../../types'

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z.string(),
    maximumSelection: z.number().min(0).max(99),
    minimumSelection: z.number().min(0).max(99),
    maximumPerModifier: z.number().min(0).max(99),
  })
  .refine((schema) => schema.minimumSelection <= schema.maximumSelection, {
    message: 'Max selection must be equal or more than min selection',
    path: ['maximumSelection'],
  })
  .refine((schema) => schema.maximumPerModifier <= schema.maximumSelection, {
    message: 'Max selection must be equal or more than max per modifier',
    path: ['maximumSelection'],
  })

export const useModifierGroupForm = () => {
  return useForm<ModifierGroupFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      maximumSelection: 0,
      minimumSelection: 0,
      maximumPerModifier: 1,
    },
  })
}
