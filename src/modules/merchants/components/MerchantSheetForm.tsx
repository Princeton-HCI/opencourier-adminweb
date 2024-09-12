import { useCreateMerchantMutation, useUpdateMerchantMutation } from '@/api/merchantApi'
import { PlacesAutocomplete } from '@/components/places-autocomplete'
import { TimezoneCombobox } from '@/components/timezone-combobox'
import { MerchantFormValues, useMerchantForm } from '@/modules/merchants/hook/form/useMerchantForm'
import { Library } from '@googlemaps/js-api-loader'
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
  MultiSelect,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  WithSheetCallbacks,
  useToast,
  Checkbox,
} from '../../../admin-web-components'
import {
  MerchantAdminDto,
  MerchantCreateAdminInput,
  MerchantCreateAdminInputMenuProviderEnum,
  MerchantCreateAdminInputAvailabilityEnum,
  MerchantUpdateAdminInput,
} from '../../../backend-admin-sdk'
import { cuisineTypes, parseInputNumber, transformAddress, createSlug } from '../../../ui-shared-utils'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { debounce, omit } from 'lodash'
import { ChevronsUpDown } from 'lucide-react'
import React, { useCallback, useEffect } from 'react'
import dayjs from 'dayjs'

export type MerchantSheetFormProps = WithSheetCallbacks<MerchantAdminDto> &
  (
    | { mode: 'create'; organizationId: string }
    | { mode: 'update'; merchantId: string; defaultValues?: MerchantAdminDto }
  )

// Must be outside of component to avoid Performance warning
const libraries: Library[] = ['places']

