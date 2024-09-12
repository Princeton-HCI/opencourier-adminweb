import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ItemCreateFormValues } from '../../types'
import { CatalogItemCreateAdminInputAvailabilityEnum } from '../../../../backend-admin-sdk'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  category: z.string().min(1, { message: 'Initial category is required' }),
  description: z.string(),
  price: z.number({ invalid_type_error: 'Price must be a number', required_error: 'Price is required' }).min(0),
  availability: z.string().min(1, { message: 'Availability is required' }),
})

export const useItemCreateForm = () => {
  return useForm<ItemCreateFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      price: 0,
      availability: CatalogItemCreateAdminInputAvailabilityEnum.Available,
    },
  })
}
