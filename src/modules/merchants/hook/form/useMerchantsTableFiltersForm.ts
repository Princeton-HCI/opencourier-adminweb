import { DefaultValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  // search: z.string(), // TODO: Add search functionality to merchants table.
  organization: z.string(),
})

export type MerchantsTableFilters = z.infer<typeof formSchema>
export const useMerchantsTableFiltersForm = (args: { defaultValues?: DefaultValues<MerchantsTableFilters> }) => {
  return useForm<MerchantsTableFilters>({
    resolver: zodResolver(formSchema),
    defaultValues: args.defaultValues,
  })
}
