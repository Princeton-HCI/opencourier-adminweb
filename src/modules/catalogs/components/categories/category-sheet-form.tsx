import { useCreateCatalogCategoryMutation, useUpdateCatalogCategoryMutation } from '@/api/catalogApi'
import { useCatalogCategoryForm } from '@/modules/catalogs/hook/form/useCatalogCategoryForm'
import { CatalogCategoryFormValues } from '@/modules/catalogs/types'
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
import { CatalogAdminDto, CatalogCategoryAdminDto } from '../../../backend-admin-sdk'
import { omit } from 'lodash'
import React, { useEffect, useState } from 'react'

interface CategorySheetFormProps extends React.HTMLAttributes<HTMLDivElement> {
  catalog: CatalogAdminDto
  category?: CatalogCategoryAdminDto
  submitted?: (newCategory: CatalogCategoryAdminDto) => void
}

export function CategorySheetForm({ catalog, category, submitted }: CategorySheetFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [createCategoryMutation, { isLoading: isLoadingCreate }] = useCreateCatalogCategoryMutation()
  const [updateCategoryMutation, { isLoading: isLoadingUpdate }] = useUpdateCatalogCategoryMutation()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(isLoadingCreate || isLoadingUpdate)
  }, [isLoadingCreate, isLoadingUpdate])

  const form = useCatalogCategoryForm()

  useEffect(() => {
    form.reset(category)
  }, [category])

  const handleFormSubmit = async (values: CatalogCategoryFormValues) => {
    try {
      if (category) {
        const result = await updateCategoryMutation({
          id: category.id,
          data: {
            ...values,
          },
        }).unwrap()
        submitted && submitted(result)
      } else {
        const result = await createCategoryMutation({
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
        description: 'Failed to submit category',
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {category ? (
            <SheetHeader>
              <SheetTitle>Catalog Category</SheetTitle>
              <SheetDescription>ID: {category.id}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New catalog category</SheetTitle>
            </SheetHeader>
          )}
          <div className="space-y-2 overflow-y-scroll scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Category Overview</CardTitle>
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
