import {
  useCreateMerchantGroupMutation,
  useUpdateMerchantGroupMutation,
  useUploadGroupLogoMutation,
} from '@/api/merchantApi'
import { useMerchantGroupUpdateForm } from '@/modules/merchant-groups/hook/form/useMerchantGroupUpdateForm'
import { MerchantGroupFormValues } from '@/modules/merchant-groups/types'
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
  WithSheetCallbacks,
  useToast,
} from '../../../admin-web-components'
import { MerchantGroupAdminDto } from '../../../backend-admin-sdk'
import { omit } from 'lodash'
import { useState } from 'react'
import { useMerchantGroupCreateForm } from '../hook/form/useMerchantGroupCreateForm'

export type GroupSheetFormProps = WithSheetCallbacks<MerchantGroupAdminDto> &
  ({ mode: 'create' } | { mode: 'update'; groupId: string; defaultValues?: MerchantGroupAdminDto })

export function GroupSheetForm(props: GroupSheetFormProps) {
  const [createGroupMutation, { isLoading: createLoading }] = useCreateMerchantGroupMutation()
  const [updateGroupMutation, { isLoading: updateLoading }] = useUpdateMerchantGroupMutation()
  const [uploadGroupLogoMutation] = useUploadGroupLogoMutation()

  const { toast } = useToast()

  const form =
    props.mode === 'update'
      ? useMerchantGroupUpdateForm({ defaultValues: props.defaultValues })
      : useMerchantGroupCreateForm()

  const [logo, setLogo] = useState<Blob | null>(null)

  const handleFormSubmit = async (values: MerchantGroupFormValues) => {
    try {
      if (props.mode === 'update') {
        const updatedResult = await updateGroupMutation({
          id: props.groupId,
          data: {
            ...values,
          },
        }).unwrap()
        if (logo) {
          await uploadGroupLogoMutation({
            id: updatedResult.id,
            file: logo,
          }).unwrap()
        }
      } else {
        const createResult = await createGroupMutation({
          data: {
            ...values,
          },
        }).unwrap()
        if (logo) {
          await uploadGroupLogoMutation({
            id: createResult.id,
            file: logo,
          }).unwrap()
        }
      }
      props.onSettled?.()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit group',
        variant: 'destructive',
      })
    }
  }

  const isLoading = createLoading || updateLoading
  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
          {props.mode === 'update' ? (
            <SheetHeader>
              <SheetTitle>Merchant Group</SheetTitle>
              <SheetDescription>ID: {props.groupId}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New merchant group</SheetTitle>
            </SheetHeader>
          )}

          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Group Overview</CardTitle>
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
              </CardContent>
            </Card>

            {props.mode === 'create' && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin User</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="admin.email"
                    render={({ field }) => (
                      <FormItem className="grid gap-1">
                        <FormLabel>Admin Email</FormLabel>
                        <Input type="email" placeholder="Email" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="admin.password"
                    render={({ field }) => (
                      <FormItem className="grid gap-1">
                        <FormLabel>Admin Password</FormLabel>
                        <Input autoComplete="false" type="string" placeholder="Password" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
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
