import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CatalogFormValues } from '../../types'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string(),
  enabled: z.boolean().or(z.undefined()),
  fulfillmentModes: z.array(z.string()).min(1, { message: 'Fulfillment Modes is required' }),
})

export const useCatalogForm = (args?: { defaultValues?: CatalogFormValues }) => {
  return useForm<CatalogFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: args?.defaultValues ?? {
      name: '',
      description: '',
      enabled: false,
    },
  })
}
