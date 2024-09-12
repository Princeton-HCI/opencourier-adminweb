import {
  useCreateMerchantOrganizationMutation,
  useUpdateMerchantOrganizationMutation,
  useUploadOrganizationLogoMutation,
} from '@/api/merchantApi'
import { useMerchantOrganizationForm } from '@/modules/merchant-organizations/hook/form/useMerchantOrganizationForm'
import { MerchantOrganizationFormValues } from '@/modules/merchant-organizations/types'
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
  ImageUploader,
  Input,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useToast,
} from '../../../admin-web-components'
import { MerchantOrganizationAdminDto } from '../../../backend-admin-sdk'
import { omit } from 'lodash'
import React, { useEffect, useState } from 'react'
interface OrganizationSheetForm {
  groupId: string
  organization?: MerchantOrganizationAdminDto
  submitted?: (newOrganization: MerchantOrganizationAdminDto) => void
}

// TODO: Design organization update flow, with the new layout (organization a merchants filter) organizations no longer have a CRUD.
export function OrganizationSheetForm({ groupId, organization, submitted }: OrganizationSheetForm) {
  const [createOrganizationMutation, { isLoading: createLoading }] = useCreateMerchantOrganizationMutation()
  const [updateOrganizationMutation, { isLoading: updateLoading }] = useUpdateMerchantOrganizationMutation()
  const [uploadOrganizationLogoMutation] = useUploadOrganizationLogoMutation()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(createLoading || updateLoading)
  }, [createLoading, updateLoading])

  const form = useMerchantOrganizationForm()
  const [logo, setLogo] = useState<Blob | null>(null)

  useEffect(() => {
    form.reset(organization as MerchantOrganizationFormValues)
  }, [organization])

  const handleFormSubmit = async (values: MerchantOrganizationFormValues) => {
    try {
      if (organization) {
        const createResult = await updateOrganizationMutation({
          id: organization.id,
          data: {
            ...values,
          },
        }).unwrap()
        if (logo) {
          const logoResult = await uploadOrganizationLogoMutation({
            id: createResult.id,
            file: logo,
          }).unwrap()
          submitted && submitted(logoResult)
        } else {
          submitted && submitted(createResult)
        }
      } else {
        const createResult = await createOrganizationMutation({
          groupId,
          data: {
            ...values,
          },
        }).unwrap()
        if (logo) {
          const logoResult = await uploadOrganizationLogoMutation({
            id: createResult.id,
            file: logo,
          }).unwrap()
          submitted && submitted(logoResult)
        } else {
          submitted && submitted(createResult)
        }
      }
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit organization',
        variant: 'destructive',
      })
    }
  }

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {organization ? (
            <SheetHeader>
              <SheetTitle>Merchant Organization</SheetTitle>
              <SheetDescription>ID: {organization.id}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New merchant organization</SheetTitle>
            </SheetHeader>
          )}
          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Organization Overview</CardTitle>
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
                <ImageUploader onImageUpload={setLogo} />
                <FormField
                  control={form.control}
                  name="stripeAccountId"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Stripe Account ID</FormLabel>
                      <Input
                        type="string"
                        placeholder="Stripe Account ID"
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