export function MerchantSheetForm(props: MerchantSheetFormProps) {
  const [createMerchantMutation, { isLoading: createLoading }] = useCreateMerchantMutation()
  const [updateMerchantMutation, { isLoading: updateLoading }] = useUpdateMerchantMutation()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(createLoading || updateLoading)
  }, [createLoading, updateLoading])

  const getAvailabilityFromInactiveUntil = (inactiveUntil: string | null | undefined) => {
    if (inactiveUntil === null) {
      return MerchantCreateAdminInputAvailabilityEnum.Available
    }
    if (inactiveUntil) {
      if (dayjs().add(1, 'day').isAfter(inactiveUntil)) {
        return MerchantCreateAdminInputAvailabilityEnum.UnavailableToday
      }
      return MerchantCreateAdminInputAvailabilityEnum.Unavailable
    }
  }

  const form = useMerchantForm({
    defaultValues:
      props.mode === 'update'
        ? {
            ...props.defaultValues,
            email: props.defaultValues?.email ?? '',
            availability: getAvailabilityFromInactiveUntil(props.defaultValues?.inactiveUntil),
          }
        : undefined,
  })

  const setSlug = useCallback(
    debounce((newName) => {
      newName ? form.setValue('slug', createSlug(newName)) : ''
    }, 500),
    []
  )

  const [name] = form.watch(['name'])
  useEffect(() => {
    setSlug(name)
  }, [name])

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries,
  })

  const menuProvider = form.watch('menuProvider')
  const requiresIntegrationId = menuProvider === MerchantCreateAdminInputMenuProviderEnum.Chowly

  const handleFormSubmit = async (values: MerchantFormValues) => {
    try {
      if (props.mode === 'create') {
        await createMerchantMutation({
          organizationId: props.organizationId,
          data: {
            ...values,
          } as MerchantCreateAdminInput,
        }).unwrap()
        props.onSettled?.()
      } else {
        await updateMerchantMutation({
          id: props.merchantId,
          data: {
            ...values,
          } as MerchantUpdateAdminInput,
        }).unwrap()
        props.onSettled?.()
      }
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit merchant',
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {props.mode === 'create' ? (
            <SheetHeader>
              <SheetTitle>New merchant</SheetTitle>
            </SheetHeader>
          ) : null}
          {props.mode === 'update' ? (
            <SheetHeader>
              <SheetTitle>Merchant</SheetTitle>
              <SheetDescription>ID: {props.merchantId}</SheetDescription>
            </SheetHeader>
          ) : null}

          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Overview</CardTitle>
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Slug</FormLabel>
                      <Input
                        type="string"
                        placeholder="Slug"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>E-mail</FormLabel>
                      <Input
                        type="email"
                        placeholder="E-mail"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Phone</FormLabel>
                      <Input
                        type="string"
                        placeholder="Phone"
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
                  name="timezone"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Timezone</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                              {field.value}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <TimezoneCombobox
                            defaultValue={field.value}
                            setSelected={(selected) => {
                              form.setValue('timezone', selected, { shouldValidate: true })
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {isLoaded ? (
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={() => (
                      <FormItem className="grid gap-1">
                        <FormLabel>Change address</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" role="combobox" className="w-full justify-between">
                                Search an address
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <PlacesAutocomplete
                              setSelected={(selected) => {
                                if (typeof selected === 'string') {
                                  return
                                }
                                const transformed = transformAddress(selected)
                                if (transformed) {
                                  form.setValue('addressLine1', transformed.addressLine1, { shouldValidate: true })
                                  form.setValue('locality', transformed.locality, { shouldValidate: true })
                                  form.setValue(
                                    'administrativeDistrictLevel1',
                                    transformed.administrativeDistrictLevel1,
                                    {
                                      shouldValidate: true,
                                    }
                                  )
                                  form.setValue('postalCode', transformed.postalCode, { shouldValidate: true })
                                  form.setValue('country', transformed.country, { shouldValidate: true })
                                  form.setValue('latitude', transformed.latitude, { shouldValidate: true })
                                  form.setValue('longitude', transformed.longitude, { shouldValidate: true })
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Address Line 1</FormLabel>
                      <Input
                        type="string"
                        placeholder="Address Line 1"
                        style={{ backgroundColor: '#f2f2f2' }}
                        {...omit(field, ['value'])}
                        defaultValue={field.value}
                        readOnly={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Address Line 2</FormLabel>
                      <Input
                        type="string"
                        placeholder="Address Line 2"
                        {...omit(field, ['value'])}
                        defaultValue={field.value ? field.value : undefined}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locality"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Locality</FormLabel>
                      <Input
                        type="string"
                        placeholder="Locality"
                        style={{ backgroundColor: '#f2f2f2' }}
                        {...omit(field, ['value'])}
                        defaultValue={field.value}
                        readOnly={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="administrativeDistrictLevel1"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Administrative District Level 1</FormLabel>
                      <Input
                        type="string"
                        placeholder="Administrative District Level 1"
                        style={{ backgroundColor: '#f2f2f2' }}
                        {...omit(field, ['value'])}
                        defaultValue={field.value}
                        readOnly={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Postal Code</FormLabel>
                      <Input
                        type="string"
                        placeholder="Postal Code"
                        style={{ backgroundColor: '#f2f2f2' }}
                        {...omit(field, ['value'])}
                        defaultValue={field.value}
                        readOnly={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Country</FormLabel>
                      <Input
                        type="text"
                        placeholder="Country"
                        style={{ backgroundColor: '#f2f2f2' }}
                        {...omit(field, ['value'])}
                        defaultValue={field.value}
                        readOnly={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Unused for now */}
                {/* <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Latitude</FormLabel>
                      <Input
                        type="number"
                        placeholder="Latitude"
                        style={{ backgroundColor: '#f2f2f2' }}
                        {...omit(field, ['value'])}
                        defaultValue={field.value}
                        readOnly={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Longitude</FormLabel>
                      <Input
                        type="number"
                        placeholder="Longitude"
                        style={{ backgroundColor: '#f2f2f2' }}
                        {...omit(field, ['value'])}
                        defaultValue={field.value}
                        readOnly={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: 250 }}
                    center={{ lat: form.watch('latitude'), lng: form.watch('longitude') }}
                    zoom={14}
                    options={{
                      disableDefaultUI: true,
                      gestureHandling: 'none',
                    }}
                  >
                    <Marker position={{ lat: form.watch('latitude'), lng: form.watch('longitude') }}></Marker>
                  </GoogleMap>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Delivery</CardTitle>
              </CardHeader>
              {/* Unused for now */}
              {/* <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="deliveryRadiusMiles"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Delivery Radius (miles)</FormLabel>
                      <Input
                        type="number"
                        placeholder="Delivery Radius (miles)"
                        {...omit(field, ['value'])}
                        onChange={(e) => field.onChange(parseInputNumber(e.target.value))}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent> */}
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fees & Taxes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="deliveryCommissionRate"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Delivery Commission (percentage as a fraction, for example 0.15)</FormLabel>
                      <Input
                        type="number"
                        placeholder="Delivery Commission"
                        {...omit(field, ['value'])}
                        onChange={(e) => field.onChange(parseInputNumber(e.target.value))}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pickupCommissionRate"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Pickup Commission (percentage as a fraction, for example 0.075)</FormLabel>
                      <Input
                        type="number"
                        placeholder="Pickup Commission"
                        {...omit(field, ['value'])}
                        onChange={(e) => field.onChange(parseInputNumber(e.target.value))}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Unused for now */}
                {/* <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Tax (percentage)</FormLabel>
                      <Input
                        type="number"
                        placeholder="Tax"
                        {...omit(field, ['value'])}
                        onChange={(e) => field.onChange(parseInputNumber(e.target.value))}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Catalog</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="exclusive"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Exclusive</FormLabel>
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
                          <FormLabel>Is Exclusive</FormLabel>
                        </div>
                        <FormMessage />
                      </div>
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
                          <SelectItem value={MerchantCreateAdminInputAvailabilityEnum.Available}>Available</SelectItem>
                          <SelectItem value={MerchantCreateAdminInputAvailabilityEnum.UnavailableToday}>
                            Unavailable Today
                          </SelectItem>
                          <SelectItem value={MerchantCreateAdminInputAvailabilityEnum.Unavailable}>
                            Unavailable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="menuProvider"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Menu Provider</FormLabel>
                      <Select {...omit(field, ['onChange', 'onBlur', 'ref'])} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Menu Provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MerchantCreateAdminInputMenuProviderEnum.Chowly}>Chowly</SelectItem>
                          <SelectItem value={MerchantCreateAdminInputMenuProviderEnum.Checkmate}>Checkmate</SelectItem>
                          <SelectItem value={MerchantCreateAdminInputMenuProviderEnum.Nosh}>NOSH</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {requiresIntegrationId && (
                  <FormField
                    control={form.control}
                    name="posIntegrationId"
                    render={({ field }) => (
                      <FormItem className="grid gap-1">
                        <FormLabel>POS Integration ID</FormLabel>
                        <Input
                          type="string"
                          placeholder="POS Integration ID"
                          {...omit(field, ['value'])}
                          defaultValue={field.value}
                          disabled={field.disabled || isLoading}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="cuisineTypes"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Cuisine Types</FormLabel>
                      <MultiSelect {...omit(field, 'ref')} selected={field.value} options={[...cuisineTypes]} />
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
