import { useCreateMerchantCustomGroupMutation, useUpdateMerchantCustomGroupMutation } from '@/api/merchantApi'
import { zodResolver } from '@hookform/resolvers/zod'
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
  WithSheetCallbacks,
  useToast,
} from '../../../admin-web-components'
import { MerchantCustomGroupAdminDto } from '../../../backend-admin-sdk'
import { omit } from 'lodash'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
})

type MerchantCustomGroupFormValues = z.infer<typeof formSchema>

export type CustomGroupSheetFormProps = WithSheetCallbacks<MerchantCustomGroupAdminDto> &
  ({ mode: 'create' } | { mode: 'update'; groupId: string; defaultValues?: MerchantCustomGroupAdminDto })

export function CustomGroupSheetForm(props: CustomGroupSheetFormProps) {
  const [createCustomGroupMutation, { isLoading: createLoading }] = useCreateMerchantCustomGroupMutation()
  const [updateCustomGroupMutation, { isLoading: updateLoading }] = useUpdateMerchantCustomGroupMutation()

  const { toast } = useToast()

  const form = useForm<MerchantCustomGroupFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
    ...(props.mode === 'update' ? { defaultValues: props.defaultValues } : {}),
  })

  const handleFormSubmit = async (values: MerchantCustomGroupFormValues) => {
    try {
      if (props.mode === 'update') {
        await updateCustomGroupMutation({
          id: props.groupId,
          data: {
            ...values,
          },
        }).unwrap()
      } else {
        await createCustomGroupMutation({
          data: {
            ...values,
          },
        }).unwrap()
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
              <SheetTitle>Merchant Custom CustomGroup</SheetTitle>
              <SheetDescription>ID: {props.groupId}</SheetDescription>
            </SheetHeader>
          ) : (
            <SheetHeader>
              <SheetTitle>New merchant custom group</SheetTitle>
            </SheetHeader>
          )}

          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Merchant CustomGroup Overview</CardTitle>
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
