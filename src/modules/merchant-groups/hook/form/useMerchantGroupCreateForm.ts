import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MerchantGroupFormValues } from '@/modules/merchant-groups/types'

const createFormSchema = z.object({
  logo: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  admin: z.object({
    email: z.string().email({ message: 'Invalid email address' }).min(1, { message: 'Admin email is required' }),
    password: z.string().min(4, { message: 'Password must be at least 4 characters' }),
  }),
})

export const useMerchantGroupCreateForm = () => {
  return useForm<MerchantGroupFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(createFormSchema),
  })
}
