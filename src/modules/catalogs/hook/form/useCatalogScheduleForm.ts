import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CatalogScheduleFormValues } from '../../types'

const formSchema = z.object({
  enabled: z.boolean(),
})

export const useCatalogScheduleForm = () => {
  return useForm<CatalogScheduleFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: false,
    },
  })
}
