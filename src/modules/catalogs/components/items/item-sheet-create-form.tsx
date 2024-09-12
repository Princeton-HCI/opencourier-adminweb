import { useCreateCatalogItemMutation } from '@/api/catalogApi'
import { ItemCreateFormValues } from '@/modules/catalogs/types'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useToast,
} from '../../../../admin-web-components'
import {
  CatalogCategoryAdminDto,
  CatalogItemAdminDto,
  CatalogItemCreateAdminInputAvailabilityEnum,
} from '../../../../backend-admin-sdk'
import { cn } from '../../../../ui-shared-utils'
import omit from 'lodash/omit'
import { Check, ChevronsUpDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useItemCreateForm } from '../../hook/form/useItemCreateForm'

interface ItemSheetFormProps extends React.HTMLAttributes<HTMLDivElement> {
  categories: CatalogCategoryAdminDto[]
  catalogId: string
  submitted?: (newItem: CatalogItemAdminDto) => void
}

export function ItemSheetCreateForm({ catalogId, categories, submitted }: ItemSheetFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [createItemMutation, { isLoading: isLoadingCreate }] = useCreateCatalogItemMutation()
  const { toast } = useToast()
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    setIsLoading(isLoadingCreate)
  }, [isLoadingCreate])

  const form = useItemCreateForm()

  const handleCategorySelect = (categoryId: string) => {
    form.setValue('category', categoryId)
    setPopoverOpen(false)
  }

  const handleFormSubmit = async (values: ItemCreateFormValues) => {
    try {
      const result = await createItemMutation({
        id: catalogId,
        data: {
          ...values,
          categoryId: values.category,
          price: Math.round(values.price * 100),
        },
      }).unwrap()
      submitted && submitted(result)
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
          <SheetHeader>
            <SheetTitle>New catalog item</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Item Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {!isLoading ? (
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="grid gap-1">
                        <FormLabel>Initial Category</FormLabel>
                        <Popover open={popoverOpen}>
                          <PopoverTrigger asChild onClick={() => setPopoverOpen(true)}>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                              {field.value
                                ? categories.find((cat) => cat.id === field.value)?.name
                                : 'Select a category'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Search a category" />
                              <CommandList>
                                <CommandGroup>
                                  {categories.map((category) => (
                                    <CommandItem
                                      key={category.id}
                                      value={`${category.id} ${category.name}`}
                                      onSelect={() => handleCategorySelect(category.id)}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          category.id === field.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                      />{' '}
                                      {category.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
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
                          <SelectItem value={CatalogItemCreateAdminInputAvailabilityEnum.Available}>
                            Available
                          </SelectItem>
                          <SelectItem value={CatalogItemCreateAdminInputAvailabilityEnum.UnavailableToday}>
                            Unavailable today
                          </SelectItem>
                          <SelectItem value={CatalogItemCreateAdminInputAvailabilityEnum.Unavailable}>
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
