import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CatalogCategoryFormValues } from '../../types'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string(),
})

export const useCatalogCategoryForm = () => {
  return useForm<CatalogCategoryFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })
}
