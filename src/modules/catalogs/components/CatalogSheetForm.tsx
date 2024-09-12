import { useCreateCatalogMutation, useUpdateCatalogMutation } from '@/api/catalogApi'
import { useCatalogForm } from '@/modules/catalogs/hook/form/useCatalogForm'
import { CatalogFormValues } from '@/modules/catalogs/types'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  MultiSelect,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  WithSheetCallbacks,
  useToast,
} from '../../../admin-web-components'
import { CatalogAdminDto, MerchantAdminDto } from '../../../backend-admin-sdk'
import { fulfillmentModes } from '../../../ui-shared-utils'
import { omit } from 'lodash'

export type CatalogSheetFormProps = WithSheetCallbacks<CatalogAdminDto> &
  (
    | { mode: 'create'; merchant: MerchantAdminDto }
    | { mode: 'update'; catalogId: string; defaultValues?: CatalogAdminDto }
  )

export function CatalogSheetForm(props: CatalogSheetFormProps) {
  const [createCatalogMutation, createCatalogMutationState] = useCreateCatalogMutation()
  const [updateCatalogMutation, updateCatalogMutationState] = useUpdateCatalogMutation()
  const { toast } = useToast()

  const form = useCatalogForm({ defaultValues: props.mode === 'update' ? props.defaultValues : undefined })

  const handleFormSubmit = async (values: CatalogFormValues) => {
    try {
      if (props.mode === 'update') {
        await updateCatalogMutation({
          id: props.catalogId,
          data: {
            ...values,
            fulfillmentModes: values.fulfillmentModes ?? [],
          },
        }).unwrap()
      } else {
        await createCatalogMutation({
          data: {
            ...values,
            fulfillmentModes: values.fulfillmentModes ?? [],
            merchantId: props.merchant.id,
          },
        }).unwrap()
      }
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit catalog',
        variant: 'destructive',
      })
    } finally {
      props.onSettled?.()
    }
  }

  const isLoading = createCatalogMutationState.isLoading || updateCatalogMutationState.isLoading
  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {props.mode === 'update' ? (
            <SheetHeader>
              <SheetTitle>Catalog</SheetTitle>
              <SheetDescription>ID: {props.catalogId}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New catalog</SheetTitle>
            </SheetHeader>
          )}
          <div className="grid gap-6 overflow-y-scroll scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Catalog Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Name</FormLabel>
                      <Input
                        type="string"
                        placeholder="Name"
                        {...omit(field, ['value'])}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Description</FormLabel>
                      <Input
                        type="string"
                        placeholder="Description"
                        {...omit(field, ['value'])}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Status</FormLabel>
                      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            {...omit(field, ['onChange', 'onBlur', 'value'])}
                            disabled={field.disabled || isLoading}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is enabled</FormLabel>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fulfillmentModes"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Fulfillment Modes</FormLabel>
                      <MultiSelect {...omit(field, 'ref')} selected={field.value ?? []} options={fulfillmentModes} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <SheetFooter>
            <Button disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  )
}
