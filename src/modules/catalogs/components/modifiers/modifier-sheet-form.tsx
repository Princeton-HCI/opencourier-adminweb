import { useCreateItemModifierMutation, useUpdateItemModifierMutation } from '@/api/catalogApi'
import { useItemModifierForm } from '@/modules/catalogs/hook/form/useItemModifierForm'
import { ItemModifierFormValues } from '@/modules/catalogs/types'
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
  CatalogItemModifierAdminDto,
  CatalogItemUpdateAdminInputAvailabilityEnum,
  MerchantAdminDto,
} from '../../../backend-admin-sdk'
import dayjs from 'dayjs'
import { omit } from 'lodash'
import React, { useEffect } from 'react'

interface ModifierSheetFormProps extends React.HTMLAttributes<HTMLDivElement> {
  catalog: CatalogAdminDto
  merchant: MerchantAdminDto
  modifier?: CatalogItemModifierAdminDto
  submitted?: (newModifier: CatalogItemModifierAdminDto) => void
}

export function ModifierSheetForm({ catalog, merchant, modifier, submitted }: ModifierSheetFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [createItemMutation, { isLoading: isLoadingCreate }] = useCreateItemModifierMutation()
  const [updateItemMutation, { isLoading: isLoadingUpdate }] = useUpdateItemModifierMutation()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(isLoadingCreate || isLoadingUpdate)
  }, [isLoadingCreate, isLoadingUpdate])

  const form = useItemModifierForm()

  useEffect(() => {
    let availability: CatalogItemUpdateAdminInputAvailabilityEnum =
      CatalogItemUpdateAdminInputAvailabilityEnum.Available

    if (modifier?.suspendedUntil) {
      const tomorrow = dayjs().tz(merchant.timezone).add(1, 'day').hour(0).minute(0).second(0)

      if (tomorrow.isAfter(modifier.suspendedUntil)) {
        availability = CatalogItemUpdateAdminInputAvailabilityEnum.UnavailableToday
      } else {
        availability = CatalogItemUpdateAdminInputAvailabilityEnum.Unavailable
      }
    }

    form.reset({ ...modifier, price: (modifier?.price || 0) / 100, availability })
  }, [modifier])

  const handleFormSubmit = async (values: ItemModifierFormValues) => {
    try {
      if (modifier) {
        const result = await updateItemMutation({
          id: modifier.id,
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
        description: 'Failed to submit modifier',
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {modifier ? (
            <SheetHeader>
              <SheetTitle>Item Modifier</SheetTitle>
              <SheetDescription>ID: {modifier.id}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New modifier</SheetTitle>
            </SheetHeader>
          )}
          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Modifier Overview</CardTitle>
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
