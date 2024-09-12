import { MerchantGroupFormValues } from '@/modules/merchant-groups/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { DefaultValues, useForm } from 'react-hook-form'
import { z } from 'zod'

const updateFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
})

export const useMerchantGroupUpdateForm = (args: { defaultValues?: DefaultValues<MerchantGroupFormValues> }) => {
  return useForm<MerchantGroupFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(updateFormSchema),
    defaultValues: args.defaultValues,
  })
}
