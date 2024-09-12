import { useCreateModifierGroupMutation, useUpdateModifierGroupMutation } from '@/api/catalogApi'
import { useModifierGroupForm } from '@/modules/catalogs/hook/form/useModifierGroupForm'
import { ModifierGroupFormValues } from '@/modules/catalogs/types'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useToast,
} from '../../../admin-web-components'
import { CatalogAdminDto, CatalogModifierGroupAdminDto } from '../../../backend-admin-sdk'
import { omit } from 'lodash'
import React, { useEffect, useState } from 'react'

interface GroupSheetFormProps extends React.HTMLAttributes<HTMLDivElement> {
  catalog: CatalogAdminDto
  group?: CatalogModifierGroupAdminDto
  submitted?: (newGroup: CatalogModifierGroupAdminDto) => void
}

export function GroupSheetForm({ catalog, group, submitted }: GroupSheetFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [createGroupMutation, { isLoading: isLoadingCreate }] = useCreateModifierGroupMutation()
  const [updateGroupMutation, { isLoading: isLoadingUpdate }] = useUpdateModifierGroupMutation()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(isLoadingCreate || isLoadingUpdate)
  }, [isLoadingCreate, isLoadingUpdate])

  const form = useModifierGroupForm()

  useEffect(() => {
    form.reset(group)
  }, [group])

  const handleFormSubmit = async (values: ModifierGroupFormValues) => {
    try {
      if (group) {
        const result = await updateGroupMutation({
          id: group.id,
          data: {
            ...values,
          },
        }).unwrap()
        submitted && submitted(result)
      } else {
        const result = await createGroupMutation({
          id: catalog.id,
          data: {
            ...values,
          },
        }).unwrap()
        submitted && submitted(result)
      }
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit group',
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {group ? (
            <SheetHeader>
              <SheetTitle>Modifier Group</SheetTitle>
              <SheetDescription>ID: {group.id}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New modifier group</SheetTitle>
            </SheetHeader>
          )}
          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Group Overview</CardTitle>
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
                  name="maximumSelection"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Max Selection</FormLabel>
                      <Input
                        type="number"
                        placeholder="Max Selection"
                        {...form.register('maximumSelection', { valueAsNumber: true })}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                        min={0}
                        max={99}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minimumSelection"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Min Selection</FormLabel>
                      <Input
                        type="number"
                        placeholder="Min Selection"
                        {...form.register('minimumSelection', { valueAsNumber: true })}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                        min={0}
                        max={99}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maximumPerModifier"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Max per Modifier (0 means up to total max)</FormLabel>
                      <Input
                        type="number"
                        placeholder="Max per Modifier"
                        {...form.register('maximumPerModifier', { valueAsNumber: true })}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                        min={0}
                        max={99}
                      />
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
