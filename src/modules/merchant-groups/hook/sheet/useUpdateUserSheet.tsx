import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { MerchantUserForm, MerchantUserFormValues } from '../../../../admin-web-components'
import { useAppDispatch } from '../../../../ui-shared-utils'

export const UPDATE_USER_SHEET_ID = 'update-user'
export const useUpdateUserSheet = (args: {
  isLoading: boolean
  groupMerchants: Array<{ id: string; name: string }>

  updateUser: (userId: string, values: MerchantUserFormValues) => void
}) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(UPDATE_USER_SHEET_ID))

  return {
    open: ({ defaultValues, userId }: { defaultValues?: MerchantUserFormValues; userId: string }) =>
      dispatch(
        openSheet({
          id: UPDATE_USER_SHEET_ID,
          children: (
            <MerchantUserForm mode="update" onSettled={close} defaultValues={defaultValues} userId={userId} {...args} />
          ),
        })
      ),
    close,
  }
}
