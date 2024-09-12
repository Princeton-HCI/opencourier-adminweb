import {
  Form,
  FormField,
  FormItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../admin-web-components'
import { MerchantOrganizationAdminDto } from '../../../backend-admin-sdk'
import omit from 'lodash/omit'
import { UseFormReturn } from 'react-hook-form'
import { MerchantsTableFilters } from '../hook/form/useMerchantsTableFiltersForm'

type MerchantsTableFiltersProps = {
  disabled: boolean
  form: UseFormReturn<MerchantsTableFilters>
  merchantOrganizations: MerchantOrganizationAdminDto[]
}

export function MerchantsListFilters({ disabled, form, merchantOrganizations }: MerchantsTableFiltersProps) {
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="organization"
        render={({ field }) => (
          <FormItem className="grid gap-1 max-w-xs">
            <Select {...omit(field, ['onChange', 'onBlur', 'ref'])} onValueChange={field.onChange} disabled={disabled}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-organizations" value={'all'}>
                  All organizations
                </SelectItem>
                {merchantOrganizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </Form>
  )
}
