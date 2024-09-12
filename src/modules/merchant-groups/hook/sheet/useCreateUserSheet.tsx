import { closeSheet, openSheet } from '@/modules/shared/slices/sheetManagerSlice'
import { MerchantUserForm, MerchantUserFormValues } from '../../../../admin-web-components'
import { MerchantAdminDto } from '../../../../backend-admin-sdk'
import { useAppDispatch } from '../../../../ui-shared-utils'

export const CREATE_USER_SHEET_ID = 'create-user'
export const useCreateUserSheet = (args: {
  groupMerchants: MerchantAdminDto[]
  isLoading: boolean
  createUser: (values: MerchantUserFormValues) => void
}) => {
  const dispatch = useAppDispatch()

  const close = () => dispatch(closeSheet(CREATE_USER_SHEET_ID))

  return {
    open: () =>
      dispatch(
        openSheet({
          id: CREATE_USER_SHEET_ID,
          children: <MerchantUserForm mode="create" onSettled={close} {...args} />,
        })
      ),
    close,
  }
}
