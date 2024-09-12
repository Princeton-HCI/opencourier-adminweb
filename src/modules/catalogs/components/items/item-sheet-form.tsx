import { useCreateCatalogItemMutation, useUpdateCatalogItemMutation } from '@/api/catalogApi'
import { useCatalogCategoryForm } from '@/modules/catalogs/hook/form/useCatalogItemForm'
import { CatalogItemFormValues } from '@/modules/catalogs/types'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useToast,
} from '../../../admin-web-components'
import {
  CatalogAdminDto,
  CatalogItemAdminDto,
  CatalogItemUpdateAdminInputAvailabilityEnum,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import dayjs from 'dayjs'
import { omit } from 'lodash'
import React, { useEffect } from 'react'

interface ItemSheetFormProps extends React.HTMLAttributes<HTMLDivElement> {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  item?: CatalogItemAdminDto
  submitted?: (newItem: CatalogItemAdminDto) => void
}

export function ItemSheetForm({ catalog, merchant, item, submitted }: ItemSheetFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [createItemMutation, { isLoading: isLoadingCreate }] = useCreateCatalogItemMutation()
  const [updateItemMutation, { isLoading: isLoadingUpdate }] = useUpdateCatalogItemMutation()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(isLoadingCreate || isLoadingUpdate)
  }, [isLoadingCreate, isLoadingUpdate])

  const form = useCatalogCategoryForm()

  useEffect(() => {
    let availability: CatalogItemUpdateAdminInputAvailabilityEnum =
      CatalogItemUpdateAdminInputAvailabilityEnum.Available

    if (item?.suspendedUntil) {
      const tomorrow = dayjs().tz(merchant.timezone).add(1, 'day').hour(0).minute(0).second(0)

      if (tomorrow.isAfter(item.suspendedUntil)) {
        availability = CatalogItemUpdateAdminInputAvailabilityEnum.UnavailableToday
      } else {
        availability = CatalogItemUpdateAdminInputAvailabilityEnum.Unavailable
      }
    }

    form.reset({ ...item, price: (item?.price || 0) / 100, availability })
  }, [item])

  const handleFormSubmit = async (values: CatalogItemFormValues) => {
    try {
      if (item) {
        const result = await updateItemMutation({
          id: item.id,
          data: {
            ...values,
            price: Math.round(values.price * 100),
          },
        }).unwrap()
        submitted && submitted(result)
      } else {
        const result = await createItemMutation({
          id: catalog.id,
          data: {
            ...values,
            price: Math.round(values.price * 100),
          },
        }).unwrap()
        submitted && submitted(result)
      }
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit item',
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {item ? (
            <SheetHeader>
              <SheetTitle>Catalog Item</SheetTitle>
              <SheetDescription>ID: {item.id}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New catalog item</SheetTitle>
            </SheetHeader>
          )}
          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Item Overview</CardTitle>
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
                  name="price"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Price</FormLabel>
                      <Input
                        type="number"
                        placeholder="Price"
                        {...form.register(field.name, { valueAsNumber: true })}
                        {...omit(field, ['onBlur', 'ref', 'value'])}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                        min={0}
                        step={0.01}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Availability</FormLabel>
                      <Select {...omit(field, ['onChange', 'onBlur', 'ref'])} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CatalogItemUpdateAdminInputAvailabilityEnum.Available}>
                            Available
                          </SelectItem>
                          <SelectItem value={CatalogItemUpdateAdminInputAvailabilityEnum.UnavailableToday}>
                            Unavailable today
                          </SelectItem>
                          <SelectItem value={CatalogItemUpdateAdminInputAvailabilityEnum.Unavailable}>
                            Unavailable indefinitely
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
